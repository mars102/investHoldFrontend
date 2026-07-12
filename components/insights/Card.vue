<template>
  <article class="rounded-lg bg-white border shadow-sm p-4 flex items-start gap-3 dark:bg-gray-800" :class="style.border">
    <div class="w-9 h-9 rounded-md flex items-center justify-center shrink-0" :class="style.iconBg">
      <UIcon :name="style.icon" class="w-5 h-5" :class="style.iconColor" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span v-if="insight.coin" class="text-xs font-bold text-gray-900 dark:text-white">{{ insight.coin.ticker }}</span>
        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" :class="style.badge">{{ style.label }}</span>
      </div>
      <p class="text-sm text-gray-700 mt-1 leading-relaxed dark:text-gray-300">{{ insight.message }}</p>
      <p class="text-[11px] text-gray-400 mt-1.5 dark:text-gray-500">{{ formatRelativeTime(insight.createdAt) }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Insight, InsightType } from '~/types/analytics'

const props = defineProps<{
  insight: Insight
}>()

const STYLES: Record<InsightType, { icon: string; iconBg: string; iconColor: string; badge: string; border: string; label: string }> = {
  underwater_position: {
    icon: 'i-heroicons-arrow-trending-down',
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    border: 'border-red-100 dark:border-red-500/20',
    label: 'В минусе'
  },
  near_local_high: {
    icon: 'i-heroicons-arrow-trending-up',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-500/20',
    label: 'Локальный максимум'
  },
  price_milestone: {
    icon: 'i-heroicons-flag',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    label: 'Веха по цене'
  },
  concentration_risk: {
    icon: 'i-heroicons-exclamation-triangle',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-500/20',
    label: 'Концентрация'
  },
  best_timing_trade: {
    icon: 'i-heroicons-trophy',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    label: 'Удачный тайминг'
  }
}

const style = computed(() => STYLES[props.insight.type])
</script>
