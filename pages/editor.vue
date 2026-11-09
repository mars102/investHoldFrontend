<template>
  <!-- No app layout: the editor gets the whole screen. The page itself scrolls,
       so the editor toolbar (position: sticky) sticks to the top of the window. -->
  <div class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 dark:bg-gray-900">
    <EditorOphxDemo />
  </div>
</template>

<script setup lang="ts">
// Public page: no auth middleware — the editor works for guests too
// (documents live in the browser and in downloaded .ophx files).
// hideSupport: the support robot would cover the editor
definePageMeta({ layout: false, hideSupport: true })

useHead({ title: 'Редактор документов — InvestHold' })
</script>
