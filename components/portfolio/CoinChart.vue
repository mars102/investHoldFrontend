<template>
  <div class="h-full flex flex-col rounded-lg overflow-hidden border border-gray-100 bg-white shadow-sm">
    <!-- placeholder when nothing is selected -->
    <div v-if="!coinId" class="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3 min-h-[480px]">
      <UIcon name="i-heroicons-chart-bar-square" class="w-12 h-12" />
      <p class="text-sm">Выберите монету справа, чтобы увидеть график</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
            <img v-if="coin?.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
            <span v-else>{{ coin?.ticker?.slice(0, 1) }}</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-gray-900 font-bold text-base truncate">{{ coin?.fullName }}</h3>
              <span class="text-gray-400 text-sm font-medium">{{ coin?.ticker }}</span>
            </div>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-2xl font-bold text-gray-900 tabular-nums">$ {{ formatPrice(latestPrice) }}</span>
              <span
                v-if="points.length"
                class="text-xs font-bold px-2 py-0.5 rounded-md"
                :class="isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
                :title="`Изменение цены за период: ${periodLabels[period]}`"
              >
                {{ periodChangePercent >= 0 ? '+' : '' }}{{ periodChangePercent.toFixed(2) }}%
              </span>
              <span v-if="points.length" class="text-[11px] text-gray-400">за {{ periodLabels[period] }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-5 text-xs">
          <div class="text-right">
            <div class="text-gray-400 font-medium">Ваш объём</div>
            <div class="text-gray-900 font-bold tabular-nums mt-0.5">{{ formatQuantity(totalQuantity) }} {{ coin?.ticker }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-400 font-medium">Ср. цена покупки</div>
            <div class="text-amber-600 font-bold tabular-nums mt-0.5">$ {{ formatPrice(averageBuyPrice) }}</div>
          </div>
          <div v-if="vsAvgBuyPercent !== null" class="text-right">
            <div class="text-gray-400 font-medium">P&L</div>
            <div class="font-bold tabular-nums mt-0.5" :class="vsAvgBuyPercent >= 0 ? 'text-emerald-600' : 'text-red-600'">
              {{ vsAvgBuyPercent >= 0 ? '+' : '' }}{{ vsAvgBuyPercent.toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-1 bg-gray-100 rounded-md p-1">
          <button
            v-for="p in periods"
            :key="p"
            class="px-3 py-1.5 text-xs font-bold rounded-md transition-all"
            :class="period === p ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'"
            @click="period = p"
          >
            {{ periodLabels[p] }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            :class="drawMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200'"
            title="Линия тренда"
            @click="toggleDrawMode"
          >
            <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
          </button>
          <button
            v-if="lines.length"
            class="w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-gray-200 transition-colors"
            title="Очистить линии"
            @click="clearDrawings"
          >
            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Chart -->
      <div class="p-5 flex-1 flex flex-col min-h-0">
        <div v-if="loading" class="flex-1 flex items-center justify-center min-h-[360px]">
          <div class="flex gap-1.5">
            <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 0ms" />
            <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 150ms" />
            <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>

        <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2 min-h-[360px]">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 text-red-400" />
          <p class="text-sm text-gray-400">{{ error }}</p>
        </div>

        <div v-else-if="!chartData" class="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2 min-h-[360px]">
          <UIcon name="i-heroicons-chart-bar" class="w-10 h-10" />
          <p class="text-sm">Нет данных за этот период</p>
        </div>

        <template v-else>
          <div
            :key="`${coinId}-${period}`"
            ref="chartContainer"
            class="relative flex-1 min-h-[360px] w-full rounded-md overflow-hidden cursor-crosshair"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
            @click="onChartClick"
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" :stop-color="trendColor" stop-opacity="0.3" />
                  <stop offset="100%" :stop-color="trendColor" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- grid -->
              <line
                v-for="gy in gridLines"
                :key="gy"
                x1="0"
                :y1="gy"
                x2="100"
                :y2="gy"
                stroke="rgba(15,23,42,0.06)"
                stroke-width="0.3"
                vector-effect="non-scaling-stroke"
              />

              <!-- avg buy price line -->
              <line
                v-if="chartData.markY !== null"
                x1="0"
                :y1="chartData.markY"
                x2="100"
                :y2="chartData.markY"
                stroke="#f59e0b"
                stroke-width="0.6"
                stroke-dasharray="2,2"
                vector-effect="non-scaling-stroke"
              />

              <!-- area -->
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
                :style="{ filter: `drop-shadow(0 0 4px ${trendColor}aa)` }"
              />

              <!-- user drawn trend lines -->
              <line
                v-for="(ln, i) in lines"
                :key="i"
                :x1="ln.x1"
                :y1="ln.y1"
                :x2="ln.x2"
                :y2="ln.y2"
                stroke="#38bdf8"
                stroke-width="0.7"
                stroke-linecap="round"
                vector-effect="non-scaling-stroke"
              />

              <!-- preview line while drawing -->
              <template v-if="drawingStart">
                <line
                  v-if="previewEnd"
                  :x1="drawingStart.x"
                  :y1="drawingStart.y"
                  :x2="previewEnd.x"
                  :y2="previewEnd.y"
                  stroke="#38bdf8"
                  stroke-width="0.7"
                  stroke-dasharray="1.5,1.5"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
                <circle :cx="drawingStart.x" :cy="drawingStart.y" r="0.8" fill="#38bdf8" vector-effect="non-scaling-stroke" />
              </template>

              <!-- hover crosshair -->
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

            <!-- live current price marker -->
            <div
              v-if="lastCoord"
              class="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
              :style="{ left: lastCoord.x + '%', top: lastCoord.y + '%', background: trendColor, transform: 'translate(-50%, -50%)' }"
            >
              <span class="absolute inset-0 rounded-full animate-ping" :style="{ background: trendColor, opacity: 0.6 }" />
            </div>

            <!-- avg buy price tag -->
            <div
              v-if="chartData.markY !== null"
              class="absolute right-2 -translate-y-1/2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md whitespace-nowrap pointer-events-none"
              :style="{ top: chartData.markY + '%' }"
            >
              $ {{ formatPrice(averageBuyPrice) }}
            </div>

            <!-- current price tag -->
            <div
              v-if="lastCoord"
              class="absolute right-2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap pointer-events-none"
              :class="isPositive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
              :style="{ top: lastCoord.y + '%' }"
            >
              $ {{ formatPrice(latestPrice) }}
            </div>

            <!-- hover tooltip -->
            <div
              v-if="hoverPoint"
              class="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900/95 border border-white/10 text-white text-xs rounded-md px-2.5 py-1.5 shadow-2xl whitespace-nowrap"
              :style="{ left: hoverPoint.x + '%', top: hoverPoint.y + '%', marginTop: '-10px' }"
            >
              <div class="font-bold tabular-nums">$ {{ formatPrice(hoverPoint.price) }}</div>
              <div class="text-white/40">{{ formatDate(hoverPoint.timestamp) }}</div>
            </div>
          </div>

          <!-- time axis -->
          <div class="flex justify-between mt-2 px-1 text-[10px] font-medium text-gray-400 shrink-0">
            <span>{{ formatDate(points[0]!.timestamp) }}</span>
            <span v-if="points.length > 2">{{ formatDate(points[Math.floor(points.length / 2)]!.timestamp) }}</span>
            <span>{{ formatDate(points[points.length - 1]!.timestamp) }}</span>
          </div>

          <p v-if="drawMode" class="mt-3 text-[11px] text-blue-500 font-medium shrink-0">
            Режим рисования: кликните дважды на графике, чтобы провести линию тренда
          </p>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Coin, PriceHistoryPeriod, PricePoint } from '~/types/coins'

const props = defineProps<{
  coinId: number | null
  coin: Coin | null
  averageBuyPrice: number
  totalQuantity: number
}>()

const periods: PriceHistoryPeriod[] = ['24h', '7d', '30d', '90d', '1y', 'all']
const periodLabels: Record<PriceHistoryPeriod, string> = {
  '24h': '1Д',
  '7d': '1Н',
  '30d': '1М',
  '90d': '3М',
  '1y': '1Г',
  all: 'Все'
}

const period = ref<PriceHistoryPeriod>('30d')
const points = ref<PricePoint[]>([])
const loading = ref(false)
const error = ref('')
const chartContainer = ref<HTMLElement | null>(null)
const hoverIndex = ref<number | null>(null)
const gradientId = `coin-chart-gradient-${Math.random().toString(36).slice(2)}`
const gridLines = [20, 40, 60, 80]

const drawMode = ref(false)
const lines = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([])
const drawingStart = ref<{ x: number; y: number } | null>(null)
const previewEnd = ref<{ x: number; y: number } | null>(null)

async function loadHistory() {
  if (!props.coinId) {
    points.value = []
    return
  }
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

watch(
  [() => props.coinId, period],
  () => {
    clearDrawings()
    loadHistory()
  },
  { immediate: true }
)

const latestPrice = computed(() => points.value.at(-1)?.price ?? props.coin?.currentPrice ?? 0)

const isPositive = computed(() => {
  if (!points.value.length) return true
  return points.value[points.value.length - 1]!.price >= points.value[0]!.price
})

const trendColor = computed(() => (isPositive.value ? '#10b981' : '#ef4444'))

const periodChangePercent = computed(() => {
  if (!points.value.length) return 0
  const first = points.value[0]!.price
  if (!first) return 0
  return ((latestPrice.value - first) / first) * 100
})

const vsAvgBuyPercent = computed(() => {
  if (!props.averageBuyPrice) return null
  return ((latestPrice.value - props.averageBuyPrice) / props.averageBuyPrice) * 100
})

const chartData = computed(() => computeChartGeometry(points.value, props.averageBuyPrice))

const lastCoord = computed(() => chartData.value?.coords.at(-1) ?? null)

const hoverPoint = computed(() => {
  if (hoverIndex.value === null || !chartData.value) return null
  return chartData.value.coords[hoverIndex.value]
})

function getRelativeCoords(e: MouseEvent) {
  const rect = chartContainer.value!.getBoundingClientRect()
  const xPercent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
  const yPercent = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
  return { xPercent, yPercent }
}

function onMouseMove(e: MouseEvent) {
  if (!chartData.value || !chartContainer.value) return
  const { xPercent, yPercent } = getRelativeCoords(e)

  if (drawMode.value && drawingStart.value) {
    previewEnd.value = { x: xPercent, y: yPercent }
  }

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

function onChartClick(e: MouseEvent) {
  if (!drawMode.value || !chartContainer.value) return
  const { xPercent, yPercent } = getRelativeCoords(e)

  if (!drawingStart.value) {
    drawingStart.value = { x: xPercent, y: yPercent }
  } else {
    lines.value.push({ x1: drawingStart.value.x, y1: drawingStart.value.y, x2: xPercent, y2: yPercent })
    drawingStart.value = null
    previewEnd.value = null
  }
}

function toggleDrawMode() {
  drawMode.value = !drawMode.value
  drawingStart.value = null
  previewEnd.value = null
}

function clearDrawings() {
  lines.value = []
  drawingStart.value = null
  previewEnd.value = null
}

function formatDate(timestamp: string) {
  const d = new Date(timestamp)
  if (period.value === '24h') {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: '2-digit' })
}
</script>
