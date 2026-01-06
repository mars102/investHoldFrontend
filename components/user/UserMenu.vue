<template>
  <div v-if="user" class="flex items-center gap-3">
    <!-- Quick Stats Badge -->
    <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-100/50">
      <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span class="text-xs font-bold text-gray-700">Live</span>
      <div class="w-px h-3 bg-gray-300"></div>
      <span class="text-xs font-semibold text-gray-600">v4.0</span>
    </div>

    <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
      <button class="group relative flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-all duration-200">
        <div class="relative">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span class="text-white font-bold text-sm">
              {{ userInitial }}
            </span>
          </div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div class="hidden md:flex flex-col items-start">
          <span class="text-xs font-bold text-gray-900 leading-tight">{{ user.username }}</span>
          <span class="text-[10px] text-gray-500 font-medium">Premium</span>
        </div>
        <UIcon
            name="i-heroicons-chevron-down"
            class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
        />
      </button>
    </UDropdown>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from '#app'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const userInitial = computed(() => {
  return user.value?.name?.[0]?.toUpperCase() || 'U'
})

const menuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-heroicons-user',
      iconClass: 'text-orange-600',
      click: () => router.push('/profile')
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      iconClass: 'text-blue-600',
      click: () => router.push('/settings')
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      iconClass: 'text-gray-500',
      click: () => authStore.logout()
    }
  ]
])

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUser()
  }
})

watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated && !authStore.user) {
        authStore.fetchUser()
      }
    }
)
</script>