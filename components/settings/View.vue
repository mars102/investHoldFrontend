<template>
  <div class="max-w-2xl space-y-4">
    <div class="mb-2">
      <h2 class="text-2xl font-bold text-gray-900 mb-1 dark:text-white">Настройки</h2>
      <p class="text-gray-500 text-sm dark:text-gray-400">Профиль и предпочтения</p>
    </div>

    <!-- Profile -->
    <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
      <h3 class="text-sm font-bold text-gray-900 mb-4 dark:text-white">Профиль</h3>

      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {{ userInitial }}
        </div>
        <div class="min-w-0">
          <p class="font-bold text-gray-900 dark:text-white">{{ user?.username }}</p>
          <p class="text-sm text-gray-500 truncate dark:text-gray-400">{{ user?.email }}</p>
          <span
            v-if="isAdmin"
            class="inline-block mt-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600"
          >
            Администратор
          </span>
        </div>
      </div>

      <p class="text-xs text-gray-400 bg-gray-50 rounded-md p-3 dark:text-gray-500 dark:bg-gray-800/60">
        Редактирование профиля и аватара пока недоступно — на сервере ещё нет эндпоинта для сохранения этих данных.
      </p>
    </div>

    <!-- Currency -->
    <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
      <h3 class="text-sm font-bold text-gray-900 mb-1 dark:text-white">Валюта отображения</h3>
      <p class="text-xs text-gray-400 mb-3 dark:text-gray-500">Хранится только в этом браузере — сервер валюту пользователя пока не сохраняет.</p>
      <USelect v-model="prefs.currency" :options="currencyOptions" class="max-w-xs" />
    </div>

    <!-- Notifications -->
    <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
      <h3 class="text-sm font-bold text-gray-900 mb-1 dark:text-white">Уведомления</h3>
      <p class="text-xs text-gray-400 mb-4 dark:text-gray-500">Тоже локальные — сервер их пока не рассылает, это заготовка на будущее.</p>

      <div class="flex items-center justify-between py-2 border-t border-gray-50">
        <div>
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Email-уведомления</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">Новости и важные события по почте</p>
        </div>
        <UToggle v-model="prefs.emailNotifications" />
      </div>

      <div class="flex items-center justify-between py-2 border-t border-gray-50">
        <div>
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Уведомления о цене</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">Резкие изменения цены отслеживаемых монет</p>
        </div>
        <UToggle v-model="prefs.priceAlertNotifications" />
      </div>
    </div>

    <!-- Appearance -->
    <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
      <h3 class="text-sm font-bold text-gray-900 mb-4 dark:text-white">Оформление</h3>
      <ThemeToggle />
    </div>

    <!-- Session -->
    <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-800">
      <UButton color="red" variant="soft" icon="i-heroicons-arrow-left-on-rectangle" @click="authStore.logout()">
        Выйти из аккаунта
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const userInitial = computed(() => user.value?.username?.[0]?.toUpperCase() ?? 'U')
const isAdmin = computed(() => user.value?.roles?.some((role) => role.value === 'ADMIN') ?? false)

const prefs = useLocalPreferences()

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'RUB (₽)', value: 'RUB' }
]

onMounted(() => {
  if (!authStore.user) authStore.fetchUser()
})
</script>
