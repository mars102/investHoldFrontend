<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold text-white mb-2">Trades History</h2>
        <p class="text-gray-400">View and manage your trading history</p>
      </div>

      <UButton
          color="primary"
          size="lg"
          icon="i-heroicons-plus"
          @click="router.push('/trades/new')"
          :ui="{
          base: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
        }"
      >
        New Trade
      </UButton>
    </div>

    <!-- Filters -->
    <div class="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <USelect
            v-model="filters.type"
            :options="typeOptions"
            placeholder="All Types"
            size="lg"
        />

        <USelect
            v-model="filters.status"
            :options="statusOptions"
            placeholder="All Statuses"
            size="lg"
        />

        <UInput
            v-model="filters.symbol"
            placeholder="Search symbol..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
        />

        <UButton
            color="gray"
            variant="soft"
            block
            size="lg"
            @click="resetFilters"
        >
          Reset Filters
        </UButton>
      </div>
    </div>

    <!-- Trades Table -->
    <div class="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <UTable
          :rows="trades"
          :columns="columns"
          :loading="loading"
          :empty-state="{
          icon: 'i-heroicons-arrows-right-left',
          label: 'No trades yet'
        }"
      >
        <template #symbol-data="{ row }">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">{{ row.symbol.slice(0, 2) }}</span>
            </div>
            <div>
              <p class="text-white font-semibold">{{ row.symbol }}</p>
              <p class="text-sm text-gray-400">{{ row.executed_at }}</p>
            </div>
          </div>
        </template>

        <template #type-data="{ row }">
          <UBadge
              :color="row.type === 'buy' ? 'green' : 'red'"
              variant="soft"
          >
            {{ row.type.toUpperCase() }}
          </UBadge>
        </template>

        <template #status-data="{ row }">
          <UBadge
              :color="getStatusColor(row.status)"
              variant="soft"
          >
            {{ row.status.toUpperCase() }}
          </UBadge>
        </template>

        <template #amount-data="{ row }">
          <span class="text-white">{{ row.amount.toFixed(8) }}</span>
        </template>

        <template #price-data="{ row }">
          <span class="text-white">${{ row.price.toLocaleString() }}</span>
        </template>

        <template #total-data="{ row }">
          <span class="text-white font-semibold">${{ row.total.toLocaleString() }}</span>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center space-x-2">
            <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-eye"
                size="sm"
                @click="viewTrade(row)"
            />
            <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil"
                size="sm"
                @click="editTrade(row)"
            />
            <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                size="sm"
                @click="deleteTrade(row)"
            />
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)
const trades = ref([])

const filters = reactive({
  type: null,
  status: null,
  symbol: ''
})

const typeOptions = [
  { label: 'All Types', value: null },
  { label: 'Buy', value: 'buy' },
  { label: 'Sell', value: 'sell' }
]

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
  { label: 'Pending', value: 'pending' }
]

const columns = [
  {
    key: 'symbol',
    label: 'Asset'
  },
  {
    key: 'type',
    label: 'Type'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'amount',
    label: 'Amount'
  },
  {
    key: 'price',
    label: 'Price'
  },
  {
    key: 'total',
    label: 'Total'
  },
  {
    key: 'actions',
    label: ''
  }
]

const getStatusColor = (status: string) => {
  const colors = {
    open: 'blue',
    closed: 'gray',
    pending: 'yellow'
  }
  return colors[status] || 'gray'
}

const resetFilters = () => {
  filters.type = null
  filters.status = null
  filters.symbol = ''
}

const viewTrade = (trade: any) => {
  router.push(`/trades/${trade.id}`)
}

const editTrade = (trade: any) => {
  router.push(`/trades/${trade.id}/edit`)
}

const deleteTrade = async (trade: any) => {
  // Implement delete logic
  const { $toast } = useNuxtApp()
  $toast.success('Trade deleted successfully')
}

onMounted(() => {
  // Load trades
})
</script>