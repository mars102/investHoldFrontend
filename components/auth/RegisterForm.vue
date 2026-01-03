<template>
  <div>
    <h2 class="text-2xl font-bold mb-6" style="color: #386c7d;">Создание аккаунта</h2>

    <UForm :schema="registerSchema" :state="state" @submit="handleSubmit">
      <div class="field-pole">
        <UFormField  label="Full Name" name="name">
        <UInput
            v-model="state.username"
            placeholder="Login"
            icon="i-heroicons-user"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } },
            base: 'bg-white/5 border-white/10 text-white placeholder-gray-400'
          }"
        />
      </UFormField>
      </div>
      <div class="field-pole">
        <UFormField  label="Email" name="email">
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
      </div>
      <div class="field-pole">
      <UFormField class="field-pole" label="Password" name="password">
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
      </div>
      <div class="field-pole">
      <UFormField class="field-pole" label="Confirm Password" name="confirmPassword">
        <UInput
            v-model="state.confirmPassword"
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
      </div>
      <div class="button-pole">
      <div class="flex items-center">
        <UCheckbox
            v-model="state.terms"
            color="primary"
            class="mr-2"
        />
        <span class="text-sm text-gray-300" style="font-size: 12px;">
         Я согласен с  и Политикой конфиденциальности
          <a href="#" class="text-cyan-400 hover:text-cyan-300">Условиями</a> и
          <a href="#" class="text-cyan-400 hover:text-cyan-300">Политикой конфидециальности</a>
        </span>
      </div>
      </div>
      <div class="button-pole">
      <UButton
          type="submit"
          block
          size="lg"
          color="primary"
          :loading="pending"
          :disabled="!state.terms"
          :ui="{
          base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
          rounded: 'rounded-xl'
        }"
      >
        <template v-if="!pending">
          Создать аккаунт
        </template>
        <template v-else>
          Создание акаунта...
        </template>
      </UButton>
      </div>
      <div class="text-center mt-2">
        <p class="text-sm text-gray-400">
          Уже есть аккаунт?
          <NuxtLink to="/login" class="text-cyan-400 hover:text-cyan-300 ml-1 font-medium">
           Войти
          </NuxtLink>
        </p>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { registerSchema } from '~/utils/validation'


const authStore = useAuthStore()
const { $toast } = useNuxtApp()
const router = useRouter()

const pending = ref(false)

const state = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const handleSubmit = async () => {
  console.log("что происходит !!!")
  if (!state.terms) {
    $toast.error('Please accept the terms and conditions')
    return
  }

  pending.value = true

  const result = await authStore.register({
    username: state.username,
    email: state.email,
    password: state.password
  })

  pending.value = false

  if (!result.success) {
    $toast.error(result.error || 'Registration failed')
  }
}
</script>

<style>
.field-pole{
  margin-bottom: 10px;
}
.button-pole{
  padding-bottom: 5px;
}
</style>