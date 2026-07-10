<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm p-3 shrink-0">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Баланс портфеля</p>
      <button
        class="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        :title="isBalanceHidden ? 'Показать баланс' : 'Скрыть баланс'"
        @click="isBalanceHidden = !isBalanceHidden"
      >
        <UIcon :name="isBalanceHidden ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'" class="w-3 h-3" />
      </button>
    </div>

    <div class="flex items-center gap-2 mt-1">
      <p class="text-lg font-bold text-gray-900 tabular-nums">
        <span v-if="isBalanceHidden">••••••</span>
        <span v-else>$ {{ formatNumber(summary?.totalCurrentValue) }}</span>
      </p>
      <template v-if="!isBalanceHidden">
        <span
          class="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
          :class="totalPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
        >
          {{ formatPercent(summary?.totalProfitLossPercentage) }}
        </span>
      </template>
    </div>

    <div v-if="!isBalanceHidden" class="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100 text-[10px]">
      <span class="text-gray-400">Вложено: <span class="font-bold text-gray-700">$ {{ formatNumber(summary?.totalInvested) }}</span></span>
      <span class="text-gray-400">Активов: <span class="font-bold text-gray-700">{{ summary?.holdingsCount ?? 0 }}</span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

const isBalanceHidden = ref(false)

const totalPositive = computed(() => (summary.value?.totalProfitLoss ?? 0) >= 0)

onMounted(() => {
  if (!summary.value) {
    portfolioStore.fetchSummary()
  }
})
</script>
