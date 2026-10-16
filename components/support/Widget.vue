<template>
  <div ref="root" class="support-widget fixed right-3 sm:right-5 bottom-24 md:bottom-5 z-[60] flex flex-col items-end">
    <!-- Spotlight: dims the page around the talking robot (clicks pass through) -->
    <Transition name="spotlight">
      <div
        v-if="hintPhase !== 'off' && !isOpen"
        class="spotlight fixed inset-0 pointer-events-none"
        :style="{ '--spot-x': `${spot.x}px`, '--spot-y': `${spot.y}px` }"
        aria-hidden="true"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="panel">
      <div
        v-if="isOpen"
        ref="panel"
        class="panel mb-3 w-[min(380px,calc(100vw-1.5rem))] h-[min(580px,calc(100vh-11rem))] flex flex-col rounded-2xl overflow-hidden border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95"
        role="dialog"
        aria-label="Обращение в поддержку"
        @keydown.esc="close"
      >
        <!-- Header -->
        <div class="header relative shrink-0 flex items-center gap-3 px-4 py-3 text-white">
          <div class="w-11 h-12 shrink-0 -mb-1">
            <SupportRobot :state="robotState" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-black tracking-tight leading-tight">Холди</div>
            <div class="flex items-center gap-1.5 text-[11px] text-white/80">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Робот-помощник InvestHold
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
            @click="close"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Tabs (logged-in users can see their tickets and replies) -->
        <div v-if="isLoggedIn" class="shrink-0 flex border-b border-gray-100 dark:border-gray-800">
          <button
            v-for="t in tabs"
            :key="t.value"
            type="button"
            class="flex-1 py-2.5 text-xs font-bold transition-colors relative"
            :class="tab === t.value ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'"
            @click="switchTab(t.value)"
          >
            {{ t.label }}
            <span
              v-if="t.value === 'my' && supportStore.myUnreadCount"
              class="ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px]"
            >{{ supportStore.myUnreadCount }}</span>
            <span v-if="tab === t.value" class="absolute left-4 right-4 bottom-0 h-0.5 rounded-full bg-cyan-500" />
          </button>
        </div>

        <div ref="body" class="min-h-0 flex-1 overflow-y-auto">
        <!-- My tickets -->
        <template v-if="tab === 'my'">
          <!-- Ticket thread -->
          <div v-if="supportStore.myCurrent" class="p-4">
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-3"
              @click="supportStore.closeMyCurrent()"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
              Все обращения
            </button>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-bold text-gray-900 dark:text-white">#{{ supportStore.myCurrent.id }} · {{ SUPPORT_CATEGORY_LABELS[supportStore.myCurrent.category] }}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md" :class="SUPPORT_STATUS_META[supportStore.myCurrent.status].badge">
                {{ SUPPORT_STATUS_META[supportStore.myCurrent.status].label }}
              </span>
            </div>
            <SupportThread
              :messages="supportStore.myCurrent.messages ?? []"
              :pending="supportStore.pendingFor(supportStore.myCurrent.id, 'user')"
              viewer="user"
              @retry="supportStore.retryPending"
              @discard="supportStore.dropPending"
            />

            <form v-if="supportStore.myCurrent.status !== 'closed'" class="mt-4 space-y-2" @submit.prevent="sendFollowUp">
              <UTextarea
                v-model="followUp"
                :rows="2"
                autoresize
                :maxrows="6"
                placeholder="Дописать в обращение... (Ctrl+Enter — отправить)"
                @keydown.ctrl.enter.prevent="sendFollowUp"
                @keydown.meta.enter.prevent="sendFollowUp"
              />
              <SupportAttachmentPicker v-model="followUpFiles" :paste-target="panel" />
              <div class="flex justify-end">
                <button type="submit" class="send-btn" :disabled="!followUp.trim()">
                  <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
                  Отправить
                </button>
              </div>
            </form>
            <p v-else class="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">Обращение закрыто. Если вопрос остался — создайте новое.</p>
          </div>

          <!-- Ticket list -->
          <div v-else class="p-2">
            <div v-if="supportStore.myLoading && !supportStore.myTickets.length" class="py-10 text-center text-xs text-gray-400">Загрузка...</div>
            <div v-else-if="!supportStore.myTickets.length" class="py-10 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
              Обращений пока нет. Если что-то случится — пишите, я передам команде.
            </div>
            <button
              v-for="t in supportStore.myTickets"
              :key="t.id"
              type="button"
              class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              @click="openTicket(t.id)"
            >
              <div class="flex items-center gap-2">
                <span v-if="t.hasUnread" class="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Новый ответ" />
                <span class="text-xs font-bold text-gray-900 dark:text-white truncate">#{{ t.id }} · {{ SUPPORT_CATEGORY_LABELS[t.category] }}</span>
                <span class="ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md" :class="SUPPORT_STATUS_META[t.status].badge">
                  {{ SUPPORT_STATUS_META[t.status].label }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">{{ t.preview }}</p>
            </button>
          </div>
        </template>

        <!-- Success -->
        <div v-else-if="status === 'success'" class="min-h-full flex flex-col items-center justify-center px-5 py-8 text-center">
          <div class="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-emerald-500" />
          </div>
          <p class="mt-4 font-bold text-gray-900 dark:text-white">Миссия выполнена!</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Сообщение передано команде.
            <template v-if="isLoggedIn">Ответ появится во вкладке «Мои обращения».</template>
            <template v-else>Ответим на <span class="font-semibold text-gray-700 dark:text-gray-300">{{ contactEmail }}</span></template>
          </p>
          <button
            type="button"
            class="mt-5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            @click="reset"
          >
            Написать ещё
          </button>
        </div>

        <!-- Form -->
        <form v-else class="p-4 space-y-3" @submit.prevent="submit">
          <div class="bubble">
            Привет! Я Холди. Расскажите, что случилось, — я мгновенно доставлю сообщение команде.
          </div>

          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="c in categories"
              :key="c.value"
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              :class="category === c.value
                ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400/60 dark:bg-amber-400/10 dark:text-amber-300'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'"
              @click="category = c.value"
            >
              <UIcon :name="c.icon" class="w-3.5 h-3.5" />
              {{ c.label }}
            </button>
          </div>

          <UTextarea
            ref="messageInput"
            v-model="message"
            :rows="4"
            autoresize
            :maxrows="8"
            :placeholder="currentCategory.placeholder"
          />

          <UInput
            v-if="!userEmail"
            v-model="email"
            type="email"
            placeholder="Ваш email для ответа"
            icon="i-heroicons-envelope"
          />

          <SupportAttachmentPicker v-model="attachments" :paste-target="panel" />

          <p v-if="errorText" class="text-xs text-red-600 dark:text-red-400">{{ errorText }}</p>

          <div class="flex items-center justify-between gap-3 pt-1">
            <span class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ userEmail ? `Ответим на ${userEmail}` : 'Отправим вместе с адресом страницы' }}
            </span>
            <button type="submit" class="send-btn" :disabled="status === 'sending' || !canSubmit">
              <UIcon
                :name="status === 'sending' ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
                class="w-4 h-4"
                :class="{ 'animate-spin': status === 'sending' }"
              />
              {{ status === 'sending' ? 'Отправляю...' : 'Отправить' }}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Transition>

    <!-- Greeting bubble -->
    <Transition name="speech">
      <div
        v-if="hintPhase === 'speaking' && !isOpen"
        class="speech relative mb-3 mr-3 w-[min(270px,calc(100vw-2rem))]"
        role="status"
        aria-live="polite"
      >
        <div class="speech-inner rounded-2xl bg-white dark:bg-gray-900">
          <div class="flex items-center gap-2 px-4 pt-3">
            <span class="sound-wave" aria-hidden="true"><i /><i /><i /><i /></span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Холди говорит</span>
          </div>
          <button
            type="button"
            class="block w-full text-left px-4 pt-1.5 pb-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white"
            @click="open"
          >
            <span>{{ typedText }}</span><span v-if="isTyping" class="caret" />
            <span class="sr-only">{{ hints[hintIndex] }}</span>
          </button>
          <label class="flex items-center gap-1.5 mx-4 mb-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400 cursor-pointer select-none hover:text-gray-600 dark:border-gray-800 dark:text-gray-500 dark:hover:text-gray-300">
            <input
              type="checkbox"
              class="w-3.5 h-3.5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700"
              @change="muteHints"
            />
            Понятно, не напоминай
          </label>
        </div>
        <span class="speech-tail" aria-hidden="true" />
      </div>
    </Transition>

    <!-- Robot launcher -->
    <button
      ref="launcher"
      type="button"
      class="launcher relative w-20 h-24 sm:w-24 sm:h-28 focus:outline-none"
      :aria-label="isOpen ? 'Свернуть помощника' : 'Открыть помощника'"
      :aria-expanded="isOpen"
      @click="toggle"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <span class="halo" :class="{ 'halo-hidden': hintPhase === 'flying' }" />
      <span
        v-if="supportStore.myUnreadCount && !isOpen"
        class="absolute top-1 right-1 z-10 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-900"
        title="Новый ответ от поддержки"
      >{{ supportStore.myUnreadCount }}</span>
      <span class="flight block relative w-full h-full" :class="{ flying: hintPhase === 'flying' }">
        <SupportRobot :state="robotState" class="w-full h-full text-gray-900 dark:text-black" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { RobotState } from './Robot.vue'

