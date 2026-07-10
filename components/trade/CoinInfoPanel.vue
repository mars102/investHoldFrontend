<template>
  <div class="rounded-md bg-blue-50/60 border border-blue-100 p-3 flex flex-col gap-2.5 h-fit">
    <div v-if="!coin" class="text-xs text-blue-700/70 py-2 text-center">
      Выберите монету
    </div>

    <template v-else>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
          <img v-if="coin.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
          <span v-else>{{ coin.ticker.slice(0, 1) }}</span>
        </div>
        <span class="text-xs font-bold text-gray-900">{{ coin.ticker }}</span>
      </div>

      <div>
        <p class="text-[10px] font-semibold text-blue-700/70 uppercase tracking-wide">Баланс по монете</p>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs font-bold text-gray-900 tabular-nums">{{ formatQuantity(currentQty) }} {{ coin.ticker }}</span>
          <span class="text-xs font-bold text-gray-900 tabular-nums">$ {{ formatNumber(currentQty * (coin.currentPrice || 0)) }}</span>
        </div>
      </div>

      <div>
        <p class="text-[10px] font-semibold text-blue-700/70 uppercase tracking-wide">Средняя цена</p>
        <p class="text-xs font-bold text-gray-900 tabular-nums mt-0.5">
          {{ currentAvg ? `$ ${formatPrice(currentAvg)}` : '—' }}
        </p>
      </div>

      <div v-if="preview" class="pt-2 border-t border-blue-100">
        <template v-if="preview.kind === 'buy'">
          <p class="text-[10px] font-semibold text-blue-700/70 uppercase tracking-wide">Новая средняя цена</p>
          <p class="text-xs font-bold text-gray-900 tabular-nums mt-0.5">$ {{ formatPrice(preview.newAvgPrice) }}</p>
          <p
            v-if="preview.changePercent !== null"
            class="text-[11px] font-bold tabular-nums"
            :class="preview.changePercent <= 0 ? 'text-emerald-600' : 'text-amber-600'"
          >
            {{ preview.changePercent >= 0 ? '+' : '' }}{{ preview.changePercent.toFixed(2) }}%
          </p>
        </template>
        <template v-else>
          <p class="text-[10px] font-semibold text-blue-700/70 uppercase tracking-wide">Продажа позиции</p>
          <p class="text-xs font-bold text-gray-900 tabular-nums mt-0.5">{{ preview.percentOfPosition.toFixed(0) }}% позиции</p>

          <div class="flex items-center justify-between mt-1.5 text-[11px]">
            <span class="text-gray-500">Куплено за</span>
            <span class="font-bold text-gray-900 tabular-nums">$ {{ formatNumber(preview.costBasisAmount) }}</span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-gray-500">Продаю за</span>
            <span class="font-bold text-gray-900 tabular-nums">$ {{ formatNumber(preview.proceedsAmount) }}</span>
          </div>

          <div v-if="preview.pnlPercent !== null" class="flex items-center justify-between text-[11px] mt-1">
            <span class="text-gray-500">Результат</span>
            <span class="font-bold tabular-nums" :class="preview.pnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600'">
              {{ preview.pnlAmount >= 0 ? '+' : '' }}$ {{ formatNumber(preview.pnlAmount) }}
              ({{ preview.pnlPercent >= 0 ? '+' : '' }}{{ preview.pnlPercent.toFixed(2) }}%)
            </span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Coin } from '~/types/coins'
import { usePortfolioStore } from '~/stores/portfolio'

const props = defineProps<{
  coin: Coin | undefined
  type: string
  quantity: number
  pricePerUnit: number
}>()

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

onMounted(() => {
  if (!summary.value) {
    portfolioStore.fetchSummary()
  }
})

const holding = computed(() => summary.value?.holdings.find((h) => h.coinId === props.coin?.id))

const currentQty = computed(() => (holding.value ? Number(holding.value.totalQuantity) : 0))
const currentAvg = computed(() => (holding.value ? Number(holding.value.averageBuyPrice) : 0))

const preview = computed(() => {
  if (!props.coin) return null

  const quantity = Number(props.quantity)
  const price = Number(props.pricePerUnit)
  if (!quantity || !price) return null

  const isBuy = props.type?.toString().toLowerCase() === 'buy'

  if (isBuy) {
    const newQty = currentQty.value + quantity
    const newAvgPrice = (currentQty.value * currentAvg.value + quantity * price) / newQty
    const changePercent = currentAvg.value > 0 ? ((newAvgPrice - currentAvg.value) / currentAvg.value) * 100 : null

    return { kind: 'buy' as const, newAvgPrice, changePercent }
  }

  // Selling: show how much of the position this trade closes out, and the
  // realized P&L of the sale price against the average cost basis — the
  // average price itself doesn't change from a sale, so it's not useful here.
  if (currentQty.value <= 0) return null

  const percentOfPosition = Math.min((quantity / currentQty.value) * 100, 100)
  const pnlPercent = currentAvg.value > 0 ? ((price - currentAvg.value) / currentAvg.value) * 100 : null
  const costBasisAmount = currentAvg.value * quantity
  const proceedsAmount = price * quantity
  const pnlAmount = proceedsAmount - costBasisAmount

  return { kind: 'sell' as const, percentOfPosition, pnlPercent, costBasisAmount, proceedsAmount, pnlAmount }
})
</script>
