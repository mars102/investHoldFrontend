<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
    <!-- Ultra-Compact Header -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <!-- Logo Section -->
          <div class="flex items-center gap-2">
            <div class="logo-icon">
              <img src="/images/logo.png">
            </div>
            <div class="flex flex-col leading-tight">
              <h1 class="text-lg font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                InvestHold
              </h1>
              <p class="text-[10px] text-gray-500 font-medium tracking-wide">ULTRA EDITION</p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
                to="/"
                class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                active-class="!text-orange-600 !bg-orange-50 !font-bold"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-400 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar" class="w-2.5 h-2.5 text-white" />
                </div>
                <span>Portfolio</span>
              </div>
            </NuxtLink>

            <NuxtLink
                to="/trades"
                class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                active-class="!text-blue-600 !bg-blue-50 !font-bold"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-400 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-arrow-path" class="w-2.5 h-2.5 text-white" />
                </div>
                <span>Trades</span>
              </div>
            </NuxtLink>

            <NuxtLink
                to="/analytics"
                class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                active-class="!text-purple-600 !bg-purple-50 !font-bold"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-400 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-pie" class="w-2.5 h-2.5 text-white" />
                </div>
                <span>Analytics</span>
              </div>
            </NuxtLink>

            <NuxtLink
                to="/coins"
                class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                active-class="!text-emerald-600 !bg-emerald-50 !font-bold"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-400 rounded flex items-center justify-center">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-2.5 h-2.5 text-white" />
                </div>
                <span>Монеты</span>
              </div>
            </NuxtLink>
          </nav>

          <!-- User Menu -->
          <UserMenu />
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 py-2 px-4 z-40">
      <div class="flex justify-around items-center">
        <NuxtLink
            to="/"
            class="flex flex-col items-center p-2"
            active-class="text-orange-600"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-semibold">Portfolio</span>
        </NuxtLink>

        <NuxtLink
            to="/trades"
            class="flex flex-col items-center p-2"
            active-class="text-blue-600"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-semibold">Trades</span>
        </NuxtLink>

        <NuxtLink
            to="/analytics"
            class="flex flex-col items-center p-2"
            active-class="text-purple-600"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-chart-pie" class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-semibold">Analytics</span>
        </NuxtLink>

        <NuxtLink
            to="/coins"
            class="flex flex-col items-center p-2"
            active-class="text-emerald-600"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-semibold">Монеты</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header Gradient Bar -->
        <div class="h-1 w-full mb-8 bg-gradient-to-r from-orange-500 via-blue-500 to-emerald-500 rounded-full"></div>

        <slot />

        <!-- Modern Footer -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg"></div>
              <span class="text-xs font-bold text-gray-700">InvestHold Pro v4.0</span>
            </div>
            <div class="flex items-center gap-6">
              <span class="text-xs text-gray-500 font-medium">© 2024 Ultra Edition</span>
              <div class="flex items-center gap-4">
                <a href="#" class="text-xs text-gray-500 hover:text-orange-600 font-medium">Terms</a>
                <a href="#" class="text-xs text-gray-500 hover:text-blue-600 font-medium">Privacy</a>
                <a href="#" class="text-xs text-gray-500 hover:text-emerald-600 font-medium">Docs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Notifications -->
    <ClientOnly>
      <UNotifications />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import UserMenu from '~/components/user/UserMenu.vue'
</script>

<style>
/* Custom Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #f97316, #3b82f6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ea580c, #2563eb);
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #f97316 0%, #3b82f6 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass Effect */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.logo-icon {
  width: 64px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: icon-pulse 4s ease-in-out infinite;
}
</style>