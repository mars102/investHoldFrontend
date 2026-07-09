<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Total Balance</h3>
          <UIcon name="i-heroicons-wallet" class="w-6 h-6 text-cyan-500" />
        </div>
        <p class="text-3xl font-bold text-gray-900">
          $ {{ formatNumber(summary?.totalCurrentValue) }}
        </p>
        <p class="text-sm text-gray-500 mt-2">
          {{ formatPercent(summary?.totalProfitLossPercentage) }} all time
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Total Profit</h3>
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-green-500" />
        </div>
        <p class="text-3xl font-bold text-gray-900">
          $ {{ formatNumber(summary?.totalProfitLoss) }}
        </p>
        <p class="text-sm text-gray-500 mt-2">All time</p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Holdings</h3>
          <UIcon
            name="i-heroicons-arrows-right-left"
            class="w-6 h-6 text-blue-500"
          />
        </div>
        <p class="text-3xl font-bold text-gray-900">
          {{ summary?.holdingsCount ?? 0 }}
        </p>
        <p class="text-sm text-gray-500 mt-2">Distinct assets</p>
      </div>
    </div>

    <!-- Пример таблицы активов -->
    <div
      class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div class="p-6 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">Your Assets</h3>
      </div>
      <div class="p-6">
        <UTable
          :rows="assetRows"
          :columns="assetColumns"
          :loading="portfolioStore.loading"
          :empty-state="{
            icon: 'i-heroicons-circle-stack',
            label: 'No assets yet',
          }"
          class="cursor-pointer"
          @select="onSelectHolding"
        >
          <template #empty-state>
            <div class="text-center py-12">
              <UIcon
                name="i-heroicons-circle-stack"
                class="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <p class="text-gray-500">Start by adding your first trade</p>
              <UButton
                class="mt-4"
                color="primary"
                @click="router.push('/trades/new')"
              >
                Add Trade
              </UButton>
            </div>
          </template>

          <template #actions-data="{ row }">
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              :loading="portfolioStore.refreshingCoinId === row.coinId"
              :disabled="portfolioStore.refreshingCoinId !== null"
              @click.stop="portfolioStore.refreshCoinPrice(row.coinId)"
            >
              Обновить цену
            </UButton>
          </template>
        </UTable>
      </div>
    </div>

    <CoinPriceHistoryModal
      v-model:open="isHistoryModalOpen"
      :coin-id="selectedHolding?.coinId ?? null"
      :coin="selectedHolding?.coin ?? null"
      :average-buy-price="selectedHolding ? Number(selectedHolding.averageBuyPrice) : 0"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { usePortfolioStore } from "~/stores/portfolio";
import type { Holding } from "~/types/portfolio";

const authStore = useAuthStore();
const portfolioStore = usePortfolioStore();
const { summary } = storeToRefs(portfolioStore);
const router = useRouter();

const isHistoryModalOpen = ref(false);
const selectedHolding = ref<Holding | null>(null);

onMounted(() => {
  portfolioStore.fetchSummary();
});

function onSelectHolding(row: { coinId: number }) {
  const holding = summary.value?.holdings.find((h) => h.coinId === row.coinId);
  if (holding) {
    selectedHolding.value = holding;
    isHistoryModalOpen.value = true;
  }
}

const assetColumns = [
  {
    key: "asset",
    label: "Asset",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "value",
    label: "Value",
  },
  {
    key: "profit",
    label: "Profit/Loss",
  },
  {
    key: "actions",
    label: "",
  },
];

const assetRows = computed(() =>
  (summary.value?.holdings ?? []).map((holding) => ({
    coinId: holding.coinId,
    asset: `${holding.coin.fullName} (${holding.coin.ticker})`,
    amount: Number(holding.totalQuantity),
    value: `$ ${formatNumber(holding.currentValue)}`,
    profit: `${holding.profitLossAbsolute >= 0 ? "+" : ""}$ ${formatNumber(holding.profitLossAbsolute)} (${formatPercent(holding.profitLossPercentage)})`,
  })),
);

function formatNumber(value?: number) {
  return (value ?? 0).toFixed(2);
}

function formatPercent(value?: number) {
  const v = value ?? 0;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}
</script>
