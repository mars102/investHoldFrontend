<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
    <h3 class="text-sm font-bold text-gray-900 mb-4 dark:text-white">Тайминг сделок</h3>

    <div v-if="analyticsStore.tradeTimingLoading" class="h-24 flex items-center justify-center">
      <USkeleton class="h-8 w-24 rounded-md" />
    </div>

    <div v-else-if="average === null" class="text-center text-sm text-gray-400 py-6 dark:text-gray-500">
      Пока недостаточно данных для оценки тайминга
    </div>

    <template v-else>
      <div class="flex items-center gap-4">
        <div class="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" stroke-width="3" class="text-gray-100 dark:text-gray-700" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              :stroke="scoreColor"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${(average / 100) * 97.4} 97.4`"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-lg font-bold text-gray-900 tabular-nums dark:text-white">{{ Math.round(average) }}</span>
          </div>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold" :style="{ color: scoreColor }">{{ scoreLabel }}</p>
          <p class="text-xs text-gray-400 mt-1 dark:text-gray-500">Средняя оценка тайминга по всем сделкам</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAnalyticsStore } from '~/stores/analytics'

const analyticsStore = useAnalyticsStore()
const { tradeTiming } = storeToRefs(analyticsStore)

onMounted(() => {
  analyticsStore.fetchTradeTiming()
})

const average = computed(() => tradeTiming.value?.average ?? null)

const scoreColor = computed(() => {
  if (average.value === null) return '#94a3b8'
  if (average.value >= 70) return '#059669'
  if (average.value >= 40) return '#d97706'
  return '#dc2626'
})

const scoreLabel = computed(() => {
  if (average.value === null) return ''
  if (average.value >= 70) return 'Хороший тайминг'
  if (average.value >= 40) return 'Средний тайминг'
  return 'Слабый тайминг'
})
</script>
