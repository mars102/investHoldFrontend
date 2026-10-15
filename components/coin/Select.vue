<template>
  <USelectMenu
    v-model="model"
    v-model:query="query"
    :options="filteredCoins"
    value-attribute="id"
    option-attribute="fullName"
    :search-attributes="['ticker', 'fullName']"
    searchable
    searchable-placeholder="Название или тикер..."
    :placeholder="placeholder"
    :ui-menu="{ width: 'w-full min-w-[18rem]', height: 'max-h-72', option: { base: 'py-1.5' } }"
  >
    <template #label>
      <div v-if="selectedCoin" class="flex items-center gap-2 min-w-0">
        <CoinLogo :coin="selectedCoin" class="w-5 h-5" />
        <span class="font-semibold truncate">{{ selectedCoin.ticker }}</span>
        <span class="text-gray-400 dark:text-gray-500 tabular-nums text-xs ml-auto shrink-0">$ {{ formatPrice(selectedCoin.currentPrice) }}</span>
      </div>
      <span v-else class="text-gray-400 dark:text-gray-500 truncate">{{ placeholder }}</span>
    </template>

    <template #trailing>
      <span
        v-if="clearable && selectedCoin"
        role="button"
        class="pointer-events-auto flex text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        title="Сбросить"
        @click.stop.prevent="model = undefined"
      >
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </span>
      <UIcon v-else name="i-heroicons-chevron-up-down" class="w-4 h-4 text-gray-400" />
    </template>

    <template #option="{ option: coin }">
      <div class="flex items-center gap-2.5 w-full min-w-0">
        <CoinLogo :coin="coin" class="w-7 h-7" />
        <div class="min-w-0 flex-1 leading-tight">
          <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ coin.ticker }}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ coin.fullName }}</div>
        </div>
        <div class="text-right leading-tight shrink-0">
          <div class="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">$ {{ formatPrice(coin.currentPrice) }}</div>
          <div
            v-if="coin.priceChangePercentage24h != null"
            class="text-[11px] font-semibold tabular-nums"
            :class="coin.priceChangePercentage24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
          >
            {{ coin.priceChangePercentage24h >= 0 ? '+' : '' }}{{ Number(coin.priceChangePercentage24h).toFixed(2) }}%
          </div>
        </div>
      </div>
    </template>

    <template #option-empty="{ query: q }">
      Монета «{{ q }}» не найдена
    </template>

    <template #empty>
      Загрузка монет...
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import type { Coin } from '~/types/coins'

const MAX_RESULTS = 50

const props = withDefaults(
  defineProps<{
    coins: Coin[]
    placeholder?: string
    clearable?: boolean
    excludeIds?: number[]
  }>(),
  {
    placeholder: 'Выберите монету',
    clearable: false,
    excludeIds: () => []
  }
)

const model = defineModel<number | string | undefined>()
const query = ref('')

const selectedCoin = computed(() =>
  model.value ? props.coins.find((c) => c.id === Number(model.value)) ?? null : null
)

const availableCoins = computed(() => {
  const excluded = new Set(props.excludeIds)
  return props.coins.filter((c) => !excluded.has(c.id))
})

// Ticker/name prefix matches rank above substring matches; without a query
// the list is ordered by market-cap rank. Results are capped so a long coin
// list doesn't render hundreds of rows.
const filteredCoins = computed(() => {
  const q = query.value.trim().toLowerCase()

  if (!q) {
    const byRank = [...availableCoins.value].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity))
    const top = byRank.slice(0, MAX_RESULTS)
    if (selectedCoin.value && !top.includes(selectedCoin.value)) top.unshift(selectedCoin.value)
    return top
  }

  const score = (coin: Coin) => {
    const ticker = coin.ticker.toLowerCase()
    const name = coin.fullName.toLowerCase()
    if (ticker === q) return 0
    if (ticker.startsWith(q)) return 1
    if (name.startsWith(q)) return 2
    if (name.split(/\s+/).some((word) => word.startsWith(q))) return 3
    if (ticker.includes(q) || name.includes(q)) return 4
    return -1
  }

  return availableCoins.value
    .map((coin) => ({ coin, s: score(coin) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => a.s - b.s || (a.coin.rank || Infinity) - (b.coin.rank || Infinity))
    .slice(0, MAX_RESULTS)
    .map((x) => x.coin)
})
</script>
