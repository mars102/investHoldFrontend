<template>
  <div class="main-content">
    <div style="width: 300px; margin-right: 20px; border-right: 1px solid #ccc">
      <TradeButtonCreate></TradeButtonCreate>

      <br />
      <br />
      <br />
    </div>
    <div style="flex-grow: 1">
      <TradeCreateForm v-if="isCreate"></TradeCreateForm>
      <div v-else>
        <TradeList></TradeList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  title: "Мои сделки",
});

const tradeStore = useMyTradeStore();
const { isCreate } = storeToRefs(tradeStore);
</script>

<style>
.main-content {
  color: #000000;
  display: flex;
}
</style>
