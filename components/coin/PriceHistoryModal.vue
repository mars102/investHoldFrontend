<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- Header -->
        <div class="flex items-start justify-between p-6 border-b border-gray-100">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 overflow-hidden">
              <img v-if="coin?.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
              <span v-else>{{ coin?.ticker?.slice(0, 1) }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-bold text-gray-900 truncate">
                {{ coin?.fullName }}
                <span class="text-gray-400 font-medium">{{ coin?.ticker }}</span>
              </h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-2xl font-bold text-gray-900">$ {{ formatPrice(latestPrice) }}</span>
                <span
                  v-if="points.length"
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
                >
                  {{ periodChangePercent >= 0 ? '+' : '' }}{{ periodChangePercent.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
          <button
            class="w-8 h-8 shrink-0 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            @click="close"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Period selector -->
        <div class="flex items-center gap-1 px-6 pt-4">
          <button
            v-for="p in periods"
            :key="p"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
            :class="period === p ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
            @click="period = p"
          >
            {{ periodLabels[p] }}
          </button>
        </div>

        <!-- Chart -->
        <div class="p-6">
          <div v-if="loading" class="h-64 flex items-center justify-center">
            <div class="flex gap-1.5">
              <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 300ms" />
            </div>
          </div>

          <div v-else-if="error" class="h-64 flex flex-col items-center justify-center text-gray-400">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 mb-2 text-red-400" />
            <p class="text-sm text-gray-500">{{ error }}</p>
          </div>

          <div v-else-if="!chartData" class="h-64 flex flex-col items-center justify-center text-gray-400">
            <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 mb-2" />
            <p class="text-sm">Нет данных за этот период</p>
          </div>

          <div v-else>
            <div
              ref="chartContainer"
              class="relative h-64 w-full cursor-crosshair"
              @mousemove="onMouseMove"
              @mouseleave="onMouseLeave"
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full">
                <defs>
                  <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="trendColor" stop-opacity="0.28" />
                    <stop offset="100%" :stop-color="trendColor" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <!-- avg buy price line -->
                <line
                  v-if="chartData.avgY !== null"
                  x1="0"
                  :y1="chartData.avgY"
                  x2="100"
                  :y2="chartData.avgY"
                  stroke="#f59e0b"
                  stroke-width="0.6"
                  stroke-dasharray="2,2"
                  vector-effect="non-scaling-stroke"
                />

                <!-- area fill -->
                <path :d="chartData.areaPath" :fill="`url(#${gradientId})`" stroke="none" />

                <!-- price line -->
                <path
                  :d="chartData.linePath"
                  fill="none"
                  :stroke="trendColor"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />

                <!-- hover crosshair -->
                <g v-if="hoverPoint">
                  <line
                    :x1="hoverPoint.x"
                    y1="0"
                    :x2="hoverPoint.x"
                    y2="100"
                    stroke="#9ca3af"
                    stroke-width="0.4"
                    stroke-dasharray="1,1"
                    vector-effect="non-scaling-stroke"
                  />
                  <circle
                    :cx="hoverPoint.x"
                    :cy="hoverPoint.y"
                    r="1.6"
                    :fill="trendColor"
                    stroke="white"
                    stroke-width="0.7"
                    vector-effect="non-scaling-stroke"
                  />
                </g>
              </svg>

              <!-- avg buy price label -->
              <div
                v-if="chartData.avgY !== null"
                class="absolute right-0 -translate-y-1/2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 whitespace-nowrap"
                :style="{ top: chartData.avgY + '%' }"
              >
                Ср. покупка $ {{ formatPrice(averageBuyPrice) }}
              </div>

              <!-- tooltip -->
              <div
                v-if="hoverPoint"
                class="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap"
                :style="{ left: hoverPoint.x + '%', top: hoverPoint.y + '%', marginTop: '-8px' }"
              >
                <div class="font-semibold">$ {{ formatPrice(hoverPoint.price) }}</div>
                <div class="text-gray-400">{{ formatDate(hoverPoint.timestamp) }}</div>
              </div>
            </div>

            <!-- x-axis labels -->
            <div class="flex justify-between mt-2 text-[11px] text-gray-400">
              <span>{{ formatDate(points[0].timestamp) }}</span>
              <span v-if="points.length > 2">{{ formatDate(points[Math.floor(points.length / 2)].timestamp) }}</span>
              <span>{{ formatDate(points[points.length - 1].timestamp) }}</span>
            </div>
          </div>

          <!-- legend -->
          <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-0.5 rounded-full" :style="{ background: trendColor }" />
              Цена
            </div>
            <div v-if="averageBuyPrice" class="flex items-center gap-1.5">
              <span
                class="w-3 h-0.5"
                style="background-image: repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)"
              />
              Средняя цена покупки
            </div>
            <div
              v-if="vsAvgBuyPercent !== null"
              class="ml-auto font-semibold"
              :class="vsAvgBuyPercent >= 0 ? 'text-emerald-600' : 'text-red-600'"
            >
              {{ vsAvgBuyPercent >= 0 ? '+' : '' }}{{ vsAvgBuyPercent.toFixed(2) }}% к покупке
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Coin, PriceHistoryPeriod, PricePoint } from '~/types/coins'

const props = defineProps<{
  open: boolean
  coinId: number | null
  coin: Coin | null
  averageBuyPrice: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const periods: PriceHistoryPeriod[] = ['24h', '7d', '30d', '90d', '1y', 'all']
const periodLabels: Record<PriceHistoryPeriod, string> = {
  '24h': '24Ч',
  '7d': '7Д',
  '30d': '30Д',
  '90d': '90Д',
  '1y': '1Г',
  all: 'Все'
}

const period = ref<PriceHistoryPeriod>('7d')
const points = ref<PricePoint[]>([])
const loading = ref(false)
const error = ref('')
const chartContainer = ref<HTMLElement | null>(null)
const hoverIndex = ref<number | null>(null)
const gradientId = `price-gradient-${Math.random().toString(36).slice(2)}`

function close() {
  emit('update:open', false)
}

async function loadHistory() {
  if (!props.coinId) return
  loading.value = true
  error.value = ''
  hoverIndex.value = null
  try {
    const { $api } = useNuxtApp()
    const response = await $api<PricePoint[]>(`/coins/${props.coinId}/history`, {
      params: { period: period.value }
    })
    points.value = response ?? []
  } catch (e: any) {
    error.value = e?.message || 'Не удалось загрузить историю цены'
    points.value = []
  } finally {
    loading.value = false
  }
}

watch([() => props.open, () => props.coinId, period], ([isOpen]) => {
  if (isOpen && props.coinId) {
    loadHistory()
  }
})

const latestPrice = computed(() => points.value.at(-1)?.price ?? props.coin?.currentPrice ?? 0)

const isPositive = computed(() => {
  if (!points.value.length) return true
  return points.value[points.value.length - 1].price >= points.value[0].price
})

const trendColor = computed(() => (isPositive.value ? '#10b981' : '#ef4444'))

const periodChangePercent = computed(() => {
  if (!points.value.length) return 0
  const first = points.value[0].price
  if (!first) return 0
  return ((latestPrice.value - first) / first) * 100
})

const vsAvgBuyPercent = computed(() => {
  if (!props.averageBuyPrice) return null
  return ((latestPrice.value - props.averageBuyPrice) / props.averageBuyPrice) * 100
})

function buildSmoothPath(coords: { x: number; y: number }[]) {
  if (!coords.length) return ''
  if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`
  let d = `M ${coords[0].x},${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i]
    const next = coords[i + 1]
    const midX = (curr.x + next.x) / 2
    const midY = (curr.y + next.y) / 2
    d += ` Q ${curr.x},${curr.y} ${midX},${midY}`
  }
  const last = coords[coords.length - 1]
  d += ` L ${last.x},${last.y}`
  return d
}

const chartData = computed(() => {
  if (!points.value.length) return null

  const prices = points.value.map((p) => p.price)
  const avg = props.averageBuyPrice || 0
  const allValues = avg > 0 ? [...prices, avg] : prices
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || max || 1
  const pad = range * 0.12
  const scaledMin = min - pad
  const scaledMax = max + pad
  const scaledRange = scaledMax - scaledMin || 1

  const n = points.value.length
  const coords = points.value.map((p, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - ((p.price - scaledMin) / scaledRange) * 100,
    price: p.price,
    timestamp: p.timestamp
  }))

  const linePath = buildSmoothPath(coords)
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},100 L ${coords[0].x},100 Z`
  const avgY = avg > 0 ? 100 - ((avg - scaledMin) / scaledRange) * 100 : null

  return { coords, linePath, areaPath, avgY }
})

const hoverPoint = computed(() => {
  if (hoverIndex.value === null || !chartData.value) return null
  return chartData.value.coords[hoverIndex.value]
})

function onMouseMove(e: MouseEvent) {
  if (!chartData.value || !chartContainer.value) return
  const rect = chartContainer.value.getBoundingClientRect()
  const xPercent = ((e.clientX - rect.left) / rect.width) * 100
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

function formatPrice(value?: number | null) {
  const v = value ?? 0
  if (v === 0) return '0.00'
  if (v < 1) return v.toFixed(6)
  if (v < 100) return v.toFixed(4)
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(timestamp: string) {
  const d = new Date(timestamp)
  if (period.value === '24h') {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