type Status = 'idle' | 'sending' | 'success' | 'error'

const MUTE_KEY = 'investhold-robot-hints-muted'
const FIRST_HINT_DELAY = 5000
const HINT_INTERVAL = 2 * 60 * 1000
const FLIGHT_DURATION = 1800
const HINT_DURATION = 9000
const TYPE_SPEED = 28
const MIN_MESSAGE_LENGTH = 10

const hints = [
  'Нажми на меня, если хочешь отправить сообщение!',
  'Нашёл ошибку? Нажми на меня — передам команде.',
  'Есть идея, как сделать InvestHold лучше? Жми на меня!',
  'Остался вопрос? Нажми на меня — я на связи.'
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const categories = [
  { value: 'bug', label: 'Ошибка', icon: 'i-heroicons-bug-ant', placeholder: 'Что пошло не так? Что вы делали перед этим?' },
  { value: 'idea', label: 'Идея', icon: 'i-heroicons-light-bulb', placeholder: 'Какой функции вам не хватает?' },
  { value: 'question', label: 'Вопрос', icon: 'i-heroicons-question-mark-circle', placeholder: 'Что хотите узнать?' },
  { value: 'other', label: 'Другое', icon: 'i-heroicons-chat-bubble-left-ellipsis', placeholder: 'Напишите сообщение...' }
] as const

type Category = (typeof categories)[number]['value']

const authStore = useAuthStore()
const supportStore = useSupportStore()
const route = useRoute()
const toast = useToast()

const tabs = [
  { value: 'new', label: 'Написать' },
  { value: 'my', label: 'Мои обращения' }
] as const
const tab = ref<'new' | 'my'>('new')
const panel = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const attachments = ref<File[]>([])
const followUp = ref('')
const followUpFiles = ref<File[]>([])
const isLoggedIn = computed(() => authStore.isAuthenticated)

const isOpen = ref(false)
const hovered = ref(false)
const hintPhase = ref<'off' | 'flying' | 'speaking'>('off')
const hintIndex = ref(0)
const typedText = ref('')
const isTyping = computed(() => hintPhase.value === 'speaking' && typedText.value.length < hints[hintIndex.value]!.length)
const root = ref<HTMLElement | null>(null)
const launcher = ref<HTMLElement | null>(null)
const spot = reactive({ x: 0, y: 0 })
const status = ref<Status>('idle')
const errorText = ref('')

const category = ref<Category>('bug')
const message = ref('')
const email = ref('')
const messageInput = ref<{ textarea?: HTMLTextAreaElement } | null>(null)

const userEmail = computed(() => authStore.user?.email ?? '')
const contactEmail = computed(() => userEmail.value || email.value)
const currentCategory = computed(() => categories.find((c) => c.value === category.value)!)

const canSubmit = computed(
  () => message.value.trim().length >= MIN_MESSAGE_LENGTH && (!!userEmail.value || EMAIL_RE.test(email.value.trim()))
)

const robotState = computed<RobotState>(() => {
  if (status.value === 'sending') return 'thinking'
  if (status.value === 'success') return 'happy'
  if (status.value === 'error') return 'sad'
  if (isOpen.value) return 'listening'
  if (hintPhase.value === 'flying') return 'fly'
  if (hovered.value || hintPhase.value === 'speaking') return 'wave'
  return 'idle'
})

function open() {
  isOpen.value = true
  endHint()
  nextTick(() => messageInput.value?.textarea?.focus())
}

function close() {
  isOpen.value = false
  if (status.value !== 'sending') {
    if (status.value === 'success') reset()
    errorText.value = ''
    if (status.value === 'error') status.value = 'idle'
  }
}

function toggle() {
  isOpen.value ? close() : open()
}

function reset() {
  status.value = 'idle'
  message.value = ''
  attachments.value = []
  errorText.value = ''
  category.value = 'bug'
}

function switchTab(value: 'new' | 'my') {
  tab.value = value
  if (value === 'my') {
    supportStore.closeMyCurrent()
    supportStore.fetchMyTickets()
  }
}

async function openTicket(id: number) {
  try {
    await supportStore.openMyTicket(id)
    scrollToBottom(true)
  } catch (error: any) {
    toast.add({ title: error?.data?.message || 'Не удалось открыть обращение', color: 'red' })
  }
}

// Optimistic: the message appears in the thread at once and the input clears;
// delivery state (sending / failed + retry) is shown on the message itself.
function sendFollowUp() {
  const ticket = supportStore.myCurrent
  if (!ticket || !followUp.value.trim()) return
  supportStore.sendMessage('user', ticket.id, { text: followUp.value.trim(), attachments: followUpFiles.value })
  followUp.value = ''
  followUpFiles.value = []
  scrollToBottom(true)
}

/** Scrolls the panel to the newest message; unless forced, only if the user is already near the bottom */
function scrollToBottom(force = false) {
  nextTick(() => {
    const el = body.value
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (force || nearBottom) el.scrollTop = el.scrollHeight
  })
}

// Open thread: poll fast so replies show up without reloading
usePolling(
  async () => {
    if (await supportStore.refreshMyCurrent()) scrollToBottom()
  },
  4000,
  () => isOpen.value && tab.value === 'my' && !!supportStore.myCurrent
)

// Ticket list / unread badge on the robot
usePolling(() => supportStore.fetchMyTickets(), 30_000, () => isLoggedIn.value)

async function submit() {
  if (!canSubmit.value) {
    errorText.value =
      message.value.trim().length < MIN_MESSAGE_LENGTH
        ? `Опишите чуть подробнее — минимум ${MIN_MESSAGE_LENGTH} символов`
        : 'Укажите корректный email, чтобы мы могли ответить'
    return
  }

  status.value = 'sending'
  errorText.value = ''

  try {
    await supportStore.createTicket({
      category: category.value,
      message: message.value.trim(),
      email: contactEmail.value,
      page: route.fullPath,
      userAgent: navigator.userAgent,
      attachments: attachments.value
    })
    status.value = 'success'
    if (isLoggedIn.value) supportStore.fetchMyTickets()
  } catch (error: any) {
    status.value = 'error'
    errorText.value = error?.data?.message || 'Не удалось отправить. Попробуйте ещё раз чуть позже.'
    setTimeout(() => {
      if (status.value === 'error') status.value = 'idle'
    }, 2500)
  }
}

let firstHintTimer: ReturnType<typeof setTimeout> | undefined
let hintInterval: ReturnType<typeof setInterval> | undefined
let phaseTimer: ReturnType<typeof setTimeout> | undefined
let typeTimer: ReturnType<typeof setInterval> | undefined

function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function endHint() {
  clearTimeout(phaseTimer)
  clearInterval(typeTimer)
  if (hintPhase.value !== 'off') {
    hintIndex.value = (hintIndex.value + 1) % hints.length
  }
  hintPhase.value = 'off'
  typedText.value = ''
}

function stopHints() {
  clearTimeout(firstHintTimer)
  clearInterval(hintInterval)
  endHint()
}

// Spotlight is centred between the robot and its speech bubble.
function updateSpot() {
  const rect = launcher.value?.getBoundingClientRect()
  if (!rect) return
  spot.x = rect.left + rect.width / 2 - 60
  spot.y = rect.top - 30
}

function startSpeaking() {
  hintPhase.value = 'speaking'
  const text = hints[hintIndex.value]!

  if (prefersReducedMotion()) {
    typedText.value = text
  } else {
    typedText.value = ''
    let i = 0
    typeTimer = setInterval(() => {
      typedText.value = text.slice(0, ++i)
      if (i >= text.length) clearInterval(typeTimer)
    }, TYPE_SPEED)
  }

  phaseTimer = setTimeout(endHint, HINT_DURATION)
}

function showHint() {
  // Don't interrupt: panel open, user hovering the robot, or already talking
  if (isOpen.value || hovered.value || hintPhase.value !== 'off') return
  updateSpot()

  if (prefersReducedMotion()) {
    startSpeaking()
    return
  }
  hintPhase.value = 'flying'
  phaseTimer = setTimeout(startSpeaking, FLIGHT_DURATION)
}

function muteHints() {
  try {
    localStorage.setItem(MUTE_KEY, '1')
  } catch {
    // storage unavailable — mute for this page view at least
  }
  stopHints()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && hintPhase.value !== 'off') endHint()
}

