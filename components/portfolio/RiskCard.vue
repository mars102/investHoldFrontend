<template>
  <div v-if="showCard" class="rounded-lg bg-white border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">Риск-профиль</h3>
      <span
        v-if="risk && risk.level !== 'unknown'"
        class="flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md"
        :class="levelStyle.badge"
      >
        <UIcon :name="levelStyle.icon" class="w-3.5 h-3.5" />
        {{ levelStyle.label }}
      </span>
    </div>

    <div v-if="analyticsStore.riskLoading" class="h-24 flex items-center justify-center">
      <USkeleton class="h-8 w-32 rounded-md" />
    </div>

    <div v-else-if="!risk || risk.level === 'unknown'" class="text-center text-sm text-gray-400 py-6 dark:text-gray-500">
      Пока недостаточно данных — добавьте сделки, чтобы увидеть риск-профиль
    </div>

    <template v-else>
      <div class="flex items-baseline gap-2 mb-4">
        <span class="text-2xl font-bold text-gray-900 tabular-nums dark:text-white">{{ risk.hhi ?? '—' }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">HHI · концентрация портфеля</span>
      </div>

      <!-- Single stacked bar: part-to-whole by weight -->
      <div class="flex h-6 rounded-md overflow-hidden gap-0.5">
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

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3">
        <div v-for="seg in segments" :key="seg.key" class="flex items-center gap-2 min-w-0">
          <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="text-xs font-semibold text-gray-700 truncate dark:text-gray-300">{{ seg.label }}</span>
          <span class="text-xs text-gray-400 ml-auto shrink-0 dark:text-gray-500">{{ seg.percent.toFixed(1) }}%</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAnalyticsStore } from '~/stores/analytics'

const props = withDefaults(
  defineProps<{
    hideWhenUnknown?: boolean
  }>(),
  { hideWhenUnknown: false }
)

// Same fixed, entity-stable categorical order used by AllocationChart — coins
// keep the same color across both charts instead of repainting by rank.
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

const LEVEL_STYLES = {
  low: { label: 'Низкий риск', icon: 'i-heroicons-shield-check', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  medium: { label: 'Средний риск', icon: 'i-heroicons-exclamation-triangle', badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  high: { label: 'Высокий риск', icon: 'i-heroicons-fire', badge: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
  unknown: { label: 'Нет данных', icon: 'i-heroicons-question-mark-circle', badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' }
} as const

const analyticsStore = useAnalyticsStore()
const { risk } = storeToRefs(analyticsStore)
const hovered = ref<string | null>(null)

onMounted(() => {
  analyticsStore.fetchRisk()
})

const showCard = computed(() => !props.hideWhenUnknown || (risk.value && risk.value.level !== 'unknown'))

const levelStyle = computed(() => LEVEL_STYLES[risk.value?.level ?? 'unknown'])

const segments = computed(() => {
  const breakdown = risk.value?.breakdown ?? []
  const stableOrder = [...breakdown].sort((a, b) => a.coinId - b.coinId)

  const main = stableOrder.slice(0, CATEGORICAL_COLORS.length).map((item, i) => ({
    key: String(item.coinId),
    label: item.ticker,
    value: item.value,
    percent: item.weightPercent,
    color: CATEGORICAL_COLORS[i]!
  }))

  const rest = stableOrder.slice(CATEGORICAL_COLORS.length)
  if (rest.length) {
    main.push({
      key: 'other',
      label: `Другое (${rest.length})`,
      value: rest.reduce((sum, item) => sum + item.value, 0),
      percent: rest.reduce((sum, item) => sum + item.weightPercent, 0),
      color: OTHER_COLOR
    })
  }

  return main.sort((a, b) => b.value - a.value)
})
</script>
