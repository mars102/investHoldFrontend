<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Analytics</h2>
      <p class="text-gray-400">Track your portfolio performance</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Total Invested</h3>
          <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-cyan-400" />
        </div>
        <p class="text-3xl font-bold text-white">$0.00</p>
        <p class="text-sm text-gray-400 mt-2">All time</p>
      </div>

      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Current Value</h3>
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-green-400" />
        </div>
        <p class="text-3xl font-bold text-white">$0.00</p>
        <p class="text-sm text-green-400 mt-2">+0.00%</p>
      </div>

      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Total Profit</h3>
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-400" />
        </div>
        <p class="text-3xl font-bold text-white">$0.00</p>
        <p class="text-sm text-blue-400 mt-2">ROI: 0.00%</p>
      </div>

      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Best Asset</h3>
          <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-yellow-400" />
        </div>
        <p class="text-3xl font-bold text-white">-</p>
        <p class="text-sm text-gray-400 mt-2">Top performer</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Portfolio Distribution -->
      <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 class="text-xl font-bold text-white mb-6">Portfolio Distribution</h3>
        <div class="h-64 flex items-center justify-center">
          <p class="text-gray-400">No data available</p>
        </div>
      </div>

      <!-- Performance Chart -->
      <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 class="text-xl font-bold text-white mb-6">Performance Over Time</h3>
        <div class="h-64 flex items-center justify-center">
          <p class="text-gray-400">No data available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>