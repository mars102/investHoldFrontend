<template>
  <div class="space-y-4">
    <div class="mb-2">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Аналитика</h2>
      <p class="text-gray-500 text-sm">Как поживает твой портфель и торговая активность</p>
    </div>

    <AnalyticsStatsCards />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnalyticsAllocationChart />
      <AnalyticsTopAssets />
    </div>

    <AnalyticsTradeStats :trades="tradeStore.trades" :coins-by-id="coinsById" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnalyticsExchangeBreakdown :trades="tradeStore.trades" />
      <AnalyticsActivityChart :trades="tradeStore.trades" :posts="postStore.posts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'
import { useMyTradeStore } from '~/stores/trade'
import { usePostStore } from '~/stores/post'
import type { Coin } from '~/types/coins'

const portfolioStore = usePortfolioStore()
const tradeStore = useMyTradeStore()
const postStore = usePostStore()

const coins = ref<Coin[]>([])
const coinsById = computed<Record<number, Coin>>(() => Object.fromEntries(coins.value.map((c) => [c.id, c])))

onMounted(async () => {
  const { $api } = useNuxtApp()
  const [, coinsResponse] = await Promise.all([
    portfolioStore.fetchSummary(),
    $api<Coin[]>('/coins'),
    tradeStore.fetchTrades(),
    postStore.fetchPosts()
  ])
  coins.value = coinsResponse ?? []
})
</script>
