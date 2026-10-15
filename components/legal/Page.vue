<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <NuxtLink to="/promo" class="flex items-center gap-2">
          <img src="/images/logo.png" alt="InvestHold" class="h-7 w-auto" />
          <span class="font-black tracking-tight">
            <span class="text-amber-500">Invest</span><span class="text-cyan-600 dark:text-cyan-400">Hold</span>
          </span>
        </NuxtLink>
        <nav class="flex items-center gap-3 sm:gap-4 text-sm">
          <NuxtLink to="/terms" class="text-gray-500 hover:text-gray-900 dark:hover:text-white" active-class="!text-gray-900 dark:!text-white font-semibold">
            Условия
          </NuxtLink>
          <NuxtLink to="/privacy" class="text-gray-500 hover:text-gray-900 dark:hover:text-white" active-class="!text-gray-900 dark:!text-white font-semibold">
            Конфиденциальность
          </NuxtLink>
          <ThemeSwitch />
        </nav>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight">{{ title }}</h1>
      <p class="mt-3 text-sm text-gray-500">Редакция от {{ updated }}</p>

      <article class="legal mt-10">
        <slot />
      </article>
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500">
      © {{ new Date().getFullYear() }} InvestHold
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  updated: string
}>()
</script>

<style scoped>
.legal :deep(h2) {
  font-size: 1.25rem;
  font-weight: 800;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 4.5rem;
}
.legal :deep(p),
.legal :deep(li) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgb(55 65 81);
}
.dark .legal :deep(p),
.dark .legal :deep(li) {
  color: rgb(209 213 219);
}
.legal :deep(p) {
  margin-bottom: 0.75rem;
}
.legal :deep(ol),
.legal :deep(ul) {
  margin: 0 0 0.75rem 1.25rem;
}
.legal :deep(ol) {
  list-style: decimal;
}
.legal :deep(ul) {
  list-style: disc;
}
.legal :deep(li) {
  margin-bottom: 0.35rem;
}
.legal :deep(strong) {
  font-weight: 700;
}
.legal :deep(a) {
  color: rgb(8 145 178);
  text-decoration: underline;
}
.legal :deep(.caps) {
  text-transform: uppercase;
  font-weight: 600;
}
</style>
