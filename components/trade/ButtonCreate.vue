<template>
      <div >
           <ui-button @click="createTrade">Создать сделку</ui-button>
      </div>
</template>

<script lang="ts" setup>

function createTrade() {
  // Логика создания сделки
  alert('Создание новой сделки');
}

</script>

<style scoped>
.main-content {
  color: #000000;
} 
</style>