<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <UNotifications />
    <!-- A page can hide the support robot with definePageMeta({ hideSupport: true }) -->
    <SupportWidget v-if="!route.meta.hideSupport" />
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
