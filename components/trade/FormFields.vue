<template>
  <div>
    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Мысли о сделке *</label>
    <UTextarea
      v-model="form.description"
      placeholder="Поделитесь мыслями о сделке..."
      autoresize
      :rows="2"
      class="mb-3"
    />

    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Тип сделки</label>
    <div class="flex rounded-md overflow-hidden border border-gray-200 mb-3 dark:border-gray-700">
      <button
        type="button"
        class="flex-1 py-2 text-xs font-bold transition-colors"
        :class="form.type === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
        @click="form.type = 'buy'"
      >
        Покупка
      </button>
      <button
        type="button"
        class="flex-1 py-2 text-xs font-bold transition-colors"
        :class="form.type === 'sell' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
        @click="form.type = 'sell'"
      >
        Продажа
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <div class="col-span-2 sm:col-span-1">
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Монета *</label>
        <USelect v-model="form.coinId" :options="coinOptions" placeholder="Выберите монету" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Биржа *</label>
        <USelect v-model="form.exchangeSource" :options="exchangeOptions" placeholder="Биржа" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Дата и время</label>
        <UInput v-model="form.executedAt" type="datetime-local" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Количество (шт.) *</label>
        <UInput v-model.number="form.quantity" type="number" step="any" placeholder="0.5" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Цена за единицу *</label>
        <UInput v-model.number="form.pricePerUnit" type="number" step="any" placeholder="45000" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Комиссия</label>
        <UInput v-model.number="form.fee" type="number" step="any" placeholder="0" />
      </div>
      <div>
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block dark:text-gray-500">Валюта комиссии</label>
        <USelect v-model="form.feeCurrency" :options="['USD', 'BTC', 'ETH', 'BNB', 'USDT']" />
      </div>
    </div>

    <div v-if="form.type === 'sell' && holdingQty > 0" class="mt-2 rounded-md bg-gray-50 border border-gray-200 p-2.5 dark:bg-gray-800/60 dark:border-gray-700">
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide dark:text-gray-500">Процент от позиции</label>
        <span class="text-[11px] text-gray-500 dark:text-gray-400">Есть: {{ formatQuantity(holdingQty) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="p in [10, 25, 50, 100]"
          :key="p"
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
          :class="sellPercent === p ? 'bg-gray-900 text-white dark:bg-gray-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/60'"
          @click="sellPercent = p"
        >
          {{ p }}%
        </button>
        <UInput v-model.number="sellPercent" type="number" step="any" placeholder="%" class="w-20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { createTrade } from '~/types/trade'
import { usePortfolioStore } from '~/stores/portfolio'

defineProps<{
  coinOptions: { label: string; value: number }[]
}>()

const form = defineModel<createTrade>({ required: true })

const exchangeOptions = [
  { label: 'Binance', value: 'binance' },
  { label: 'Bybit', value: 'bybit' },
  { label: 'OKX', value: 'okx' },
  { label: 'Huobi', value: 'huobi' },
  { label: 'Другое', value: 'other' }
]

const portfolioStore = usePortfolioStore()
const { summary } = storeToRefs(portfolioStore)

onMounted(() => {
  if (!summary.value) {
    portfolioStore.fetchSummary()
  }
})

const holdingQty = computed(() => {
  const holding = summary.value?.holdings.find((h) => h.coinId === Number(form.value.coinId))
  return holding ? Number(holding.totalQuantity) : 0
})

const sellPercent = ref<number | null>(null)

watch(sellPercent, (percent) => {
  if (percent != null && holdingQty.value > 0) {
    form.value.quantity = Number(((holdingQty.value * percent) / 100).toFixed(8))
  }
})
</script>
