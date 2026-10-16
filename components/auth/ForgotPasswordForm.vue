<template>
  <div>
    <h2 class="text-2xl font-bold mb-2 text-[#386c7d] dark:text-cyan-400">Восстановление пароля</h2>

    <!-- Sent -->
    <div v-if="sentTo" class="space-y-4">
      <div class="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4 dark:bg-emerald-500/10 dark:border-emerald-500/20">
        <UIcon name="i-heroicons-envelope-open" class="w-6 h-6 text-emerald-600 shrink-0 dark:text-emerald-400" />
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Если аккаунт с адресом <b class="text-gray-900 dark:text-white">{{ sentTo }}</b> существует, мы отправили на него письмо со ссылкой для смены пароля.
          Ссылка действует 1 час.
        </div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Не пришло? Проверьте папку «Спам» или отправьте ещё раз.
      </p>
      <UButton
        block
        size="lg"
        color="gray"
        variant="soft"
        :loading="pending"
        :disabled="cooldown > 0"
        @click="send"
      >
        {{ cooldown > 0 ? `Отправить ещё раз через ${cooldown} с` : 'Отправить ещё раз' }}
      </UButton>
    </div>

    <!-- Request form -->
    <UForm v-else :schema="forgotPasswordSchema" :state="state" class="space-y-4" @submit="send">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Укажите email, с которым регистрировались, — пришлём ссылку для смены пароля.
      </p>
      <UFormGroup label="Email" name="email">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="you@example.com"
          icon="i-heroicons-envelope"
          size="lg"
          autofocus
        />
      </UFormGroup>

      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="pending"
        :ui="{ base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600', rounded: 'rounded-xl' }"
      >
        Отправить ссылку
      </UButton>
    </UForm>

    <div class="text-center mt-6">
      <NuxtLink to="/login" class="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
        ← Вернуться ко входу
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forgotPasswordSchema } from '~/utils/validation'

const RESEND_COOLDOWN = 60

const authStore = useAuthStore()
const route = useRoute()

const state = reactive({ email: typeof route.query.email === 'string' ? route.query.email : '' })
const pending = ref(false)
const error = ref('')
const sentTo = ref('')
const cooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | undefined

function startCooldown() {
  cooldown.value = RESEND_COOLDOWN
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function send() {
  const email = state.email.trim()
  if (!email || pending.value || cooldown.value > 0) return
  pending.value = true
  error.value = ''

  const result = await authStore.requestPasswordReset(email)
  pending.value = false

  if (result.success) {
    sentTo.value = email
    startCooldown()
  } else {
    error.value = result.error
  }
}

onUnmounted(() => clearInterval(cooldownTimer))
</script>
