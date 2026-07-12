<template>
  <article class="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-800">
    <!-- Header -->
    <div class="flex items-center gap-3 p-4 pb-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
        {{ userInitial }}
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-900 text-sm dark:text-white">{{ username }}</span>
          <span
            class="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
            :class="isBuy ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
          >
            {{ isBuy ? 'Покупка' : 'Продажа' }}
          </span>
          <span
            v-if="!isBuy && costBasis?.percentOfPositionSold != null"
            class="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            Продано {{ costBasis.percentOfPositionSold.toFixed(0) }}% позиции
          </span>
        </div>
        <div class="text-xs text-gray-400 mt-0.5 dark:text-gray-500">
          {{ formatRelativeTime(trade.executedAt) }} <span v-if="trade.exchangeSource"> · {{ trade.exchangeSource }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <div class="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
          <img v-if="coin?.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
          <span v-else>{{ coin?.ticker?.slice(0, 1) }}</span>
        </div>
        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ coin?.ticker }}</span>

        <button
          v-if="!isEditing"
          class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
          title="Поделиться картинкой"
          @click="shareAsImage"
        >
          <UIcon name="i-heroicons-share" class="w-3.5 h-3.5" />
        </button>

        <button
          v-if="!isEditing"
          class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800"
          title="Редактировать"
          @click="isEditing = true"
        >
          <UIcon name="i-heroicons-pencil" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Edit mode -->
    <div v-if="isEditing" class="px-4 pb-4">
      <TradeEditForm :trade="trade" @saved="isEditing = false" @cancel="isEditing = false" @deleted="isEditing = false" />
    </div>

    <template v-else>
      <!-- Caption -->
      <p v-if="trade.description" class="px-4 pb-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
        {{ trade.description }}
      </p>

      <!-- Chart -->
      <div class="px-4">
      <div v-if="loading" class="h-40 rounded-md bg-gray-50 flex items-center justify-center dark:bg-gray-800/60">
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 0ms" />
          <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 150ms" />
          <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 300ms" />
        </div>
      </div>

      <div v-else-if="!chartData" class="h-40 rounded-md bg-gray-50 flex items-center justify-center text-xs text-gray-400 dark:bg-gray-800/60 dark:text-gray-500">
        Нет данных графика
      </div>

      <template v-else>
        <div
          ref="chartContainer"
          class="relative h-40 w-full rounded-md overflow-hidden bg-gray-50 cursor-crosshair dark:bg-gray-800/60"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="trendColor" stop-opacity="0.28" />
                <stop offset="100%" :stop-color="trendColor" stop-opacity="0" />
              </linearGradient>
            </defs>

            <!-- entry price line -->
            <line
              v-if="chartData.markY !== null"
              x1="0"
              :y1="chartData.markY"
              x2="100"
              :y2="chartData.markY"
              stroke="#94a3b8"
              stroke-width="0.6"
              stroke-dasharray="2,2"
              vector-effect="non-scaling-stroke"
            />

            <path :d="chartData.areaPath" :fill="`url(#${gradientId})`" stroke="none" />
            <path
              :d="chartData.linePath"
              fill="none"
              :stroke="trendColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />

            <g v-if="hoverPoint">
              <line
                :x1="hoverPoint.x"
                y1="0"
                :x2="hoverPoint.x"
                y2="100"
                stroke="rgba(15,23,42,0.15)"
                stroke-width="0.4"
                stroke-dasharray="1,1"
                vector-effect="non-scaling-stroke"
              />
              <circle
                :cx="hoverPoint.x"
                :cy="hoverPoint.y"
                r="1.4"
                :fill="trendColor"
                stroke="#ffffff"
                stroke-width="0.6"
                vector-effect="non-scaling-stroke"
              />
            </g>
          </svg>

          <div
            v-if="chartData.markY !== null"
            class="absolute right-1.5 -translate-y-1/2 text-[9px] font-bold text-gray-500 bg-white/90 border border-gray-200 px-1.5 py-0.5 rounded-md whitespace-nowrap pointer-events-none dark:text-gray-400 dark:border-gray-700"
            :style="{ top: chartData.markY + '%' }"
          >
            {{ entryLabel }} $ {{ formatPrice(entryPrice) }}
          </div>

          <div
            v-if="hoverPoint"
            class="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900/95 text-white text-[10px] rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
            :style="{ left: hoverPoint.x + '%', top: hoverPoint.y + '%', marginTop: '-8px' }"
          >
            $ {{ formatPrice(hoverPoint.price) }}
          </div>
        </div>

        <!-- time axis -->
        <div class="flex justify-between mt-1.5 px-0.5 text-[9px] font-medium text-gray-400 dark:text-gray-500">
          <span>{{ formatAxisDate(points[0]!.timestamp) }}</span>
          <span v-if="points.length > 2">{{ formatAxisDate(points[Math.floor(points.length / 2)]!.timestamp) }}</span>
          <span>{{ formatAxisDate(points[points.length - 1]!.timestamp) }}</span>
        </div>
      </template>
    </div>

    <!-- Stats footer -->
    <div class="grid grid-cols-4 gap-2 px-4 py-3 mt-1">
      <div>
        <p class="text-[10px] text-gray-400 dark:text-gray-500">Количество</p>
        <p class="text-xs font-bold text-gray-900 tabular-nums dark:text-white">{{ formatQuantity(trade.quantity) }}</p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400 dark:text-gray-500">{{ isBuy ? 'Точка входа' : 'Цена продажи' }}</p>
        <p class="text-xs font-bold text-gray-900 tabular-nums dark:text-white">$ {{ formatPrice(trade.pricePerUnit) }}</p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400 dark:text-gray-500">Сумма</p>
        <p class="text-xs font-bold text-gray-900 tabular-nums dark:text-white">$ {{ formatNumber(trade.totalAmount) }}</p>
      </div>
      <div>
        <p class="text-[10px] text-gray-400 dark:text-gray-500">P&L</p>
        <p class="text-xs font-bold tabular-nums" :class="isProfitable ? 'text-emerald-600' : 'text-red-600'">
          {{ pnlPercent >= 0 ? '+' : '' }}{{ pnlPercent.toFixed(2) }}%
        </p>
      </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { Coin, PriceHistoryPeriod, PricePoint } from '~/types/coins'
