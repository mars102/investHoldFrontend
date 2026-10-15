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
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Лента</h1>
        <div class="flex items-center gap-1">
          <button
            class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title="Экспортировать сделки в CSV"
            :disabled="!tradeStore.trades.length"
            @click="exportTrades"
          >
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
          </button>
          <button
            class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title="Обновить"
            :disabled="isLoading"
            @click="refresh"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
          </button>
        </div>
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
      <div v-if="isLoading && !hasAnyContent" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-64 w-full rounded-lg" />
      </div>

      <!-- Error -->
      <UAlert
        v-else-if="feedStore.error"
        color="red"
        variant="soft"
        title="Не удалось загрузить ленту"
        :description="feedStore.error"
      />

      <!-- Empty -->
      <div v-else-if="!hasAnyContent" class="text-center text-gray-400 py-16 rounded-lg bg-white border border-gray-100 dark:text-gray-500 dark:bg-gray-800 dark:border-gray-800">
        Пока ничего нет — поделитесь первым постом или сделкой!
      </div>

      <!-- Search results (flat, client-side, over full trade+post history) -->
      <div v-else-if="isSearching" class="space-y-4">
        <div v-if="!searchResults.length" class="text-center text-gray-400 py-16 rounded-lg bg-white border border-gray-100 dark:text-gray-500 dark:bg-gray-800 dark:border-gray-800">
          Ничего не найдено по запросу «{{ filters.search }}»
        </div>
        <template v-for="feedItem in searchResults" :key="`${feedItem.type}-${(feedItem.item as any).id}`">
          <TradePostCard
            v-if="feedItem.type === 'trade'"
            :trade="(feedItem.item as Trade)"
            :coin="coinsById[(feedItem.item as Trade).coinId as number]"
            :cost-basis="costBasisByTradeId.get((feedItem.item as Trade).id)"
            :timing-score="timingScoreByTradeId.get(Number((feedItem.item as Trade).id))"
          />
          <PostCard
            v-else
            :post="(feedItem.item as Post)"
            :coin="coinsById[(feedItem.item as Post).coinId as number]"
          />
        </template>
      </div>

      <!-- Grouped by position -->
      <div v-else-if="filters.grouped" class="space-y-4">
        <template v-for="entry in groupedEntries" :key="`${entry.kind}-${entry.kind === 'position' ? entry.position.coinId : entry.post.id}`">
          <PositionCard v-if="entry.kind === 'position'" :position="entry.position" />
          <PostCard v-else :post="entry.post" :coin="coinsById[entry.post.coinId as number]" />
        </template>
      </div>

      <!-- Plain feed -->
      <div v-else class="space-y-4">
        <template v-for="feedItem in feedStore.items" :key="`${feedItem.type}-${(feedItem.item as any).id}`">
          <TradePostCard
            v-if="feedItem.type === 'trade'"
            :trade="(feedItem.item as Trade)"
            :coin="coinsById[(feedItem.item as Trade).coinId as number]"
            :cost-basis="costBasisByTradeId.get((feedItem.item as Trade).id)"
            :timing-score="timingScoreByTradeId.get(Number((feedItem.item as Trade).id))"
          />
          <InsightsCard
            v-else-if="feedItem.type === 'insight'"
            :insight="(feedItem.item as Insight)"
          />
          <PostCard
            v-else
            :post="(feedItem.item as Post)"
            :coin="coinsById[(feedItem.item as Post).coinId as number]"
          />
        </template>

        <div v-if="feedStore.hasMore" class="flex justify-center pt-2">
          <UButton color="gray" variant="soft" :loading="feedStore.loadingMore" @click="feedStore.loadMore()">
            Показать ещё
          </UButton>
        </div>
      </div>
    </div>

    <div class="sticky top-6 mt-12">
      <TradeFilters
        v-model="filters"
        :coins="coins"
        :result-count="isSearching ? searchResults.length : (filters.grouped ? groupedEntries.length : feedStore.total)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyTradeStore } from '~/stores/trade'
