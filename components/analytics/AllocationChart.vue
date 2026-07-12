<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
    <h3 class="text-sm font-bold text-gray-900 mb-4">Распределение портфеля</h3>

    <div v-if="!segments.length" class="h-24 flex items-center justify-center text-sm text-gray-400">
      Нет активов в портфеле
    </div>

    <template v-else>
      <!-- Single stacked bar: part-to-whole by current value -->
      <div class="flex h-8 rounded-md overflow-hidden gap-0.5 bg-white">
        <div
          v-for="seg in segments"
          :key="seg.key"
          class="h-full relative cursor-default transition-opacity"
          :style="{ width: seg.percent + '%', backgroundColor: seg.color }"
          @mouseenter="hovered = seg.key"
          @mouseleave="hovered = null"
        >
          <div
            v-if="hovered === seg.key"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg z-10"
          >
            <div class="font-bold">{{ seg.label }}</div>
            <div class="text-gray-300">$ {{ formatNumber(seg.value) }} · {{ seg.percent.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4">
        <div v-for="seg in segments" :key="seg.key" class="flex items-center gap-2 min-w-0">
          <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="text-xs font-semibold text-gray-700 truncate">{{ seg.label }}</span>
          <span class="text-xs text-gray-400 ml-auto shrink-0">{{ seg.percent.toFixed(1) }}%</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from '~/stores/portfolio'

// Validated 8-slot categorical order (see dataviz skill palette) — assigned by a
// stable order (coinId), never by rank, so a segment doesn't repaint when values change.
const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834' // orange
]
const OTHER_COLOR = '#c3c2b7'

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

const hovered = ref<string | null>(null)

const segments = computed(() => {
  const holdings = summary.value?.holdings ?? []
  const total = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  if (!total) return []

  const stableOrder = [...holdings].sort((a, b) => a.coinId - b.coinId)

  const main = stableOrder.slice(0, CATEGORICAL_COLORS.length).map((h, i) => ({
    key: String(h.coinId),
    label: h.coin.ticker,
    value: h.currentValue,
    percent: (h.currentValue / total) * 100,
    color: CATEGORICAL_COLORS[i]!
  }))

  const rest = stableOrder.slice(CATEGORICAL_COLORS.length)
  if (rest.length) {
    const restValue = rest.reduce((sum, h) => sum + h.currentValue, 0)
    main.push({
      key: 'other',
      label: `Другое (${rest.length})`,
      value: restValue,
      percent: (restValue / total) * 100,
      color: OTHER_COLOR
    })
  }

  // Display order: largest first — color assignment above stays entity-stable regardless.
  return main.sort((a, b) => b.value - a.value)
})
</script>
