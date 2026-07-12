<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
    <h3 class="text-sm font-bold text-gray-900 mb-4">Активность по биржам</h3>

    <div v-if="!rows.length" class="h-24 flex items-center justify-center text-sm text-gray-400">
      Нет данных
    </div>

    <div v-else class="space-y-3">
      <div v-for="row in rows" :key="row.exchange">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="font-semibold text-gray-700">{{ row.exchange }}</span>
          <span class="text-gray-400 tabular-nums">{{ row.count }} сделок · $ {{ formatNumber(row.volume) }}</span>
        </div>
        <div class="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            class="h-full rounded-full bg-[#2a78d6] transition-all"
            :style="{ width: (row.volume / maxVolume) * 100 + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trade } from '~/types/trade'

const props = defineProps<{
  trades: Trade[]
}>()

const rows = computed(() => {
  const byExchange = new Map<string, { count: number; volume: number }>()

  for (const trade of props.trades) {
    const exchange = trade.exchangeSource?.trim() || 'Без биржи'
    const entry = byExchange.get(exchange) ?? { count: 0, volume: 0 }
    entry.count += 1
    entry.volume += Number(trade.totalAmount) || Number(trade.quantity) * Number(trade.pricePerUnit) || 0
    byExchange.set(exchange, entry)
  }

  return [...byExchange.entries()]
    .map(([exchange, stats]) => ({ exchange, ...stats }))
    .sort((a, b) => b.volume - a.volume)
})

const maxVolume = computed(() => Math.max(...rows.value.map((r) => r.volume), 1))
</script>
