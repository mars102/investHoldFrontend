<template>
  <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-stretch">
    <PortfolioCoinChart
      class="h-full"
      :coin-id="selectedHolding?.coinId ?? null"
      :coin="selectedHolding?.coin ?? null"
      :average-buy-price="selectedHolding ? Number(selectedHolding.averageBuyPrice) : 0"
      :total-quantity="selectedHolding ? Number(selectedHolding.totalQuantity) : 0"
    />

    <PortfolioHoldingsList
      :selected-coin-id="selectedHolding?.coinId ?? null"
      @select="onSelectHolding"
    />
  </div>
</template>

<script setup lang="ts">
import { usePortfolioStore } from "~/stores/portfolio";
import type { Holding } from "~/types/portfolio";

const portfolioStore = usePortfolioStore();
const { summary } = storeToRefs(portfolioStore);

const selectedHolding = ref<Holding | null>(null);

onMounted(async () => {
  await portfolioStore.fetchSummary();
  const sorted = [...(summary.value?.holdings ?? [])].sort(
    (a, b) => b.currentValue - a.currentValue,
  );
  selectedHolding.value = sorted[0] ?? null;
});

function onSelectHolding(holding: Holding) {
  selectedHolding.value = holding;
}
</script>
