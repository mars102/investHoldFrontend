<template>
  <div class="h-full flex flex-col gap-3">
    <PortfolioBalanceSummary />

    <!-- Watchlist -->
    <div class="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 dark:bg-gray-800 dark:border-gray-800">
      <div class="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 dark:border-gray-800">
        <h3 class="text-xs font-bold text-gray-900 dark:text-white">Ваши монеты</h3>
        <span class="text-[10px] text-gray-400 font-medium dark:text-gray-500">{{ sortedHoldings.length }}</span>
      </div>

      <div class="divide-y divide-gray-50 overflow-y-auto flex-1 min-h-0 dark:divide-gray-800">
        <div
          v-for="holding in sortedHoldings"
          :key="holding.id"
          class="group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
          :class="holding.coinId === selectedCoinId ? 'bg-blue-50/60' : ''"
          @click="emit('select', holding)"
        >
          <span
            class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-colors"
            :class="holding.coinId === selectedCoinId ? 'bg-blue-500' : 'bg-transparent'"
          />

          <div class="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
            <img v-if="holding.coin.logoUrl" :src="holding.coin.logoUrl" class="w-full h-full object-cover" />
            <span v-else>{{ holding.coin.ticker.slice(0, 1) }}</span>
          </div>

          <div class="min-w-0 flex-1 leading-tight">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-gray-900 text-xs dark:text-white">{{ holding.coin.ticker }}</span>
              <span class="font-bold text-gray-900 text-xs tabular-nums dark:text-white">$ {{ formatNumber(holding.currentValue) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] text-gray-400 truncate dark:text-gray-500">{{ formatQuantity(Number(holding.totalQuantity)) }}</span>
              <span
                class="text-[10px] font-semibold shrink-0"
                :class="holding.profitLossPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'"
              >
                {{ holding.profitLossPercentage >= 0 ? '+' : '' }}{{ holding.profitLossPercentage.toFixed(2) }}%
              </span>
            </div>
          </div>

          <button
            class="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-700 transition-all dark:text-gray-500 dark:hover:text-gray-200"
            title="Обновить цену"
            :disabled="portfolioStore.refreshingCoinId !== null"
            @click.stop="portfolioStore.refreshCoinPrice(holding.coinId)"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-3 h-3"
              :class="portfolioStore.refreshingCoinId === holding.coinId ? 'animate-spin' : ''"
            />
          </button>
        </div>

        <div v-if="!sortedHoldings.length" class="px-3 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
          Нет активов в портфеле
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'
import type { Holding } from '~/types/portfolio'

defineProps<{
  selectedCoinId: number | null
}>()

const emit = defineEmits<{
  select: [holding: Holding]
}>()

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

const sortedHoldings = computed(() =>
  [...(summary.value?.holdings ?? [])].sort((a, b) => b.currentValue - a.currentValue)
)
</script>