// Any tap outside the robot and its bubble dismisses the hint. The veil itself
// lets clicks through, so the tapped page element still gets its click.
function onPointerDown(e: PointerEvent) {
  if (hintPhase.value === 'off') return
  if (root.value?.contains(e.target as Node)) return
  endHint()
}

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    supportStore.fetchMyTickets()
  } else {
    tab.value = 'new'
    supportStore.$patch({ myTickets: [], myCurrent: null })
  }
})

onMounted(() => {
  if (isLoggedIn.value) supportStore.fetchMyTickets()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('resize', updateSpot)
  if (isMuted()) return
  firstHintTimer = setTimeout(showHint, FIRST_HINT_DELAY)
  hintInterval = setInterval(showHint, HINT_INTERVAL)
})

onBeforeUnmount(() => {
  stopHints()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('resize', updateSpot)
})
</script>

<style scoped>
.header {
  background:
    radial-gradient(ellipse at 15% 0%, rgba(255, 200, 101, 0.45), transparent 60%),
    linear-gradient(135deg, #0f2a35 0%, #1c667d 60%, #23849f 100%);
}

.bubble {
  position: relative;
  padding: 10px 12px;
  border-radius: 14px;
  border-top-left-radius: 4px;
  font-size: 13px;
  line-height: 1.45;
  color: #0f172a;
  background: linear-gradient(135deg, #ecfeff, #f0f9ff);
  border: 1px solid #cffafe;
}
.dark .bubble {
  color: #e2e8f0;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(28, 102, 125, 0.18));
  border-color: rgba(34, 211, 238, 0.2);
}

.send-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  background: linear-gradient(135deg, #ffd88a 0%, #ffc865 45%, #ff9f43 100%);
  box-shadow: 0 6px 18px -6px rgba(255, 160, 50, 0.6);
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}
.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -6px rgba(255, 160, 50, 0.75);
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Launcher */
.launcher {
  transition: transform 0.25s ease;
}
.launcher:hover {
  transform: scale(1.06);
}
.launcher:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 4px;
  border-radius: 16px;
}
.halo {
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 70%;
  height: 22%;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: radial-gradient(ellipse, rgba(34, 211, 238, 0.55), transparent 70%);
  filter: blur(6px);
  animation: halo 3.2s ease-in-out infinite;
}
@keyframes halo {
  0%, 100% { opacity: 0.9; transform: translateX(-50%) scaleX(1); }
  50% { opacity: 0.5; transform: translateX(-50%) scaleX(0.8); }
}

/* Transitions */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom right;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}

