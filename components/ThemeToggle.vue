<template>
  <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1 w-fit">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors"
      :class="colorMode.preference === opt.value
        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
      @click="colorMode.preference = opt.value"
    >
      <UIcon :name="opt.icon" class="w-3.5 h-3.5" />
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const options = [
  { value: 'light', label: 'Светлая', icon: 'i-heroicons-sun' },
  { value: 'dark', label: 'Тёмная', icon: 'i-heroicons-moon' },
  { value: 'system', label: 'Системная', icon: 'i-heroicons-computer-desktop' }
] as const
</script>
