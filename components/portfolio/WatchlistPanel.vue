<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 dark:bg-gray-800 dark:border-gray-800">
    <div class="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 dark:border-gray-800">
      <h3 class="text-xs font-bold text-gray-900 dark:text-white">Watchlist</h3>
      <button
        class="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        title="Добавить монету"
        @click="isPicking = !isPicking"
      >
        <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div v-if="isPicking" class="p-2 border-b border-gray-100 dark:border-gray-800">
      <CoinSelect
        :model-value="undefined"
        :coins="coins"
        :exclude-ids="excludedIds"
        placeholder="Найти монету..."
        @update:model-value="onPick"
      />
    </div>

    <div class="divide-y divide-gray-50 overflow-y-auto flex-1 min-h-0 dark:divide-gray-800">
      <div
        v-for="coin in watchedCoins"
        :key="coin.id"
        class="group flex items-center gap-2 px-3 py-2"
      >
        <div class="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
          <img v-if="coin.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
          <span v-else>{{ coin.ticker.slice(0, 1) }}</span>
        </div>

        <div class="min-w-0 flex-1 leading-tight">
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-gray-900 text-xs dark:text-white">{{ coin.ticker }}</span>
            <span class="font-bold text-gray-900 text-xs tabular-nums dark:text-white">$ {{ formatPrice(coin.currentPrice) }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] text-gray-400 truncate dark:text-gray-500">{{ coin.fullName }}</span>
            <span
              class="text-[10px] font-semibold shrink-0"
              :class="coin.priceChangePercentage24h >= 0 ? 'text-emerald-600' : 'text-red-600'"
            >
              {{ coin.priceChangePercentage24h >= 0 ? '+' : '' }}{{ coin.priceChangePercentage24h.toFixed(2) }}%
            </span>
          </div>
        </div>

        <button
          class="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-700 transition-all dark:text-gray-500 dark:hover:text-gray-200"
          title="Убрать из watchlist"
          @click="watchlist.remove(coin.id)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>

      <div v-if="!watchedCoins.length" class="px-3 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
        Пока пусто — добавьте монеты, за которыми хотите следить
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coin } from '~/types/coins'

const props = defineProps<{
  heldCoinIds: number[]
}>()

const watchlist = useWatchlist()
const coins = ref<Coin[]>([])
const isPicking = ref(false)

onMounted(async () => {
  const { $api } = useNuxtApp()
  coins.value = await $api<Coin[]>('/coins')
})

const watchedCoins = computed(() =>
  coins.value
    .filter((c) => watchlist.coinIds.value.includes(c.id))
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
)

const excludedIds = computed(() => [...props.heldCoinIds, ...watchlist.coinIds.value])

function onPick(value: string | number | undefined) {
  const coinId = Number(value)
  if (coinId) {
    watchlist.add(coinId)
    isPicking.value = false
  }
}
</script>
