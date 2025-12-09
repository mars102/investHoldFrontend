<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Header -->
    <header class="bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold text-xl">IH</span>
            </div>
            <h1 class="text-2xl font-bold text-white">InvestHold</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div class="hidden md:flex items-center space-x-6">
              <NuxtLink to="/" class="text-gray-300 hover:text-white transition">
                Portfolio
              </NuxtLink>
              <NuxtLink to="/trades" class="text-gray-300 hover:text-white transition">
                Trades
              </NuxtLink>
              <NuxtLink to="/analytics" class="text-gray-300 hover:text-white transition">
                Analytics
              </NuxtLink>
            </div>

            <UDropdown v-if="authStore.user" :items="userMenuItems">
              <UButton color="gray" variant="ghost" class="text-white">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">{{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}</span>
                  </div>
                  <span class="hidden md:inline">{{ authStore.user?.name }}</span>
                  <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                </div>
              </UButton>
            </UDropdown>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
      <slot />
    </main>

    <!-- Notifications -->
    <ClientOnly>
      <UNotifications />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const userMenuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-heroicons-user',
      click: () => router.push('/profile')
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog',
      click: () => router.push('/settings')
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => authStore.logout()
    }
  ]
])

// Автоматическая загрузка пользователя при загрузке layout
onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUser()
  }
})
</script>