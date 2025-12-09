<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <!-- Floating Orbs -->
      <div class="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <!-- Particles -->
      <div class="particles">
        <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- Login Form Container -->
    <div class="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
      <!-- Glassmorphism Card -->
      <div class="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-cyan-500/20">

        <!-- Logo/Icon with Animation -->
        <div class="flex justify-center mb-8 animate-bounce-slow">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <div class="relative bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-4 rounded-2xl">
              <svg class="w-12 h-12 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="text-center mb-8 animate-fade-in">
          <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2 animate-gradient">
            Welcome Back
          </h2>
          <p class="text-gray-300 text-sm animate-fade-in animation-delay-200">
            Sign in to continue to your account
          </p>
        </div>

        <UForm :schema="loginSchema" :state="state" @submit="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div class="group animate-slide-in-right animation-delay-400">
            <UFormField label="Email" name="email" class="relative">
              <template #label>
                <label class="text-gray-300 font-medium mb-2 flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                  <span class="inline-block transition-transform group-hover:scale-110">✉️</span>
                  Email Address
                </label>
              </template>
              <div class="relative">
                <UInput
                    v-model="state.email"
                    type="email"
                    placeholder="you@example.com"
                    size="lg"
                    class="input-glow"
                    :ui="{
                      base: 'bg-white/5 border-2 border-white/10 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 hover:bg-white/10 hover:border-white/20',
                      rounded: 'rounded-2xl'
                    }"
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div class="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </UFormField>
          </div>

          <!-- Password Field -->
          <div class="group animate-slide-in-right animation-delay-600">
            <UFormField label="Password" name="password" class="relative">
              <template #label>
                <label class="text-gray-300 font-medium mb-2 flex items-center gap-2 group-hover:text-purple-400 transition-colors">
                  <span class="inline-block transition-transform group-hover:scale-110">🔒</span>
                  Password
                </label>
              </template>
              <div class="relative">
                <UInput
                    v-model="state.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    size="lg"
                    class="input-glow"
                    :ui="{
                      base: 'bg-white/5 border-2 border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 hover:bg-white/10 hover:border-white/20',
                      rounded: 'rounded-2xl'
                    }"
                />
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all hover:scale-110"
                >
                  <span v-if="!showPassword">👁️</span>
                  <span v-else>🙈</span>
                </button>
              </div>
            </UFormField>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between animate-fade-in animation-delay-800">
            <label class="flex items-center group cursor-pointer">
              <UCheckbox
                  v-model="state.remember"
                  color="primary"
                  class="mr-3 transition-transform group-hover:scale-110"
              />
              <span class="text-sm text-gray-300 group-hover:text-white transition-colors">Remember me</span>
            </label>

            <NuxtLink
                to="/forgot-password"
                class="text-sm text-cyan-400 hover:text-cyan-300 transition-all hover:underline hover:scale-105 inline-block font-medium"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <!-- Submit Button -->
          <div class="animate-fade-in animation-delay-1000">
            <button
                type="submit"
                :disabled="pending"
                class="relative w-full py-4 px-6 text-white font-bold text-lg rounded-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <!-- Animated Background -->
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110"></div>

              <!-- Shimmer Effect -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>

              <!-- Button Content -->
              <span class="relative flex items-center justify-center gap-3">
                <template v-if="!pending">
                  <span class="transition-transform group-hover:translate-x-[-4px]">Sign In</span>
                  <span class="transition-transform group-hover:translate-x-[4px]">🚀</span>
                </template>
                <template v-else>
                  <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </template>
              </span>
            </button>
          </div>

          <!-- Divider -->
          <div class="relative animate-fade-in animation-delay-1200">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/10"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 text-gray-400 bg-transparent">or continue with</span>
            </div>
          </div>

          <!-- Social Login -->
          <div class="grid grid-cols-3 gap-3 animate-fade-in animation-delay-1400">
            <button
                type="button"
                class="flex justify-center items-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <span class="text-2xl transition-transform group-hover:rotate-12">🔵</span>
            </button>
            <button
                type="button"
                class="flex justify-center items-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <span class="text-2xl transition-transform group-hover:rotate-12">🐦</span>
            </button>
            <button
                type="button"
                class="flex justify-center items-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <span class="text-2xl transition-transform group-hover:rotate-12">🔴</span>
            </button>
          </div>

          <!-- Sign Up Link -->
          <div class="text-center mt-6 animate-fade-in animation-delay-1600">
            <p class="text-sm text-gray-400">
              Don't have an account?
              <NuxtLink
                  to="/register"
                  class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 ml-1 font-bold transition-all hover:scale-105 inline-block"
              >
                Sign Up Now ✨
              </NuxtLink>
            </p>
          </div>
        </UForm>
      </div>

      <!-- Floating Elements -->
      <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-float"></div>
      <div class="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-2xl opacity-50 animate-float animation-delay-2000"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '../../utils/validation'

const authStore = useAuthStore()
const { $toast } = useNuxtApp()
const router = useRouter()

const pending = ref(false)
const showPassword = ref(false)

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

const getParticleStyle = (index: number) => {
  const delay = Math.random() * 20
  const duration = 15 + Math.random() * 10
  const left = Math.random() * 100

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}
</script>

<style scoped>
/* Animations */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-bounce-slow {
  animation: bounceSlow 3s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-800 {
  animation-delay: 0.8s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-1200 {
  animation-delay: 1.2s;
}

.animation-delay-1400 {
  animation-delay: 1.4s;
}

.animation-delay-1600 {
  animation-delay: 1.6s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  bottom: -10px;
  animation: particleFloat linear infinite;
  opacity: 0;
}

/* Input Glow Effect */
.input-glow:focus-within {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}
</style>