import type { Trade } from '~/types/trade'
import type { TradeCostBasis } from '~/utils/costBasis'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  trade: Trade
  coin: Coin | undefined
  costBasis?: TradeCostBasis
}>()

const isEditing = ref(false)

const authStore = useAuthStore()
const username = computed(() => authStore.user?.username ?? 'Вы')
const userInitial = computed(() => username.value.slice(0, 1).toUpperCase())

const isBuy = computed(() => props.trade.type?.toString().toLowerCase() === 'buy')

const points = ref<PricePoint[]>([])
const loading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const hoverIndex = ref<number | null>(null)
const gradientId = `trade-post-gradient-${Math.random().toString(36).slice(2)}`

function pickPeriod(executedAt: string): PriceHistoryPeriod {
  const days = (Date.now() - new Date(executedAt).getTime()) / 86400000
  if (days <= 7) return '7d'
  if (days <= 30) return '30d'
  if (days <= 90) return '90d'
  if (days <= 365) return '1y'
  return 'all'
}

async function loadHistory() {
  const coinId = props.trade.coinId
  if (!coinId) return
  loading.value = true
  try {
    const { $api } = useNuxtApp()
    const response = await $api<PricePoint[]>(`/coins/${coinId}/history`, {
      params: { period: pickPeriod(props.trade.executedAt) }
    })
    points.value = response ?? []
  } catch {
    points.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadHistory)

const tradePrice = computed(() => Number(props.trade.pricePerUnit) || 0)

// For a BUY, the chart's reference line is this trade's own entry price (unrealized P&L
// against today's market price). For a SELL, it's the average cost basis at the time of
// sale, so P&L reflects the realized gain/loss on the position actually sold — not a
// comparison against the sell price itself, which would always be a no-op.
const entryPrice = computed(() => {
  if (isBuy.value) return tradePrice.value
  return props.costBasis?.avgCostBasisBefore || tradePrice.value
})

const entryLabel = computed(() => (isBuy.value ? 'Вход' : 'Ср. покупка'))

const latestPrice = computed(() => points.value.at(-1)?.price ?? props.coin?.currentPrice ?? tradePrice.value)

const pnlPercent = computed(() => {
  if (!isBuy.value && props.costBasis?.realizedPnlPercent != null) {
    return props.costBasis.realizedPnlPercent
  }
  if (!entryPrice.value) return 0
  const diff = latestPrice.value - entryPrice.value
  const directional = isBuy.value ? diff : -diff
  return (directional / entryPrice.value) * 100
})

const isProfitable = computed(() => pnlPercent.value >= 0)
const trendColor = computed(() => (isProfitable.value ? '#10b981' : '#ef4444'))

const chartData = computed(() => computeChartGeometry(points.value, entryPrice.value))

const hoverPoint = computed(() => {
  if (hoverIndex.value === null || !chartData.value) return null
  return chartData.value.coords[hoverIndex.value]
})

function formatAxisDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: '2-digit' })
}

function onMouseMove(e: MouseEvent) {
  if (!chartData.value || !chartContainer.value) return
  const rect = chartContainer.value.getBoundingClientRect()
  const xPercent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))

  let nearest = 0
  let minDist = Infinity
  chartData.value.coords.forEach((c, i) => {
    const dist = Math.abs(c.x - xPercent)
    if (dist < minDist) {
      minDist = dist
      nearest = i
    }
  })
  hoverIndex.value = nearest
}

function onMouseLeave() {
  hoverIndex.value = null
}

function shareAsImage() {
  const canvas = renderTradeShareImage({
    trade: props.trade,
    coin: props.coin,
    isBuy: isBuy.value,
    entryPrice: entryPrice.value,
    latestPrice: latestPrice.value,
    pnlPercent: pnlPercent.value
  })
  downloadCanvasAsImage(canvas, `investhold-${(props.coin?.ticker ?? 'trade').toLowerCase()}-${props.trade.id}.png`)
}
</script>
