<template>
  <div class="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_260px] gap-6 items-start">
    <div class="sticky top-6 mt-12 flex flex-col gap-4">
      <PortfolioBalanceSummary />

      <TradeCoinInfoPanel
        v-if="formPreview"
        :coin="formPreview.coinId ? coinsById[formPreview.coinId] : undefined"
        :type="formPreview.type"
        :quantity="formPreview.quantity"
        :price-per-unit="formPreview.pricePerUnit"
      />
    </div>

    <div class="w-full space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Лента сделок</h1>
        <button
          class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          :disabled="tradeStore.loading"
          @click="tradeStore.fetchTrades()"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="tradeStore.loading ? 'animate-spin' : ''" />
        </button>
      </div>

      <div ref="composerAnchor" class="min-h-[72px]">
        <Teleport to="body" :disabled="!isComposerPinned">
          <div
            :class="isComposerPinned
              ? 'fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 shadow-2xl'
              : ''"
          >
            <TradeComposer />
          </div>
        </Teleport>
      </div>

      <!-- Loading -->
      <div v-if="tradeStore.loading && !tradeStore.trades.length" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-64 w-full rounded-lg" />
      </div>

      <!-- Error -->
      <UAlert
        v-else-if="tradeStore.error"
        color="red"
        variant="soft"
        title="Не удалось загрузить сделки"
        :description="tradeStore.error"
      />

      <!-- Empty -->
      <div v-else-if="!sortedTrades.length" class="text-center text-gray-400 py-16 rounded-lg bg-white border border-gray-100">
        Сделок пока нет — поделитесь первой!
      </div>

      <!-- No results after filtering -->
      <div v-else-if="!filteredTrades.length" class="text-center text-gray-400 py-16 rounded-lg bg-white border border-gray-100">
        Ничего не найдено по этим фильтрам
      </div>

      <!-- Feed -->
      <div v-else class="space-y-4">
        <TradePostCard
          v-for="trade in filteredTrades"
          :key="trade.id"
          :trade="trade"
          :coin="coinsById[trade.coinId as number]"
          :cost-basis="costBasisByTradeId.get(trade.id)"
        />
      </div>
    </div>

    <div class="sticky top-6 mt-12">
      <TradeFilters
        v-model="filters"
        :coin-options="coinOptions"
        :exchange-options="exchangeOptions"
        :result-count="filteredTrades.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyTradeStore } from '~/stores/trade'
import type { Coin } from '~/types/coins'
import type { TradeFiltersState } from '~/components/trade/Filters.vue'

const tradeStore = useMyTradeStore()
const coins = ref<Coin[]>([])
const formPreview = useTradeFormPreview()

// While the composer's natural spot in the feed is scrolled out of view,
// float a copy of it at the bottom of the screen so there's always a way
// to start a trade. While that floating copy is expanded, freeze the feed
// so it can't drift out from under the user mid-entry.
const composerAnchor = ref<HTMLElement | null>(null)
const isAnchorVisible = ref(true)
const isComposerPinned = computed(() => !isAnchorVisible.value)

useIntersectionObserver(composerAnchor, ([entry]) => {
  isAnchorVisible.value = entry?.isIntersecting ?? true
})

const scrollLocked = useScrollLock()
watchEffect(() => {
  scrollLocked.value = isComposerPinned.value && formPreview.value !== null
})

onUnmounted(() => {
  scrollLocked.value = false
})

const coinsById = computed<Record<number, Coin>>(() =>
  Object.fromEntries(coins.value.map((coin) => [coin.id, coin]))
)

const sortedTrades = computed(() =>
  [...tradeStore.trades].sort(
    (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  )
)

const costBasisByTradeId = computed(() => computeCostBasisTimeline(tradeStore.trades))

const filters = reactive<TradeFiltersState>({
  search: '',
  type: 'all',
  coinId: 'all',
  exchangeSource: 'all',
  pnl: 'all'
})

const coinOptions = computed(() => {
  const seen = new Map<number, Coin>()
  for (const trade of tradeStore.trades) {
    const coin = coinsById.value[trade.coinId as number]
    if (coin && !seen.has(coin.id)) seen.set(coin.id, coin)
  }
  const sorted = [...seen.values()].sort((a, b) => a.ticker.localeCompare(b.ticker))
  return [
    { label: 'Все монеты', value: 'all' },
    ...sorted.map((coin) => ({ label: `${coin.fullName} (${coin.ticker})`, value: String(coin.id) }))
  ]
})

const exchangeOptions = computed(() => {
  const set = new Set<string>()
  for (const trade of tradeStore.trades) {
    if (trade.exchangeSource) set.add(trade.exchangeSource)
  }
  return [{ label: 'Все биржи', value: 'all' }, ...[...set].sort().map((ex) => ({ label: ex, value: ex }))]
})

const filteredTrades = computed(() =>
  sortedTrades.value.filter((trade) => {
    if (filters.type !== 'all' && trade.type?.toString().toLowerCase() !== filters.type) return false
    if (filters.coinId !== 'all' && Number(trade.coinId) !== Number(filters.coinId)) return false
    if (filters.exchangeSource !== 'all' && trade.exchangeSource !== filters.exchangeSource) return false

    if (filters.pnl !== 'all') {
      const pnl = computeTradePnlPercent(trade, coinsById.value[trade.coinId as number], costBasisByTradeId.value.get(trade.id))
      if (filters.pnl === 'profit' && pnl < 0) return false
      if (filters.pnl === 'loss' && pnl >= 0) return false
    }

    const query = filters.search.trim().toLowerCase()
    if (query) {
      const coin = coinsById.value[trade.coinId as number]
      const haystack = `${trade.description ?? ''} ${coin?.fullName ?? ''} ${coin?.ticker ?? ''}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
)

onMounted(async () => {
  const { $api } = useNuxtApp()
  const [, coinsResponse] = await Promise.all([tradeStore.fetchTrades(), $api<Coin[]>('/coins')])
  coins.value = coinsResponse ?? []
})
</script>
