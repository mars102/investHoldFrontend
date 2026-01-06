<template>
  <div>
    <CoinList></CoinList>
  </div>

</template>

<script>
import CoinList from "../../components/coin/CoinList";
definePageMeta({
  layout: "adminpanel",
  middleware: "auth"
});
</script>

<style scoped>

</style>