/* Spotlight: dark veil with a soft hole around the robot and its bubble */
.spotlight {
  z-index: -1;
  background: radial-gradient(
    circle at var(--spot-x) var(--spot-y),
    transparent 0,
    transparent 150px,
    rgba(2, 6, 23, 0.55) 300px,
    rgba(2, 6, 23, 0.7) 100%
  );
}
.spotlight-enter-active,
.spotlight-leave-active {
  transition: opacity 0.5s ease;
}
.spotlight-enter-from,
.spotlight-leave-to {
  opacity: 0;
}

/* Speech bubble */
.speech-inner {
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow:
    0 0 0 2px rgba(34, 211, 238, 0.9),
    0 0 28px 4px rgba(34, 211, 238, 0.45),
    0 20px 40px -12px rgba(0, 0, 0, 0.5);
  animation: speech-glow 2s ease-in-out infinite;
}
.speech-tail {
  position: absolute;
  right: 34px;
  bottom: -7px;
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  background: #ffffff;
  box-shadow: 2px 2px 0 0 rgba(34, 211, 238, 0.9);
}
.dark .speech-tail {
  background: #111827;
}
@keyframes speech-glow {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.9), 0 0 22px 2px rgba(34, 211, 238, 0.35), 0 20px 40px -12px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(255, 200, 101, 0.95), 0 0 34px 6px rgba(255, 200, 101, 0.45), 0 20px 40px -12px rgba(0, 0, 0, 0.5);
  }
}

