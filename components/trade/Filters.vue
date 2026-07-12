<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-800">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">Фильтры</h3>
      <button
        v-if="hasActiveFilters"
        class="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
        @click="reset"
      >
        Сбросить
      </button>
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Поиск</label>
      <UInput v-model="filters.search" icon="i-heroicons-magnifying-glass" placeholder="По тексту, бирже, монете..." />
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Вид ленты</label>
      <div class="grid grid-cols-2 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700" :class="{ 'opacity-40 pointer-events-none': hasSearch }">
        <button
          v-for="opt in groupedOptions"
          :key="String(opt.value)"
          type="button"
          class="py-1.5 text-xs font-bold transition-colors"
          :class="filters.grouped === opt.value ? 'bg-gray-900 text-white dark:bg-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
          @click="filters.grouped = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <p v-if="hasSearch" class="text-[10px] text-gray-400 mt-1 dark:text-gray-500">Недоступно во время поиска — результаты показываются плоским списком</p>
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Тип</label>
      <div class="grid grid-cols-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700" :class="{ 'opacity-40 pointer-events-none': filters.grouped }">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          class="py-1.5 px-0.5 text-[10px] font-bold transition-colors leading-tight"
          :class="filters.type === opt.value ? 'bg-gray-900 text-white dark:bg-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
          @click="filters.type = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <p v-if="filters.grouped" class="text-[10px] text-gray-400 mt-1 dark:text-gray-500">Недоступно в режиме "По монетам" — позиция объединяет и сделки, и посты</p>
    </div>

    <div>
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Монета</label>
      <USelect v-model="filters.coinId" :options="coinOptions" />
    </div>

    <div class="text-xs text-gray-400 pt-3 border-t border-gray-100 dark:text-gray-500 dark:border-gray-800">
      Найдено: <span class="font-bold text-gray-700 dark:text-gray-300">{{ resultCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedFilterType } from '~/types/feed'

export interface FeedFiltersState {
  type: FeedFilterType
  coinId: string
  grouped: boolean
  search: string
}

defineProps<{
  coinOptions: { label: string; value: string }[]
  resultCount: number
}>()

const filters = defineModel<FeedFiltersState>({ required: true })

const typeOptions: { label: string; value: FeedFiltersState['type'] }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Сделки', value: 'trades' },
  { label: 'Посты', value: 'posts' },
  { label: 'Инсайты', value: 'insights' }
]

const groupedOptions: { label: string; value: boolean }[] = [
  { label: 'Лента', value: false },
  { label: 'По монетам', value: true }
]

const hasSearch = computed(() => filters.value.search.trim().length > 0)

const hasActiveFilters = computed(
  () => filters.value.type !== 'all' || filters.value.coinId !== 'all' || filters.value.grouped || hasSearch.value
)

function reset() {
  filters.value.type = 'all'
  filters.value.coinId = 'all'
  filters.value.grouped = false
  filters.value.search = ''
}
</script>
