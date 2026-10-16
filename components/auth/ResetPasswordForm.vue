<template>
  <div>
    <h2 class="text-2xl font-bold mb-2 text-[#386c7d] dark:text-cyan-400">Новый пароль</h2>

    <!-- No token in the link -->
    <div v-if="!token" class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Ссылка неполная. Откройте её из письма целиком или запросите новую.
      </p>
      <UButton to="/forgot-password" block size="lg" color="gray" variant="soft">Запросить новую ссылку</UButton>
    </div>

    <!-- Done -->
    <div v-else-if="done" class="space-y-4 text-center">
      <div class="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
        <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-emerald-500" />
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300">Пароль изменён. Теперь войдите с новым паролем.</p>
      <UButton
        to="/login"
        block
        size="lg"
        :ui="{ base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600', rounded: 'rounded-xl' }"
      >
        Войти
      </UButton>
    </div>

    <!-- Expired / invalid token -->
    <div v-else-if="tokenInvalid" class="space-y-4">
      <div class="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4 dark:bg-amber-500/10 dark:border-amber-500/20">
        <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-600 shrink-0 dark:text-amber-400" />
        <p class="text-sm text-gray-700 dark:text-gray-300">{{ error || 'Ссылка устарела или уже использована.' }}</p>
      </div>
      <UButton to="/forgot-password" block size="lg" color="gray" variant="soft">Запросить новую ссылку</UButton>
    </div>

    <!-- Form -->
    <UForm v-else :schema="resetPasswordSchema" :state="state" class="space-y-4" @submit="submit">
      <p class="text-sm text-gray-500 dark:text-gray-400">Придумайте новый пароль — минимум 6 символов.</p>
      <UFormGroup label="Новый пароль" name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="i-heroicons-lock-closed"
          size="lg"
          autofocus
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5" />
            </button>
          </template>
        </UInput>
      </UFormGroup>
      <UFormGroup label="Повторите пароль" name="confirmPassword">
        <UInput
          v-model="state.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          icon="i-heroicons-lock-closed"
          size="lg"
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
        Сохранить пароль
      </UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { resetPasswordSchema } from '~/utils/validation'

const authStore = useAuthStore()
const route = useRoute()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const state = reactive({ password: '', confirmPassword: '' })
const showPassword = ref(false)
const pending = ref(false)
const error = ref('')
const done = ref(false)
const tokenInvalid = ref(false)

async function submit() {
  if (pending.value) return
  pending.value = true
  error.value = ''

  const result = await authStore.resetPassword(token.value, state.password)
  pending.value = false

  if (result.success) {
    done.value = true
    return
  }
  error.value = result.error
  // 400/404/410 from the backend mean the token is bad — no point retrying the form
  if (result.status && [400, 404, 410].includes(result.status)) tokenInvalid.value = true
}
</script>
