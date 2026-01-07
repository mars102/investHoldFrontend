<template>
  <div>
    <UserList />
  </div>

</template>

<script>
import UserList from "../../components/user/UserList";
definePageMeta({
  layout: "adminpanel",
  middleware: "auth"
});
</script>

<style scoped>

</style>