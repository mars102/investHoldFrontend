<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Вложено</h3>
        <UIcon name="i-heroicons-arrow-trending-up" class="w-5 h-5 text-blue-500" />
      </div>
      <p class="text-2xl font-bold text-gray-900 tabular-nums">$ {{ formatNumber(summary?.totalInvested) }}</p>
      <p class="text-xs text-gray-400 mt-1.5">За всё время</p>
    </div>

    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Текущая стоимость</h3>
        <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-emerald-500" />
      </div>
      <p class="text-2xl font-bold text-gray-900 tabular-nums">$ {{ formatNumber(summary?.totalCurrentValue) }}</p>
      <p class="text-xs mt-1.5" :class="isProfitable ? 'text-emerald-600' : 'text-red-600'">
        {{ formatPercent(summary?.totalProfitLossPercentage) }}
      </p>
    </div>

    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Общая прибыль</h3>
        <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-violet-500" />
      </div>
      <p class="text-2xl font-bold tabular-nums" :class="isProfitable ? 'text-emerald-600' : 'text-red-600'">
        {{ (summary?.totalProfitLoss ?? 0) >= 0 ? '+' : '' }}$ {{ formatNumber(summary?.totalProfitLoss) }}
      </p>
      <p class="text-xs text-gray-400 mt-1.5">ROI: {{ formatPercent(summary?.totalProfitLossPercentage) }}</p>
    </div>

    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Лучший актив</h3>
        <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-amber-500" />
      </div>
      <template v-if="bestHolding">
        <p class="text-2xl font-bold text-gray-900">{{ bestHolding.coin.ticker }}</p>
        <p class="text-xs text-emerald-600 mt-1.5 font-semibold">{{ formatPercent(bestHolding.profitLossPercentage) }}</p>
      </template>
      <p v-else class="text-2xl font-bold text-gray-300">—</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

const isProfitable = computed(() => (summary.value?.totalProfitLoss ?? 0) >= 0)

const bestHolding = computed(() => {
  const holdings = summary.value?.holdings ?? []
  if (!holdings.length) return null
  return [...holdings].sort((a, b) => b.profitLossPercentage - a.profitLossPercentage)[0]
})
</script>
