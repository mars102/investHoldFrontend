<template>
<!--<CoinList></CoinList>-->
  <div>

    <CoinList></CoinList>
  </div>

</template>

<script>
import CoinList from "../components/coin/CoinList";
export default {
  components: {CoinList},
  layout: 'default',
  middleware: 'auth'
}
</script>

<style scoped>

</style>