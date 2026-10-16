<template>
  <div
    v-if="visible"
    class="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
  >
    <div class="flex items-start gap-3 flex-1 min-w-0">
      <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
      <p class="text-sm text-gray-700 dark:text-gray-300">
        <span class="font-semibold text-gray-900 dark:text-white">Подтвердите email.</span>
        Мы отправили письмо со ссылкой на <b>{{ authStore.user?.email }}</b> — так вы сможете восстановить пароль, если забудете его.
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <span v-if="message" class="text-xs" :class="messageIsError ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">{{ message }}</span>
      <UButton
        size="xs"
        color="amber"
        variant="soft"
        :loading="sending"
        :disabled="cooldown > 0"
        @click="resend"
      >
        {{ cooldown > 0 ? `Ещё раз через ${cooldown} с` : 'Отправить письмо ещё раз' }}
      </UButton>
      <button
        type="button"
        class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-amber-100 dark:hover:text-gray-200 dark:hover:bg-amber-500/10"
        aria-label="Скрыть"
        @click="dismiss"
      >
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const DISMISS_KEY = 'investhold-verify-banner-dismissed'
const RESEND_COOLDOWN = 60

const authStore = useAuthStore()

const dismissed = ref(false)
const sending = ref(false)
const message = ref('')
const messageIsError = ref(false)
const cooldown = ref(0)

// Only an explicit `false` — if the backend doesn't send the field, stay quiet
const visible = computed(() => !dismissed.value && authStore.user?.emailVerified === false)

let cooldownTimer: ReturnType<typeof setInterval> | undefined

async function resend() {
  sending.value = true
  const result = await authStore.resendVerification()
  sending.value = false

  messageIsError.value = !result.success
  message.value = result.success ? 'Письмо отправлено' : result.error
  if (!result.success) return

  cooldown.value = RESEND_COOLDOWN
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

// Hidden for the current session only — it comes back until the email is confirmed
function dismiss() {
  dismissed.value = true
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // storage unavailable
  }
}

onMounted(() => {
  try {
    dismissed.value = sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    // storage unavailable
  }
})

onUnmounted(() => clearInterval(cooldownTimer))
</script>
