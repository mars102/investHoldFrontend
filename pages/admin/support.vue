<template>
  <NuxtLayout name="adminpanel">
    <template #title>Поддержка</template>
    <template #subtitle>Обращения пользователей через робота Холди</template>
    <SupportAdminInbox />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>
