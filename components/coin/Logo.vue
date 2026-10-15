<template>
  <div class="shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
    <img
      v-if="coin.logoUrl && !failed"
      :src="coin.logoUrl"
      :alt="coin.ticker"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else>{{ coin.ticker.slice(0, 1) }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Coin } from '~/types/coins'

const props = defineProps<{
  coin: Pick<Coin, 'ticker' | 'logoUrl'>
}>()

const failed = ref(false)
watch(() => props.coin.logoUrl, () => (failed.value = false))
</script>
