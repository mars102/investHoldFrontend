<template>
  <TradeList />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "Лента",
});
</script>
