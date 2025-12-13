<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Create Account</h2>

    <UForm :schema="registerSchema" :state="state" @submit="handleSubmit" class="space-y-4">
      <UFormField class="field-pole" label="Full Name" name="name">
        <UInput
            v-model="state.name"
            placeholder="John Doe"
            icon="i-heroicons-user"
            size="lg"
            :ui="{
            icon: { trailing: { pointer: '' } },
            base: 'bg-white/5 border-white/10 text-white placeholder-gray-400'
          }"
        />
      </UFormField>

      <UFormField class="field-pole" label="Email" name="email">
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

      <div class="flex items-center">
        <UCheckbox
            v-model="state.terms"
            color="primary"
            class="mr-2"
        />
        <span class="text-sm text-gray-300">
          I agree to the
          <a href="#" class="text-cyan-400 hover:text-cyan-300">Terms</a> and
          <a href="#" class="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
        </span>
      </div>

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
          Create Account
        </template>
        <template v-else>
          Creating account...
        </template>
      </UButton>

      <div class="text-center mt-6">
        <p class="text-sm text-gray-400">
          Already have an account?
          <NuxtLink to="/login" class="text-cyan-400 hover:text-cyan-300 ml-1 font-medium">
            Sign In
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const handleSubmit = async () => {
  if (!state.terms) {
    $toast.error('Please accept the terms and conditions')
    return
  }

  pending.value = true

  const result = await authStore.register({
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
</style>