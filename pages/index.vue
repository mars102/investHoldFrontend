<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Welcome back, {{ authStore.user?.name }}!</h2>
      <p class="text-gray-400">Your crypto portfolio overview</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Total Balance</h3>
          <UIcon name="i-heroicons-wallet" class="w-6 h-6 text-cyan-400" />
        </div>
        <p class="text-3xl font-bold text-white">$ 0.00</p>
        <p class="text-sm text-gray-400 mt-2">+0.00% today</p>
      </div>

      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Total Profit</h3>
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-green-400" />
        </div>
        <p class="text-3xl font-bold text-white">$ 0.00</p>
        <p class="text-sm text-gray-400 mt-2">All time</p>
      </div>

      <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Active Trades</h3>
          <UIcon name="i-heroicons-arrows-right-left" class="w-6 h-6 text-blue-400" />
        </div>
        <p class="text-3xl font-bold text-white">0</p>
        <p class="text-sm text-gray-400 mt-2">Currently open</p>
      </div>
    </div>

    <!-- Пример таблицы активов -->
    <div class="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div class="p-6 border-b border-white/10">
        <h3 class="text-xl font-bold text-white">Your Assets</h3>
      </div>
      <div class="p-6">
        <UTable :rows="[]" :columns="assetColumns" :empty-state="{
          icon: 'i-heroicons-circle-stack',
          label: 'No assets yet'
        }">
          <template #empty-state>
            <div class="text-center py-12">
              <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p class="text-gray-400">Start by adding your first trade</p>
              <UButton class="mt-4" color="primary" @click="router.push('/trades/new')">
                Add Trade
              </UButton>
            </div>
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

definePageMeta({
  middleware: 'auth'
})

const assetColumns = [
  {
    key: 'asset',
    label: 'Asset'
  },
  {
    key: 'amount',
    label: 'Amount'
  },
  {
    key: 'value',
    label: 'Value'
  },
  {
    key: 'profit',
    label: 'Profit/Loss'
  }
]
</script>