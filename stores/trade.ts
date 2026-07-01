import { defineStore } from "pinia";
import type { createTrade } from "../types/trade";

export const useMyTradeStore = defineStore("trade", {
  state: () => ({
    isCreate: false,
    loading: false,
    error: null as string | null,
    trades: [] as any[], // замени any[] на тип Trade[], если есть готовый тип сделки
    currentTrade: null as any | null,
  }),
  actions: {
    toggleCreate() {
      this.isCreate = !this.isCreate;
    },

    async createTrade(form: createTrade) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api("/transactions", {
          method: "POST",
          body: form,
        });
        this.isCreate = false;
        // добавляем новую сделку в начало списка, чтобы не делать лишний запрос
        this.trades.unshift(response);
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при создании сделки";
      } finally {
        this.loading = false;
      }
    },

    async fetchTrades() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api("/transactions", {
          method: "GET",
        });
        this.trades = response;
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении сделок";
      } finally {
        this.loading = false;
      }
    },

    async fetchTradeById(id: number) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api(`/transactions/${id}`, {
          method: "GET",
        });
        this.currentTrade = response;
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении сделки";
      } finally {
        this.loading = false;
      }
    },

    async fetchTradesByCoin(coinId: number) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api(`/transactions/coin/${coinId}`, {
          method: "GET",
        });
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении сделок по монете";
      } finally {
        this.loading = false;
      }
    },
  },
});
