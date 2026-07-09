<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm p-4">
    <!-- Collapsed prompt -->
    <div v-if="!isExpanded" class="flex items-center gap-3 cursor-text" @click="expand">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
        {{ userInitial }}
      </div>
      <div class="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2.5 text-sm text-gray-400">
        Поделитесь своей сделкой...
      </div>
      <UIcon name="i-heroicons-plus-circle" class="w-7 h-7 text-blue-500 shrink-0" />
    </div>

    <!-- Expanded composer -->
    <div v-else>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
          {{ userInitial }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-bold text-gray-900 text-sm">{{ username }}</p>
          <p class="text-xs text-gray-400">Новая сделка</p>
        </div>
        <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" @click="collapse">
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>

      <TradeFormFields v-model="form" :coin-options="coinOptions" class="mb-3" />

      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400">
          <template v-if="previewTotal !== null">Итого: <span class="font-bold text-gray-700">$ {{ formatNumber(previewTotal) }}</span></template>
        </span>
        <UButton :loading="tradeStore.loading" :disabled="!isValid" @click="submit">
          Опубликовать
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { createTrade } from '~/types/trade'
import type { Coin } from '~/types/coins'
import { useMyTradeStore } from '~/stores/trade'
import { useAuthStore } from '~/stores/auth'

const tradeStore = useMyTradeStore()
const authStore = useAuthStore()

const username = computed(() => authStore.user?.username ?? 'Вы')
const userInitial = computed(() => username.value.slice(0, 1).toUpperCase())

const isExpanded = ref(false)
const coins = ref<Coin[]>([])

function defaultForm(): createTrade {
  return {
    coinId: undefined,
    type: 'buy',
    quantity: 0,
    pricePerUnit: 0,
    fee: 0,
    feeCurrency: 'USD',
    exchangeSource: '',
    description: '',
    executedAt: toDatetimeLocalValue(new Date())
  }
}

const form = reactive<createTrade>(defaultForm())

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

function expand() {
  isExpanded.value = true
}

function collapse() {
  isExpanded.value = false
  Object.assign(form, defaultForm())
}

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

  await tradeStore.createTrade(payload)
  collapse()
}
</script>
