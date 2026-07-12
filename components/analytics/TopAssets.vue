<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
    <h3 class="text-sm font-bold text-gray-900 mb-4">Лучший и худший актив</h3>

    <div v-if="!holdings.length" class="h-24 flex items-center justify-center text-sm text-gray-400">
      Нет активов в портфеле
    </div>

    <div v-else class="grid gap-3" :class="worst ? 'grid-cols-2' : 'grid-cols-1'">
      <div class="rounded-md bg-emerald-50 border border-emerald-100 p-4">
        <p class="text-[10px] font-semibold text-emerald-700/70 uppercase tracking-wide mb-1">Лучший</p>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
            <img v-if="best!.coin.logoUrl" :src="best!.coin.logoUrl" class="w-full h-full object-cover" />
            <span v-else>{{ best!.coin.ticker.slice(0, 1) }}</span>
          </div>
          <span class="text-sm font-bold text-gray-900">{{ best!.coin.ticker }}</span>
        </div>
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ formatPercent(best!.profitLossPercentage) }}</p>
        <p class="text-[11px] text-gray-500 tabular-nums">$ {{ formatNumber(best!.currentValue) }}</p>
      </div>

      <div v-if="worst" class="rounded-md bg-red-50 border border-red-100 p-4">
        <p class="text-[10px] font-semibold text-red-700/70 uppercase tracking-wide mb-1">Худший</p>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
            <img v-if="worst.coin.logoUrl" :src="worst.coin.logoUrl" class="w-full h-full object-cover" />
            <span v-else>{{ worst.coin.ticker.slice(0, 1) }}</span>
          </div>
          <span class="text-sm font-bold text-gray-900">{{ worst.coin.ticker }}</span>
        </div>
        <p class="text-lg font-bold text-red-600 tabular-nums">{{ formatPercent(worst.profitLossPercentage) }}</p>
        <p class="text-[11px] text-gray-500 tabular-nums">$ {{ formatNumber(worst.currentValue) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

const holdings = computed(() => summary.value?.holdings ?? [])

const sorted = computed(() => [...holdings.value].sort((a, b) => b.profitLossPercentage - a.profitLossPercentage))

const best = computed(() => sorted.value[0] ?? null)
const worst = computed(() => (sorted.value.length > 1 ? sorted.value[sorted.value.length - 1]! : null))
</script>