.sound-wave {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 12px;
}
.sound-wave i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: #22d3ee;
  animation: sound 0.9s ease-in-out infinite;
}
.sound-wave i:nth-child(2) { animation-delay: 0.15s; }
.sound-wave i:nth-child(3) { animation-delay: 0.3s; }
.sound-wave i:nth-child(4) { animation-delay: 0.45s; }
@keyframes sound {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: #22d3ee;
  animation: caret 0.7s steps(1) infinite;
}
@keyframes caret {
  50% { opacity: 0; }
}

.speech-enter-active {
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom right;
}
.speech-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  transform-origin: bottom right;
}
.speech-enter-from,
.speech-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(16px);
}

/* Flight: swoop left, loop back right, land */
.flight.flying {
  animation: fly 1.8s cubic-bezier(0.45, 0, 0.25, 1);
}
@keyframes fly {
  0% { transform: translate(0, 0) rotate(0); }
  12% { transform: translate(0, -26px) rotate(0); }
  35% { transform: translate(-130px, -70px) rotate(-16deg); }
  55% { transform: translate(-170px, -30px) rotate(10deg); }
  78% { transform: translate(-40px, -60px) rotate(14deg); }
  90% { transform: translate(8px, -14px) rotate(-6deg); }
  100% { transform: translate(0, 0) rotate(0); }
}
.halo {
  transition: opacity 0.3s ease;
}
.halo-hidden {
  opacity: 0 !important;
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .halo,
  .speech-inner,
  .sound-wave i,
  .caret { animation: none; }
}
</style>
