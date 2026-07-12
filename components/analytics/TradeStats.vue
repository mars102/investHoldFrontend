<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
    <h3 class="text-sm font-bold text-gray-900 mb-4">Статистика по сделкам</h3>

    <div v-if="!trades.length" class="h-24 flex items-center justify-center text-sm text-gray-400">
      Сделок пока нет
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Win rate</p>
          <p class="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{{ winRate.toFixed(0) }}%</p>
          <p class="text-[11px] text-gray-400">{{ winningCount }} из {{ trades.length }} сделок в плюсе</p>
        </div>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Средний P&L</p>
          <p class="text-xl font-bold tabular-nums mt-0.5" :class="avgPnl >= 0 ? 'text-emerald-600' : 'text-red-600'">
            {{ avgPnl >= 0 ? '+' : '' }}{{ avgPnl.toFixed(2) }}%
          </p>
          <p class="text-[11px] text-gray-400">на сделку</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div v-if="bestTrade" class="rounded-md bg-emerald-50 border border-emerald-100 p-3">
          <p class="text-[10px] font-semibold text-emerald-700/70 uppercase tracking-wide">Лучшая сделка</p>
          <p class="text-sm font-bold text-gray-900 mt-1">{{ coinTicker(bestTrade.trade) }}</p>
          <p class="text-xs font-bold text-emerald-600 tabular-nums">+{{ bestTrade.pnl.toFixed(2) }}%</p>
        </div>
        <div v-if="worstTrade" class="rounded-md bg-red-50 border border-red-100 p-3">
          <p class="text-[10px] font-semibold text-red-700/70 uppercase tracking-wide">Худшая сделка</p>
          <p class="text-sm font-bold text-gray-900 mt-1">{{ coinTicker(worstTrade.trade) }}</p>
          <p class="text-xs font-bold text-red-600 tabular-nums">{{ worstTrade.pnl.toFixed(2) }}%</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Trade } from '~/types/trade'
import type { Coin } from '~/types/coins'
import type { TradeCostBasis } from '~/utils/costBasis'

const props = defineProps<{
  trades: Trade[]
  coinsById: Record<number, Coin>
}>()

const costBasisByTradeId = computed(() => computeCostBasisTimeline(props.trades))

const withPnl = computed(() =>
  props.trades.map((trade) => ({
    trade,
    pnl: computeTradePnlPercent(trade, props.coinsById[trade.coinId as number], costBasisByTradeId.value.get(trade.id))
  }))
)

const winningCount = computed(() => withPnl.value.filter((t) => t.pnl >= 0).length)
const winRate = computed(() => (props.trades.length ? (winningCount.value / props.trades.length) * 100 : 0))
const avgPnl = computed(() =>
  withPnl.value.length ? withPnl.value.reduce((sum, t) => sum + t.pnl, 0) / withPnl.value.length : 0
)

const sortedByPnl = computed(() => [...withPnl.value].sort((a, b) => b.pnl - a.pnl))
const bestTrade = computed(() => sortedByPnl.value[0] ?? null)
const worstTrade = computed(() =>
  sortedByPnl.value.length > 1 ? sortedByPnl.value[sortedByPnl.value.length - 1]! : null
)

function coinTicker(trade: Trade) {
  return props.coinsById[trade.coinId as number]?.ticker ?? '—'
}
</script>
