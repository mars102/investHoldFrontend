<template>
  <div class="rounded-lg bg-white border border-gray-100 shadow-sm p-4 dark:bg-gray-800 dark:border-gray-800">
    <!-- Collapsed prompt -->
    <div v-if="!isExpanded" class="flex items-center gap-3 cursor-text" @click="expand">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
        {{ userInitial }}
      </div>
      <div class="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2.5 text-sm text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        Поделитесь постом или сделкой...
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
          <p class="font-bold text-gray-900 text-sm dark:text-white">{{ username }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">{{ mode === 'post' ? 'Новый пост' : 'Новая сделка' }}</p>
        </div>
        <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800" @click="collapse">
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex rounded-md overflow-hidden border border-gray-200 mb-3 dark:border-gray-700">
        <button
          type="button"
          class="flex-1 py-2 text-xs font-bold transition-colors"
          :class="mode === 'post' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
          @click="mode = 'post'"
        >
          Пост
        </button>
        <button
          type="button"
          class="flex-1 py-2 text-xs font-bold transition-colors"
          :class="mode === 'trade' ? 'bg-gray-900 text-white dark:bg-gray-700' : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60'"
          @click="mode = 'trade'"
        >
          Сделка
        </button>
      </div>

      <!-- Post mode -->
      <template v-if="mode === 'post'">
        <UInput v-model="postForm.title" placeholder="Заголовок" class="mb-2" />
        <UTextarea v-model="postForm.content" placeholder="О чём хотите рассказать?" autoresize :rows="3" class="mb-2" />
        <USelect v-model="postForm.coinId" :options="postCoinOptions" placeholder="Без привязки к монете" class="mb-2" />
        <PostMediaPicker v-model="postForm.media" class="mb-3" />

        <div class="flex items-center justify-end">
          <UButton :loading="postStore.loading" :disabled="!isPostValid" @click="submitPost">
            Опубликовать
          </UButton>
        </div>
      </template>

      <!-- Trade mode -->
      <template v-else>
        <TradeFormFields v-model="tradeForm" :coin-options="tradeCoinOptions" class="mb-3" />

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 dark:text-gray-500">
            <template v-if="previewTotal !== null">Итого: <span class="font-bold text-gray-700 dark:text-gray-300">$ {{ formatNumber(previewTotal) }}</span></template>
          </span>
          <UButton :loading="tradeStore.loading" :disabled="!isTradeValid" @click="submitTrade">
            Опубликовать
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { createTrade } from '~/types/trade'
import type { Coin } from '~/types/coins'
import { useMyTradeStore } from '~/stores/trade'
import { usePostStore } from '~/stores/post'
import { useAuthStore } from '~/stores/auth'

const tradeStore = useMyTradeStore()
const postStore = usePostStore()
const authStore = useAuthStore()

const username = computed(() => authStore.user?.username ?? 'Вы')
const userInitial = computed(() => username.value.slice(0, 1).toUpperCase())

const isExpanded = ref(false)
const mode = ref<'post' | 'trade'>('post')
const coins = ref<Coin[]>([])

async function fetchCoins() {
  const { $api } = useNuxtApp()
  coins.value = await $api('/coins')
}

onMounted(fetchCoins)

function expand() {
  isExpanded.value = true
  // The composer is mounted once for the whole session (it's teleported
  // around, not remounted), so its coin list — and the prices used to
  // autofill pricePerUnit — would otherwise go stale after the first load.
  fetchCoins()
}

function collapse() {
  isExpanded.value = false
  Object.assign(tradeForm, defaultTradeForm())
  Object.assign(postForm, defaultPostForm())
  formPreview.value = null
}

/* ---------- Post mode ---------- */

function defaultPostForm() {
  return {
    title: '',
    content: '',
    coinId: '',
    media: [] as File[]
  }
}

const postForm = reactive(defaultPostForm())

const postCoinOptions = computed(() => [
  { label: 'Без привязки к монете', value: '' },
  ...coins.value.map((coin) => ({ label: `${coin.fullName} (${coin.ticker})`, value: String(coin.id) }))
])

const isPostValid = computed(() => !!postForm.title.trim() && !!postForm.content.trim())

async function submitPost() {
  if (!isPostValid.value) return

  await postStore.createPost({
    title: postForm.title.trim(),
    content: postForm.content.trim(),
    coinId: postForm.coinId ? Number(postForm.coinId) : undefined,
    media: postForm.media
  })
  collapse()
}

/* ---------- Trade mode ---------- */

function defaultTradeForm(): createTrade {
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

const tradeForm = reactive<createTrade>(defaultTradeForm())

const tradeCoinOptions = computed(() =>
  coins.value.map((coin) => ({
    label: `${coin.fullName} (${coin.ticker})`,
    value: Number(coin.id)
  }))
)

const formPreview = useTradeFormPreview()

watchEffect(() => {
  if (!isExpanded.value || mode.value !== 'trade') return
  formPreview.value = {
    coinId: tradeForm.coinId ? Number(tradeForm.coinId) : null,
    type: tradeForm.type,
    quantity: Number(tradeForm.quantity),
    pricePerUnit: Number(tradeForm.pricePerUnit)
  }
})

watch(mode, (value) => {
  if (value !== 'trade') formPreview.value = null
})

watch(
  () => tradeForm.coinId,
  (coinId) => {
    // USelect's native <select> always emits option values as strings
    // (event.target.value), even though coinOptions provides numbers —
    // so the comparison must coerce both sides.
    const selected = coins.value.find((c) => c.id === Number(coinId))
    if (selected) {
      tradeForm.pricePerUnit = selected.currentPrice
    }
  }
)

onUnmounted(() => {
  formPreview.value = null
})

const isTradeValid = computed(
  () =>
    !!tradeForm.coinId &&
    tradeForm.quantity > 0 &&
    tradeForm.pricePerUnit > 0 &&
    !!tradeForm.exchangeSource &&
    !!tradeForm.description?.trim()
)

const previewTotal = computed(() => (tradeForm.quantity > 0 && tradeForm.pricePerUnit > 0 ? tradeForm.quantity * tradeForm.pricePerUnit : null))

async function submitTrade() {
  if (!isTradeValid.value) return

  const payload = {
    ...tradeForm,
    coinId: tradeForm.coinId ? Number(tradeForm.coinId) : undefined,
    quantity: Number(tradeForm.quantity),
    pricePerUnit: Number(tradeForm.pricePerUnit),
    fee: Number(tradeForm.fee),
    executedAt: new Date(tradeForm.executedAt).toISOString()
  }

  await tradeStore.createTrade(payload)
  collapse()
}
</script>
