<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-gray-900">Фильтры</h3>
      <button
        v-if="hasActiveFilters"
        class="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
        @click="reset"
      >
        Сбросить
      </button>
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Поиск</label>
      <UInput v-model="filters.search" placeholder="По описанию или монете..." icon="i-heroicons-magnifying-glass" />
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Тип</label>
      <div class="grid grid-cols-3 rounded-md overflow-hidden border border-gray-200">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          class="py-1.5 text-xs font-bold transition-colors"
          :class="filters.type === opt.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
          @click="filters.type = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Монета</label>
      <USelect v-model="filters.coinId" :options="coinOptions" />
    </div>

    <div v-if="exchangeOptions.length > 1">
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Биржа</label>
      <USelect v-model="filters.exchangeSource" :options="exchangeOptions" />
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Результат</label>
      <div class="grid grid-cols-3 rounded-md overflow-hidden border border-gray-200">
        <button
          v-for="opt in pnlOptions"
          :key="opt.value"
          type="button"
          class="py-1.5 text-xs font-bold transition-colors"
          :class="filters.pnl === opt.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
          @click="filters.pnl = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="text-xs text-gray-400 pt-3 border-t border-gray-100">
      Найдено: <span class="font-bold text-gray-700">{{ resultCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TradeFiltersState {
  search: string
  type: 'all' | 'buy' | 'sell'
  coinId: string
  exchangeSource: string
  pnl: 'all' | 'profit' | 'loss'
}

defineProps<{
  coinOptions: { label: string; value: string }[]
  exchangeOptions: { label: string; value: string }[]
  resultCount: number
}>()

const filters = defineModel<TradeFiltersState>({ required: true })

const typeOptions: { label: string; value: TradeFiltersState['type'] }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Покупки', value: 'buy' },
  { label: 'Продажи', value: 'sell' }
]

const pnlOptions: { label: string; value: TradeFiltersState['pnl'] }[] = [
  { label: 'Все', value: 'all' },
  { label: 'В плюсе', value: 'profit' },
  { label: 'В минусе', value: 'loss' }
]

const hasActiveFilters = computed(
  () =>
    !!filters.value.search.trim() ||
    filters.value.type !== 'all' ||
    filters.value.coinId !== 'all' ||
    filters.value.exchangeSource !== 'all' ||
    filters.value.pnl !== 'all'
)

function reset() {
  filters.value.search = ''
  filters.value.type = 'all'
  filters.value.coinId = 'all'
  filters.value.exchangeSource = 'all'
  filters.value.pnl = 'all'
}
</script>
