<template>
  <div class="text-center">
    <h2 class="text-2xl font-bold mb-6 text-[#386c7d] dark:text-cyan-400">Подтверждение email</h2>

    <div v-if="state === 'loading'" class="py-6 flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-cyan-500" />
      Проверяем ссылку…
    </div>

    <div v-else-if="state === 'success'" class="space-y-4">
      <div class="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
        <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-emerald-500" />
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300">Email подтверждён. Спасибо!</p>
      <UButton
        :to="authStore.isAuthenticated ? '/' : '/login'"
        block
        size="lg"
        :ui="{ base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600', rounded: 'rounded-xl' }"
      >
        {{ authStore.isAuthenticated ? 'Перейти в портфель' : 'Войти' }}
      </UButton>
    </div>

    <div v-else class="space-y-4">
      <div class="mx-auto w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-amber-500" />
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        {{ error || 'Ссылка устарела или уже использована.' }}
      </p>
      <template v-if="authStore.isAuthenticated">
        <UButton block size="lg" color="gray" variant="soft" :loading="resending" :disabled="resent" @click="resend">
          {{ resent ? 'Письмо отправлено' : 'Отправить новое письмо' }}
        </UButton>
      </template>
      <p v-else class="text-xs text-gray-500 dark:text-gray-400">
        Войдите в аккаунт — там можно отправить письмо ещё раз.
      </p>
      <UButton :to="authStore.isAuthenticated ? '/' : '/login'" block size="lg" color="gray" variant="ghost">
        {{ authStore.isAuthenticated ? 'В портфель' : 'Войти' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

const state = ref<'loading' | 'success' | 'error'>('loading')
const error = ref('')
const resending = ref(false)
const resent = ref(false)

async function resend() {
  resending.value = true
  const result = await authStore.resendVerification()
  resending.value = false
  if (result.success) resent.value = true
  else error.value = result.error
}

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    state.value = 'error'
    error.value = 'Ссылка неполная. Откройте её из письма целиком.'
    return
  }
  const result = await authStore.verifyEmail(token)
  if (result.success) {
    state.value = 'success'
  } else {
    state.value = 'error'
    error.value = result.error
  }
})
</script>
