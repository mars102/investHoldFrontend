<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Лента сделок</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        variant="ghost"
        :loading="tradeStore.loading"
        @click="tradeStore.fetchTrades()"
      />
    </div>

    <!-- Загрузка -->
    <div
      v-if="tradeStore.loading && !tradeStore.trades.length"
      class="space-y-3"
    >
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-lg" />
    </div>

    <!-- Ошибка -->
    <UAlert
      v-else-if="tradeStore.error"
      color="red"
      variant="soft"
      title="Не удалось загрузить сделки"
      :description="tradeStore.error"
    />

    <!-- Пусто -->
    <div
      v-else-if="!tradeStore.trades.length"
      class="text-center text-gray-500 py-12"
    >
      Сделок пока нет
    </div>

    <!-- Список сделок -->
    <div v-else class="space-y-3">
      <div
        v-for="trade in tradeStore.trades"
        :key="trade.id"
        class="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="
              trade.type === 'buy'
                ? 'i-heroicons-arrow-trending-up'
                : 'i-heroicons-arrow-trending-down'
            "
            :class="trade.type === 'buy' ? 'text-green-500' : 'text-red-500'"
            class="w-6 h-6 shrink-0"
          />

          <div>
            <div class="font-medium">
              {{ typeLabel(trade.type) }} — {{ trade.quantity }} монет
            </div>
            <div class="text-sm text-gray-500">
              {{ formatDate(trade.executedAt) }} · {{ trade.exchangeSource }}
            </div>
            <div v-if="trade.description" class="text-sm text-gray-400 mt-1">
              {{ trade.description }}
            </div>
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="font-semibold">
            {{ formatCurrency(trade.totalAmount, trade.feeCurrency) }}
          </div>
          <div class="text-sm text-gray-500">
            по {{ formatCurrency(trade.pricePerUnit, trade.feeCurrency) }}
          </div>
          <UBadge
            :color="statusColor(trade.status)"
            variant="subtle"
            size="xs"
            class="mt-1"
          >
            {{ statusLabel(trade.status) }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useMyTradeStore } from "~/stores/trade";

const tradeStore = useMyTradeStore();

onMounted(() => {
  tradeStore.fetchTrades();
});

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    buy: "Покупка",
    sell: "Продажа",
    transfer_in: "Перевод входящий",
    transfer_out: "Перевод исходящий",
    stake: "Стейкинг",
    unstake: "Анстейкинг",
    reward: "Награда",
    airdrop: "Airdrop",
  };
  return labels[type] || type;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "В ожидании",
    completed: "Завершена",
    cancelled: "Отменена",
    failed: "Ошибка",
  };
  return labels[status] || status;
}

function statusColor(status: string) {
  const colors: Record<string, string> = {
    pending: "yellow",
    completed: "green",
    cancelled: "gray",
    failed: "red",
  };
  return colors[status] || "gray";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
</script>
