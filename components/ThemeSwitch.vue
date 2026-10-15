<template>
  <ClientOnly>
    <button
      type="button"
      class="theme-switch w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
      :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
      @click="colorMode.preference = isDark ? 'light' : 'dark'"
    >
      <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-5 h-5" />
    </button>
    <template #fallback>
      <div class="w-9 h-9" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>
