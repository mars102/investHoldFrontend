<template>
  <div>
    <h2 class="text-2xl font-bold mb-6" style="color: #386c7d;">Вход в учетную запись</h2>

    <UForm :schema="loginSchema" :state="state" @submit="handleSubmit" class="space-y-4">
      <UFormField label="Email" name="email">
        <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            icon="i-heroicons-envelope"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } },
            base: 'bg-white/5 border-white/10 text-white placeholder-gray-400'
          }"
        />
      </UFormField>
      <br>
      <UFormField label="Password" name="password">
        <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } },
            base: 'bg-white/5 border-white/10 text-white placeholder-gray-400'
          }"
        />
      </UFormField>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <UCheckbox
              v-model="state.remember"
              color="primary"
              class="mr-2"
          />
          <span class="text-sm text-gray-300">Запомнить меня</span>
        </label>

<!-- убрал так как нет востановления пароля       <NuxtLink to="/forgot-password" class="text-sm text-cyan-400 hover:text-cyan-300 transition">-->
<!--          Forgot password?-->
<!--        </NuxtLink>-->
      </div>

      <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          :loading="pending"
          :ui="{
          base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
          rounded: 'rounded-xl'
        }"
      >
        <template v-if="!pending">
          Войти
        </template>
        <template v-else>
          Войти ...
        </template>
      </UButton>

      <div class="text-center mt-6">
        <p class="text-sm text-gray-400">
          У вас нет аккаунта?
          <NuxtLink to="/register" class="text-cyan-400 hover:text-cyan-300 ml-1 font-medium">
            Создать
          </NuxtLink>
        </p>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '../../utils/validation'

const authStore = useAuthStore()
const { $toast } = useNuxtApp()
const router = useRouter()

const pending = ref(false)

const state = reactive({
  email: '',
  password: '',
  remember: false
})

const handleSubmit = async () => {
  pending.value = true

  const result = await authStore.login({
    email: state.email,
    password: state.password
  })

  pending.value = false

  if (!result.success) {
    $toast.error(result.error || 'Login failed')
  }
}
</script>