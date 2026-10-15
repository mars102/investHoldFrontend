<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-[#386c7d] dark:text-cyan-400">Вход в учетную запись</h2>

    <UForm :schema="loginSchema" :state="state" @submit="handleSubmit" class="space-y-4">
      <UFormGroup label="Email или логин" name="login">
        <UInput
            v-model="state.login"
            type="text"
            placeholder="email или логин"
            icon="i-heroicons-user"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } }
          }"
        />
      </UFormGroup>
      <br>
      <UFormGroup label="Пароль" name="password">
        <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } }
          }"
        />
      </UFormGroup>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <UCheckbox
              v-model="state.remember"
              color="primary"
              class="mr-2"
          />
          <span class="text-sm text-gray-600 dark:text-gray-300">Запомнить меня</span>
        </label>
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
        <p class="text-sm text-gray-400 dark:text-gray-500">
          У вас нет аккаунта?
          <NuxtLink to="/register" class="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 ml-1 font-medium">
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
const toast = useToast()

const pending = ref(false)

const state = reactive({
  login: '',
  password: '',
  remember: false
})

const handleSubmit = async () => {
  pending.value = true

  const result = await authStore.login({
    login: state.login,
    password: state.password
  })

  pending.value = false

  if (!result.success) {
    toast.add({ title: result.error || 'Вход не выполнен', color: 'red' })
  }
}
</script>