<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">Инсайты</h3>
      <UButton
        size="xs"
        color="gray"
        variant="soft"
        icon="i-heroicons-sparkles"
        :loading="analyticsStore.generatingInsights"
        @click="analyticsStore.generateInsights()"
      >
        Обновить инсайты
      </UButton>
    </div>

    <div v-if="analyticsStore.insightsLoading" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-lg" />
    </div>

    <div v-else-if="!analyticsStore.insights.length" class="text-center text-sm text-gray-400 py-10 dark:text-gray-500">
      Пока нет инсайтов — нажмите «Обновить инсайты», чтобы сгенерировать их
    </div>

    <div v-else class="space-y-2">
      <InsightsCard v-for="insight in analyticsStore.insights" :key="insight.id" :insight="insight" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalyticsStore } from '~/stores/analytics'

const analyticsStore = useAnalyticsStore()

onMounted(() => {
  analyticsStore.fetchInsights()
})
</script>
