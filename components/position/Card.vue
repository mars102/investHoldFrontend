<template>
  <article class="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 p-4 pb-3">
      <div class="w-10 h-10 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
        <img v-if="position.coin?.logoUrl" :src="position.coin.logoUrl" class="w-full h-full object-cover" />
        <span v-else>{{ position.coin?.ticker?.slice(0, 1) }}</span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-gray-900 text-sm">{{ position.coin?.fullName ?? 'Монета' }}</span>
          <span class="text-gray-400 text-xs">{{ position.coin?.ticker }}</span>
          <span
            class="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
            :class="position.isClosed ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'"
          >
            {{ position.isClosed ? 'Закрыта' : 'Открыта' }}
          </span>
        </div>
        <div class="text-xs text-gray-400 mt-0.5">
          {{ position.trades.length }} сделок<span v-if="position.posts.length"> · {{ position.posts.length }} постов</span>
          · последняя активность {{ formatRelativeTime(position.lastActivityDate) }}
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-3 gap-2 px-4 pb-3">
      <div>
        <p class="text-[10px] text-gray-400">{{ position.isClosed ? 'Было вложено' : 'Сейчас в позиции' }}</p>
        <p class="text-sm font-bold text-gray-900 tabular-nums mt-0.5">$ {{ formatNumber(position.isClosed ? totalInvested : (position.holding?.currentValue ?? 0)) }}</p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400">Средняя цена</p>
        <p class="text-sm font-bold text-gray-900 tabular-nums mt-0.5">
          {{ position.holding ? `$ ${formatPrice(Number(position.holding.averageBuyPrice))}` : '—' }}
        </p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400">{{ position.isClosed ? 'Реализовано' : 'P&L' }}</p>
        <p class="text-sm font-bold tabular-nums mt-0.5" :class="pnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600'">
          {{ pnlPercent >= 0 ? '+' : '' }}{{ pnlPercent.toFixed(2) }}%
        </p>
      </div>
    </div>

    <!-- One overall chart for the whole position, not per-trade -->
    <div class="px-4 pb-4">
      <PortfolioCoinChart
        :coin-id="position.coinId"
        :coin="position.coin ?? null"
        :average-buy-price="position.holding ? Number(position.holding.averageBuyPrice) : 0"
        :total-quantity="position.holding ? Number(position.holding.totalQuantity) : 0"
        class="!shadow-none !border-gray-100"
      />
    </div>

    <!-- Timeline -->
    <button
      class="w-full flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-2.5 border-t border-gray-100 transition-colors hover:bg-gray-50"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Скрыть историю' : `Показать историю (${position.trades.length + position.posts.length})` }}
      <UIcon :name="expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-3.5 h-3.5" />
    </button>

    <div v-if="expanded" class="divide-y divide-gray-50 border-t border-gray-100">
      <div v-for="entry in timeline" :key="`${entry.kind}-${entry.id}`" class="flex items-center gap-3 px-4 py-2.5">
        <template v-if="entry.kind === 'trade'">
          <UIcon
            :name="entry.isBuy ? 'i-heroicons-arrow-up-circle' : 'i-heroicons-arrow-down-circle'"
            class="w-5 h-5 shrink-0"
            :class="entry.isBuy ? 'text-emerald-500' : 'text-red-500'"
          />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-gray-900">
              {{ entry.isBuy ? 'Покупка' : 'Продажа' }} {{ formatQuantity(Number(entry.trade.quantity)) }} по $ {{ formatPrice(Number(entry.trade.pricePerUnit)) }}
            </p>
            <p v-if="entry.trade.description" class="text-[11px] text-gray-500 mt-0.5">{{ entry.trade.description }}</p>
            <p class="text-[11px] text-gray-400">{{ formatRelativeTime(entry.date) }}</p>
          </div>
          <p class="text-xs font-bold text-gray-700 tabular-nums shrink-0">$ {{ formatNumber(Number(entry.trade.totalAmount)) }}</p>
        </template>
        <template v-else>
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 shrink-0 text-blue-500" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-gray-900 truncate">{{ entry.post.title }}</p>
            <p class="text-[11px] text-gray-400">{{ formatRelativeTime(entry.date) }}</p>
          </div>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Position } from '~/utils/position'

const props = defineProps<{
  position: Position
}>()

const expanded = ref(false)

const costBasisByTradeId = computed(() => computeCostBasisTimeline(props.position.trades))

const totalInvested = computed(() =>
  props.position.trades
    .filter((t) => t.type?.toString().toLowerCase() === 'buy')
    .reduce((sum, t) => sum + Number(t.quantity) * Number(t.pricePerUnit), 0)
)

const realizedPnl = computed(() => {
  let total = 0
  for (const trade of props.position.trades) {
    const cb = costBasisByTradeId.value.get(trade.id)
    if (cb?.realizedPnl != null) total += cb.realizedPnl
  }
  return total
})

const pnlPercent = computed(() => {
  if (props.position.isClosed) {
    return totalInvested.value > 0 ? (realizedPnl.value / totalInvested.value) * 100 : 0
  }
  return props.position.holding?.profitLossPercentage ?? 0
})

const timeline = computed(() => {
  const tradeEntries = props.position.trades.map((trade) => ({
    kind: 'trade' as const,
    id: trade.id,
    date: trade.executedAt,
    trade,
    isBuy: trade.type?.toString().toLowerCase() === 'buy'
  }))
  const postEntries = props.position.posts.map((post) => ({
    kind: 'post' as const,
    id: post.id,
    date: post.createdAt,
    post
  }))
  return [...tradeEntries, ...postEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
</script>
