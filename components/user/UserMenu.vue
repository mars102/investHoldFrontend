<template>
  <div v-if="user && isHydrated" class="flex items-center gap-3">
    <!-- Quick Stats Badge -->
    <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-100/50">
      <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span class="text-xs font-bold text-gray-700">Live</span>
      <div class="w-px h-3 bg-gray-300"></div>
      <span class="text-xs font-semibold text-gray-600">v4.0</span>
    </div>

    <!-- Admin Badge for Admin Users -->
    <div v-if="isAdmin" class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100/50">
      <div class="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
      <span class="text-xs font-bold text-gray-700">ADMIN</span>
    </div>

    <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
      <button class="group relative flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-all duration-200">
        <div class="relative">
          <div
              :class="[
              'w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
              isAdmin
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-500/30'
                : 'bg-gradient-to-br from-orange-500 to-blue-600 shadow-orange-500/30'
            ]"
          >
            <span class="text-white font-bold text-sm">
              {{ userInitial }}
            </span>
          </div>
          <div
              :class="[
              'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm',
              isAdmin ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-emerald-500'
            ]"
          ></div>
        </div>
        <div class="hidden md:flex flex-col items-start">
          <span class="text-xs font-bold text-gray-900 leading-tight">{{ user.username }}</span>
          <span :class="[
            'text-[10px] font-medium',
            isAdmin ? 'text-purple-600' : 'text-gray-500'
          ]">
            {{ isAdmin ? 'Administrator' : 'Premium' }}
          </span>
        </div>
        <UIcon
            name="i-heroicons-chevron-down"
            class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
        />
      </button>
    </UDropdown>
  </div>

  <!-- Skeleton loader during hydration -->
  <div v-else-if="!isHydrated" class="flex items-center gap-3">
    <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    <div class="hidden md:flex flex-col gap-1">
      <div class="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
      <div class="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from '#app'
import { computed, onMounted, ref, watch, nextTick } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

// Флаг гидратации хранилища
const isHydrated = ref(false)

const user = computed(() => authStore.user)
const isAdmin = computed(() => {
  return user.value?.roles?.some(role => role.value === 'ADMIN') || false
})

const userInitial = computed(() => {
  return user.value?.username?.[0]?.toUpperCase() || 'U'
})

const menuItems = computed(() => {
  const items: any[] = []

  // First section: Profile and Settings
  items.push([
    {
      label: 'Портфель',
      icon: 'i-heroicons-briefcase',
      iconClass: 'text-orange-600',
      click: () => router.push('/')
    },
    {
      label: 'Настройки',
      icon: 'i-heroicons-cog-6-tooth',
      iconClass: 'text-blue-600',
      click: () => router.push('/settings')
    }
  ])

  // Admin section (only for admin users)
  if (isAdmin.value) {
    items.push([
      {
        label: 'Админ-панель',
        icon: 'i-heroicons-shield-check',
        iconClass: 'text-purple-600',
        badge: {
          label: 'ADMIN',
          color: 'purple',
          variant: 'soft'
        },
        click: () => router.push('/admin/coins')
      }
    ])
  }

  // Last section: Logout
  items.push([
    {
      label: 'Выйти',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      iconClass: 'text-gray-500',
      click: () => authStore.logout()
    }
  ])

  return items
})

onMounted(async () => {
  // Инициализируем хранилище
  await authStore.fetchUser()

  // Даем время на гидратацию
  setTimeout(() => {
    isHydrated.value = true
  }, 100)
})

watch(
    () => authStore.user,
    (newUser) => {
      if (newUser && !isHydrated.value) {
        isHydrated.value = true
      }
    },
    { immediate: true }
)
</script>