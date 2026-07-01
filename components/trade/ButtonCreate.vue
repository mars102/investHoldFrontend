<template>
  <div>
    <ui-button @click="createTrade">Создать сделку</ui-button>
  </div>
</template>

<script lang="ts" setup>
const tradeStore = useMyTradeStore();
const { isCreate } = storeToRefs(tradeStore);
const { toggleCreate } = tradeStore;
function createTrade() {
  // Логика создания сделки
  toggleCreate();
}
</script>

<style scoped>
.main-content {
  color: #000000;
}
</style>