import { useFeedStore } from '~/stores/feed'
import { usePostStore } from '~/stores/post'
import { usePortfolioStore } from '~/stores/portfolio'
import { useAnalyticsStore } from '~/stores/analytics'
import type { Coin } from '~/types/coins'
import type { Trade } from '~/types/trade'
import type { Post } from '~/types/post'
import type { Insight } from '~/types/analytics'
import type { Holding } from '~/types/portfolio'
import type { Position } from '~/utils/position'
import type { FeedFiltersState } from '~/components/trade/Filters.vue'

const tradeStore = useMyTradeStore()
const feedStore = useFeedStore()
const postStore = usePostStore()
const portfolioStore = usePortfolioStore()
const analyticsStore = useAnalyticsStore()
const { summary } = storeToRefs(portfolioStore)
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

const holdingsByCoinId = computed<Record<number, Holding>>(() =>
  Object.fromEntries((summary.value?.holdings ?? []).map((h) => [h.coinId, h]))
)

// The cost-basis (average price / realized P&L) replay needs the user's full,
// unpaginated trade history — the feed itself is paginated and mixes in posts,
// so it can't be used as the source for that calculation.
const costBasisByTradeId = computed(() => computeCostBasisTimeline(tradeStore.trades))

const timingScoreByTradeId = computed(() => {
  const map = new Map<number, number>()
  for (const item of analyticsStore.tradeTiming?.trades ?? []) {
    if (item.score != null) map.set(item.transactionId, item.score)
  }
  return map
})

const filters = reactive<FeedFiltersState>({
  type: 'all',
  coinId: 'all',
  grouped: false,
  search: ''
})

watch(
  () => [filters.type, filters.coinId],
  ([type, coinId]) => {
    feedStore.setFilters(type as FeedFiltersState['type'], coinId !== 'all' ? Number(coinId) : null)
    feedStore.fetchFeed()
  }
)

const isSearching = computed(() => filters.search.trim().length > 0)

const searchResults = computed(() => {
  const filterCoinId = filters.coinId !== 'all' ? Number(filters.coinId) : null
  return searchFeed(tradeStore.trades, postStore.posts, coinsById.value, filters.search, filters.type, filterCoinId)
})

const groupedFeed = computed(() => {
  const filterCoinId = filters.coinId !== 'all' ? Number(filters.coinId) : null
  const trades = filterCoinId ? tradeStore.trades.filter((t: Trade) => Number(t.coinId) === filterCoinId) : tradeStore.trades
  const posts = filterCoinId ? postStore.posts.filter((p) => Number(p.coinId) === filterCoinId) : postStore.posts
  return groupByPosition(trades, posts, coinsById.value, holdingsByCoinId.value)
})

type GroupedEntry = { kind: 'position'; position: Position } | { kind: 'post'; post: Post }

const groupedEntries = computed<GroupedEntry[]>(() => {
  const positionEntries: GroupedEntry[] = groupedFeed.value.positions.map((position) => ({ kind: 'position', position }))
  const postEntries: GroupedEntry[] = groupedFeed.value.unassignedPosts.map((post) => ({ kind: 'post', post }))
  return [...positionEntries, ...postEntries].sort((a, b) => {
    const dateA = a.kind === 'position' ? a.position.lastActivityDate : a.post.createdAt
    const dateB = b.kind === 'position' ? b.position.lastActivityDate : b.post.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
})

const isLoading = computed(() => feedStore.loading || tradeStore.loading || postStore.loading)
const hasAnyContent = computed(() => {
  if (isSearching.value) return true
  return filters.grouped ? groupedEntries.value.length > 0 : feedStore.items.length > 0
})

async function refresh() {
  await Promise.all([feedStore.fetchFeed(), tradeStore.fetchTrades(), postStore.fetchPosts()])
}

function exportTrades() {
  const csv = tradesToCsv(tradeStore.trades, coinsById.value)
  const date = new Date().toISOString().slice(0, 10)
  downloadCsv(`investhold-trades-${date}.csv`, csv)
}

onMounted(async () => {
  const { $api } = useNuxtApp()
  const [, coinsResponse] = await Promise.all([
    tradeStore.fetchTrades(),
    $api<Coin[]>('/coins'),
    feedStore.fetchFeed(),
    postStore.fetchPosts(),
    portfolioStore.summary ? Promise.resolve() : portfolioStore.fetchSummary(),
    analyticsStore.fetchTradeTiming()
  ])
  coins.value = coinsResponse ?? []
})
</script>
