<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm font-bold text-gray-900">Редактирование сделки</p>
      <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" @click="$emit('cancel')">
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </button>
    </div>

    <TradeFormFields v-model="form" :coin-options="coinOptions" class="mb-3" />

    <!-- Delete confirmation -->
    <div v-if="isConfirmingDelete" class="flex items-center justify-between rounded-md bg-red-50 border border-red-100 px-3 py-2 mb-3">
      <span class="text-xs font-medium text-red-600">Удалить сделку без возможности отмены?</span>
      <div class="flex items-center gap-2 shrink-0">
        <UButton size="xs" color="gray" variant="ghost" :disabled="deleting" @click="isConfirmingDelete = false">
          Отмена
        </UButton>
        <UButton size="xs" color="red" :loading="deleting" @click="remove">
          Да, удалить
        </UButton>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <UButton
        v-if="!isConfirmingDelete"
        size="xs"
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        :disabled="tradeStore.loading"
        @click="isConfirmingDelete = true"
      >
        Удалить
      </UButton>
      <span v-else />

      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">
          <template v-if="previewTotal !== null">Итого: <span class="font-bold text-gray-700">$ {{ formatNumber(previewTotal) }}</span></template>
        </span>
        <div class="flex items-center gap-2">
          <UButton color="gray" variant="ghost" :disabled="tradeStore.loading" @click="$emit('cancel')">
            Отмена
          </UButton>
          <UButton :loading="tradeStore.loading" :disabled="!isValid" @click="submit">
            Сохранить
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { createTrade, Trade } from '~/types/trade'
import type { Coin } from '~/types/coins'
import { useMyTradeStore } from '~/stores/trade'

const props = defineProps<{
  trade: Trade
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
  deleted: []
}>()

const tradeStore = useMyTradeStore()
const coins = ref<Coin[]>([])

const form = reactive<createTrade>({
  coinId: props.trade.coinId,
  type: props.trade.type,
  quantity: Number(props.trade.quantity) || 0,
  pricePerUnit: Number(props.trade.pricePerUnit) || 0,
  fee: Number(props.trade.fee) || 0,
  feeCurrency: props.trade.feeCurrency || 'USD',
  exchangeSource: props.trade.exchangeSource || '',
  description: props.trade.description || '',
  executedAt: toDatetimeLocalValue(new Date(props.trade.executedAt))
})

const coinOptions = computed(() =>
  coins.value.map((coin) => ({
    label: `${coin.fullName} (${coin.ticker})`,
    value: Number(coin.id)
  }))
)

watch(
  () => form.coinId,
  (coinId) => {
    // USelect's native <select> always emits option values as strings
    // (event.target.value), even though coinOptions provides numbers —
    // so the comparison must coerce both sides.
    const selected = coins.value.find((c) => c.id === Number(coinId))
    if (selected) {
      form.pricePerUnit = selected.currentPrice
    }
  }
)

onMounted(async () => {
  const { $api } = useNuxtApp()
  coins.value = await $api('/coins')
})

const isValid = computed(() => !!form.coinId && form.quantity > 0 && form.pricePerUnit > 0)

const previewTotal = computed(() => (form.quantity > 0 && form.pricePerUnit > 0 ? form.quantity * form.pricePerUnit : null))

async function submit() {
  if (!isValid.value) return

  const payload = {
    ...form,
    coinId: form.coinId ? Number(form.coinId) : undefined,
    quantity: Number(form.quantity),
    pricePerUnit: Number(form.pricePerUnit),
    fee: Number(form.fee),
    executedAt: new Date(form.executedAt).toISOString()
  }

  await tradeStore.updateTrade(props.trade.id, payload)
  emit('saved')
}

const isConfirmingDelete = ref(false)
const deleting = ref(false)

async function remove() {
  deleting.value = true
  try {
    await tradeStore.deleteTrade(props.trade.id)
    emit('deleted')
  } catch {
    isConfirmingDelete.value = false
  } finally {
    deleting.value = false
  }
}
</script>
