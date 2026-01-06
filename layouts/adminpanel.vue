<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50/30">
    <!-- Premium Glass Header -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-blue-100/50 shadow-xl">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-20">
          <!-- Logo with Premium Glow -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="logo-icon relative z-10">
                <img src="/images/logo.png">
              </div>
              <div class="absolute -inset-2 bg-gradient-to-r from-blue-400 to-orange-400 rounded-2xl blur-lg opacity-70 animate-pulse-slow"></div>
            </div>

            <div class="flex flex-col leading-tight">
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-black bg-gradient-to-r from-blue-900 via-blue-700 to-orange-600 bg-clip-text text-transparent tracking-tight">
                  Invest<span class="text-orange-600">Hold</span>
                </h1>

              </div>
              <p class="text-xs text-gray-600 font-medium tracking-wide mt-1 flex items-center gap-2">
                <span class="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full text-blue-700 font-bold">ADMIN PANEL</span>
                <span>v4.0</span>
              </p>
            </div>
          </div>

          <!-- Premium Navigation with Glow Effects -->
          <nav class="hidden lg:flex items-center gap-1">
            <NuxtLink
                to="/admin/users"
                class="relative px-5 py-3 text-sm font-semibold text-gray-700 hover:text-blue-700 rounded-xl transition-all duration-300 group overflow-hidden"
                active-class="!text-blue-700 !font-bold"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div class="flex items-center gap-3 relative z-10">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-blue-200">
                  <UIcon name="i-heroicons-users" class="w-4 h-4 text-white" />
                </div>
                <span class="relative">
                  Пользователи
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </div>
            </NuxtLink>

            <NuxtLink
                to="/admin/tasks"
                class="relative px-5 py-3 text-sm font-semibold text-gray-700 hover:text-orange-700 rounded-xl transition-all duration-300 group overflow-hidden"
                active-class="!text-orange-700 !font-bold"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div class="flex items-center gap-3 relative z-10">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-orange-200">
                  <UIcon name="i-heroicons-clipboard-document-check" class="w-4 h-4 text-white" />
                </div>
                <span class="relative">
                  Задачи
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </div>
            </NuxtLink>

            <NuxtLink
                to="/admin/coins"
                class="relative px-5 py-3 text-sm font-semibold text-gray-700 hover:text-blue-700 rounded-xl transition-all duration-300 group overflow-hidden"
                active-class="!text-blue-700 !font-bold"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-orange-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div class="flex items-center gap-3 relative z-10">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-blue-200">
                  <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-white" />
                </div>
                <span class="relative">
                  Монеты
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
                </span>
              </div>
            </NuxtLink>
          </nav>

          <!-- User Menu with Premium Style -->
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <UserMenu class="relative" />
          </div>
        </div>
      </div>
    </header>



    <!-- Premium Mobile Navigation -->
    <div class="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div class="relative">
        <div class="absolute -inset-4 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl blur-xl opacity-30"></div>
        <div class="bg-white/95 backdrop-blur-2xl border border-blue-100/50 rounded-2xl py-3 px-6 shadow-2xl">
          <div class="flex items-center gap-8">
            <NuxtLink
                to="/admin/users"
                class="flex flex-col items-center p-2 group"
                active-class="text-blue-700"
            >
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-blue-200">
                <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600" />
              </div>
              <span class="text-xs font-bold text-gray-700">Пользователи</span>
            </NuxtLink>

            <NuxtLink
                to="/admin/tasks"
                class="flex flex-col items-center p-2 group"
                active-class="text-orange-700"
            >
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-orange-200">
                <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6 text-orange-600" />
              </div>
              <span class="text-xs font-bold text-gray-700">Задачи</span>
            </NuxtLink>

            <NuxtLink
                to="/admin/coins"
                class="flex flex-col items-center p-2 group"
                active-class="text-blue-700"
            >
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-blue-200">
                <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-blue-600" />
              </div>
              <span class="text-xs font-bold text-gray-700">Монеты</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="container mx-auto px-4 py-10 pb-32 lg:pb-12">
      <div class="max-w-7xl mx-auto">
        <!-- Premium Content Container -->
        <div class="relative mb-12">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl blur-xl opacity-20"></div>
          <div class="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-2xl overflow-hidden">
            <!-- Animated Header -->
            <div class="relative h-32 bg-gradient-to-r from-blue-600/10 via-orange-500/10 to-blue-600/10 overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.1),transparent_50%)]"></div>
              <div class="relative h-full flex items-center justify-between px-8">
                <div>
                  <h2 class="text-3xl font-black bg-gradient-to-r from-blue-900 via-blue-700 to-orange-600 bg-clip-text text-transparent">
                    <slot name="title">Админ-панель Elite</slot>
                  </h2>
                  <p class="text-gray-600 font-medium mt-2 flex items-center gap-3">
                    <span class="text-sm"><slot name="subtitle">Премиум управление системой</slot></span>
                    <span class="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-orange-500/10 rounded-full text-xs font-bold text-blue-700 border border-blue-200/50">ЭЛИТНЫЙ ДОСТУП</span>
                  </p>
                </div>
                <div class="hidden lg:block">
                  <div class="px-6 py-3 bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-blue-200/50 rounded-xl backdrop-blur-sm">
                    <p class="text-sm font-bold text-blue-800 flex items-center gap-3">
                      <span class="relative">
                        <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-blue-600" />
                      </span>
                    <span>МАКСИМАЛЬНАЯ БЕЗОПАСНОСТЬ</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Slot with Glass Effect -->
            <div class="p-8">
              <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/30 p-6 shadow-inner">
                <slot />
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Footer -->
        <div class="mt-20 pt-8 border-t border-blue-100/50">
          <div class="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div class="flex items-center gap-4">
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl shadow-lg flex items-center justify-center">
                  <div class="w-6 h-6 bg-white rounded"></div>
                </div>
                <div class="absolute -inset-2 bg-gradient-to-r from-blue-400 to-orange-400 rounded-xl blur-md opacity-50"></div>
              </div>
              <div class="flex flex-col">
                <span class="text-lg font-black bg-gradient-to-r from-blue-900 to-orange-700 bg-clip-text text-transparent">InvestHold PRO</span>
                <span class="text-xs text-gray-500 font-medium">Система премиум-класса</span>
              </div>
            </div>

            <div class="flex flex-col items-center lg:items-end gap-4">
              <div class="flex items-center gap-6">
                <span class="text-sm font-bold text-gray-700">© 2024 ELITE EDITION</span>
                <div class="flex items-center gap-6">
                  <a href="#" class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:scale-105">Аудит</a>
                  <a href="#" class="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors duration-300 hover:scale-105">Безопасность</a>
                  <a href="#" class="text-sm font-semibold text-gray-600 hover:text-blue-700 transition-colors duration-300 hover:scale-105">Документация</a>
                </div>
              </div>
              <p class="text-xs text-gray-500 text-center lg:text-right">
                Только для элитных администраторов с максимальными правами доступа
              </p>
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

<style scoped>
/* Premium Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}



@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.4; }
}

.animate-shimmer {
  animation: shimmer 3s infinite linear;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.floating {
  animation: float 4s ease-in-out infinite;
}

/* Premium Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #f0f9ff, #fffbeb);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #f97316);
  border-radius: 10px;
  border: 2px solid white;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1d4ed8, #ea580c);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
}

/* Glass Effects */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon {
  width: 70px;
  height: 55px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  animation: icon-pulse 3s ease-in-out infinite;
  overflow: hidden;
}

/* Gradient Text Effects */
.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 30%, #f97316 70%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Active Link Indicators */
.router-link-active {
  position: relative;
}

.router-link-active::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #3b82f6, #f97316, #3b82f6);
  border-radius: 14px;
  z-index: -1;
  animation: border-rotate 3s linear infinite;
}

@keyframes border-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Premium Hover Effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Gradient Background Pattern */
.bg-gradient-pattern {
  background:
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
</style>