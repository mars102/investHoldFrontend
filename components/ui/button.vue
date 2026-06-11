<template>
  <button class="btn">
    <slot />
  </button>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.btn {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #1d4ed8;
}

.btn:active {
  background-color: #1e40af;
}
</style>