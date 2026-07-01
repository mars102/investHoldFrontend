<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Создание сделки</h1>

    <UForm :state="form" @submit="handleSubmit">
      <div class="grid grid-cols-3 gap-4">
        <UFormGroup label="Монета" name="coinId">
          <USelect
            v-model="form.coinId"
            :options="coinOptions"
            placeholder="Выберите монету"
            @change="onCoinSelect(form.coinId)"
          />
        </UFormGroup>

        <UFormGroup label="Тип сделки" name="type">
          <USelect v-model="form.type" :options="tradeTypeOptions" />
        </UFormGroup>

        <UFormGroup label="Биржа" name="exchangeSource">
          <USelect v-model="form.exchangeSource" :options="exchangeOptions" />
        </UFormGroup>

        <UFormGroup label="Количество" name="quantity">
          <UInput
            v-model.number="form.quantity"
            type="number"
            placeholder="0.5"
          />
        </UFormGroup>

        <UFormGroup label="Цена за единицу" name="pricePerUnit">
          <UInput
            v-model.number="form.pricePerUnit"
            type="number"
            placeholder="45000"
          />
        </UFormGroup>

        <UFormGroup label="Дата сделки" name="executedAt">
          <UInput v-model="form.executedAt" type="datetime-local" />
        </UFormGroup>

        <UFormGroup label="Комиссия" name="fee">
          <UInput v-model.number="form.fee" type="number" placeholder="10.5" />
        </UFormGroup>

        <UFormGroup label="Валюта комиссии" name="feeCurrency">
          <USelect
            v-model="form.feeCurrency"
            :options="['USD', 'BTC', 'ETH', 'BNB', 'USDT']"
          />
        </UFormGroup>

        <UFormGroup label="Комментарий" name="description" class="col-span-3">
          <UTextarea
            v-model="form.description"
            placeholder="Купил на минимуме..."
          />
        </UFormGroup>
      </div>

      <UButton type="submit" block color="primary" class="mt-6">
        Создать сделку
      </UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import type { createTrade } from "~/types/trade";
import { useMyTradeStore } from "~/stores/trade";
const tradeStore = useMyTradeStore();
import type { Coin } from "~/types/coins";
import { ref, reactive, computed, onMounted } from "vue";

const { $api } = useNuxtApp();

const form = reactive<createTrade>({
  coinId: undefined,
  type: "BUY",
  quantity: 0,
  pricePerUnit: 0,
  fee: 0,
  feeCurrency: "USD",
  exchangeSource: "",
  description: "",
  executedAt: "",
});

const coins = ref<Coin[]>([]);

const coinOptions = computed(() =>
  coins.value.map((coin) => ({
    label: `${coin.fullName} (${coin.ticker})`,
    value: Number(coin.id),
  })),
);

function onCoinSelect(coinId: number | undefined) {
  const selected = coins.value.find((c) => c.id === coinId);
  if (selected) {
    form.pricePerUnit = selected.currentPrice;
  }
}

onMounted(async () => {
  coins.value = await $api("/coins");
});

const tradeTypeOptions = [
  { label: "Купить", value: "buy" },
  { label: "Продать", value: "sell" },
];

const exchangeOptions = [
  { label: "Binance", value: "binance" },
  { label: "Bybit", value: "bybit" },
  { label: "OKX", value: "okx" },
  { label: "Huobi", value: "huobi" },
  { label: "Другое", value: "other" },
];

function handleSubmit() {
  const payload = {
    ...form,
    coinId: form.coinId ? Number(form.coinId) : undefined,
    quantity: Number(form.quantity),
    pricePerUnit: Number(form.pricePerUnit),
    fee: Number(form.fee),
    executedAt: new Date(form.executedAt).toISOString(),
  };

  tradeStore.createTrade(payload);
}
</script>
