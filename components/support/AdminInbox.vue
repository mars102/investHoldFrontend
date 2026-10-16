<template>
  <div class="grid lg:grid-cols-[340px_1fr] gap-4 min-h-[640px]">
    <!-- Ticket list -->
    <section
      class="rounded-xl border border-gray-200 bg-white flex flex-col min-h-0 dark:border-gray-800 dark:bg-gray-900"
      :class="{ 'hidden lg:flex': store.current }"
    >
      <div class="p-3 border-b border-gray-100 space-y-2.5 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Поиск: текст, email, #id"
            size="sm"
            class="flex-1"
          />
          <UButton
            icon="i-heroicons-arrow-path"
            color="gray"
            variant="ghost"
            size="sm"
            :loading="store.adminLoading"
            aria-label="Обновить"
            @click="load"
          />
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in statusFilters"
            :key="s.value"
            type="button"
            class="px-2 py-1 rounded-md text-[11px] font-bold transition-colors"
            :class="filters.status === s.value
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
            @click="filters.status = s.value"
          >
            {{ s.label }}
            <span v-if="s.count != null" class="ml-0.5 opacity-60">{{ s.count }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        <div v-if="store.adminLoading && !store.adminTickets.length" class="py-16 text-center text-sm text-gray-400">Загрузка...</div>
        <div v-else-if="loadError" class="py-16 px-6 text-center text-sm text-red-500">{{ loadError }}</div>
        <div v-else-if="!store.adminTickets.length" class="py-16 text-center text-sm text-gray-400 dark:text-gray-500">Обращений нет</div>

        <button
          v-for="t in store.adminTickets"
          :key="t.id"
          type="button"
          class="w-full text-left px-3 py-3 transition-colors"
          :class="store.current?.id === t.id ? 'bg-cyan-50 dark:bg-cyan-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'"
          @click="open(t.id)"
        >
          <div class="flex items-center gap-2">
            <span v-if="t.hasUnread" class="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Ждёт ответа" />
            <span class="text-xs font-bold text-gray-900 dark:text-white">#{{ t.id }}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">{{ SUPPORT_CATEGORY_LABELS[t.category] }}</span>
            <span class="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md" :class="SUPPORT_STATUS_META[t.status].badge">
              {{ SUPPORT_STATUS_META[t.status].label }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-700 truncate dark:text-gray-300">{{ t.preview }}</p>
          <div class="mt-1 flex items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-gray-500">
            <span class="truncate">{{ t.user?.username ?? 'Гость' }} · {{ t.email }}</span>
            <span class="shrink-0">{{ formatRelative(t.lastMessageAt) }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Ticket detail -->
    <section
      class="rounded-xl border border-gray-200 bg-white flex flex-col min-h-0 dark:border-gray-800 dark:bg-gray-900"
      :class="{ 'hidden lg:flex': !store.current }"
    >
      <div v-if="!store.current" class="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-400 dark:text-gray-500">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-10 h-10 mb-3" />
        <p class="text-sm">Выберите обращение слева</p>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              class="lg:hidden w-8 h-8 -ml-1 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="К списку"
              @click="store.closeCurrent()"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            </button>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              #{{ store.current.id }} · {{ SUPPORT_CATEGORY_LABELS[store.current.category] }}
            </h3>
            <div class="ml-auto flex items-center gap-2">
              <USelect
                :model-value="store.current.status"
                :options="statusOptions"
                size="sm"
                @update:model-value="changeStatus"
              />
              <UButton
                v-if="store.current.status !== 'closed'"
                size="sm"
                color="gray"
                variant="soft"
                icon="i-heroicons-lock-closed"
                @click="changeStatus('closed')"
              >
                Закрыть
              </UButton>
            </div>
          </div>

          <dl class="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            <div class="flex gap-2 min-w-0">
              <dt class="text-gray-400 shrink-0">Автор</dt>
              <dd class="text-gray-700 truncate dark:text-gray-300">
                {{ store.current.user ? `${store.current.user.username} (id ${store.current.user.id})` : 'Гость' }}
              </dd>
            </div>
            <div class="flex gap-2 min-w-0">
              <dt class="text-gray-400 shrink-0">Email</dt>
              <dd class="text-gray-700 truncate dark:text-gray-300">{{ store.current.email }}</dd>
            </div>
            <div class="flex gap-2 min-w-0">
              <dt class="text-gray-400 shrink-0">Страница</dt>
              <dd class="text-gray-700 truncate dark:text-gray-300">
                <NuxtLink v-if="store.current.page" :to="store.current.page" target="_blank" class="text-cyan-600 hover:underline dark:text-cyan-400">
                  {{ store.current.page }}
                </NuxtLink>
                <span v-else>—</span>
              </dd>
            </div>
            <div class="flex gap-2 min-w-0">
              <dt class="text-gray-400 shrink-0">Создано</dt>
              <dd class="text-gray-700 dark:text-gray-300">{{ formatFull(store.current.createdAt) }}</dd>
            </div>
            <div v-if="store.current.userAgent" class="sm:col-span-2 flex gap-2 min-w-0">
              <dt class="text-gray-400 shrink-0">Браузер</dt>
              <dd class="text-gray-500 truncate dark:text-gray-400" :title="store.current.userAgent">{{ store.current.userAgent }}</dd>
            </div>
          </dl>
        </div>

        <!-- Messages -->
        <div ref="messagesBox" class="flex-1 min-h-0 overflow-y-auto p-4">
          <div v-if="store.currentLoading" class="py-10 text-center text-sm text-gray-400">Загрузка...</div>
          <SupportThread v-else :messages="store.current.messages ?? []" viewer="admin" />
        </div>

        <!-- Reply -->
        <form ref="replyForm" class="p-4 border-t border-gray-100 space-y-2 dark:border-gray-800" @submit.prevent="sendReply">
          <UTextarea
            v-model="reply"
            :rows="3"
            autoresize
            :maxrows="10"
            placeholder="Ответ пользователю... (Ctrl+Enter — отправить)"
            @keydown.ctrl.enter.prevent="sendReply"
            @keydown.meta.enter.prevent="sendReply"
          />
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <SupportAttachmentPicker v-model="replyFiles" :paste-target="replyForm" />
            <div class="flex items-center gap-2 ml-auto">
              <span class="text-[11px] text-gray-400">Статус после ответа</span>
              <USelect v-model="statusAfterReply" :options="statusOptions" size="sm" />
              <UButton type="submit" icon="i-heroicons-paper-airplane" :loading="store.sending" :disabled="!reply.trim()">
                Ответить
              </UButton>
            </div>
          </div>
        </form>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SupportStatus } from '~/types/support'
import type { AdminTicketFilters } from '~/stores/support'

const store = useSupportStore()
const toast = useToast()

const filters = reactive<AdminTicketFilters>({ status: 'new', search: '' })
const loadError = ref('')
const reply = ref('')
const replyFiles = ref<File[]>([])
const statusAfterReply = ref<SupportStatus>('answered')
const replyForm = ref<HTMLElement | null>(null)
const messagesBox = ref<HTMLElement | null>(null)

const statusOptions = (Object.keys(SUPPORT_STATUS_META) as SupportStatus[]).map((value) => ({
  value,
  label: SUPPORT_STATUS_META[value].label
}))

const statusFilters = computed(() => [
  { value: 'all' as const, label: 'Все', count: null },
  ...statusOptions.map((s) => ({ value: s.value, label: s.label, count: store.adminCounts[s.value] }))
])

async function load() {
  loadError.value = ''
  try {
    await store.fetchAdminTickets(filters)
  } catch (error: any) {
    loadError.value = error?.data?.message || 'Не удалось загрузить обращения'
  }
}

async function open(id: number) {
  reply.value = ''
  replyFiles.value = []
  statusAfterReply.value = 'answered'
  try {
    await store.openAdminTicket(id)
    scrollToBottom()
  } catch (error: any) {
    toast.add({ title: error?.data?.message || 'Не удалось открыть обращение', color: 'red' })
  }
}

async function changeStatus(status: SupportStatus) {
  if (!store.current || store.current.status === status) return
  try {
    await store.setStatus(store.current.id, status)
  } catch (error: any) {
    toast.add({ title: error?.data?.message || 'Не удалось сменить статус', color: 'red' })
  }
}

async function sendReply() {
  if (!store.current || !reply.value.trim() || store.sending) return
  try {
    await store.replyAsAdmin(store.current.id, {
      text: reply.value.trim(),
      attachments: replyFiles.value,
      status: statusAfterReply.value
    })
    reply.value = ''
    replyFiles.value = []
    store.fetchAdminCounts()
    scrollToBottom()
  } catch (error: any) {
    toast.add({ title: error?.data?.message || 'Не удалось отправить ответ', color: 'red' })
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesBox.value) messagesBox.value.scrollTop = messagesBox.value.scrollHeight
  })
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} ч`
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

function formatFull(value: string) {
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

watch(() => filters.status, load)
watchDebounced(() => filters.search, load, { debounce: 350 })

let refreshTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  load()
  refreshTimer = setInterval(load, 60_000)
})
onUnmounted(() => {
  clearInterval(refreshTimer)
  store.closeCurrent()
})
</script>
