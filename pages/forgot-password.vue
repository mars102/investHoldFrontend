<template>
  <AuthForgotPasswordForm />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

useHead({ title: 'Восстановление пароля — InvestHold' })
</script>
