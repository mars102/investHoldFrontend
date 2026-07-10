import { defineStore } from "pinia";
import type { createTrade } from "../types/trade";
import { usePortfolioStore } from "./portfolio";
import { useFeedStore } from "./feed";

export const useMyTradeStore = defineStore("trade", {
  state: () => ({
    loading: false,
    error: null as string | null,
    trades: [] as any[], // замени any[] на тип Trade[], если есть готовый тип сделки
    currentTrade: null as any | null,
  }),
  actions: {
    async createTrade(form: createTrade) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api("/transactions", {
          method: "POST",
          body: form,
        });
        // добавляем новую сделку в начало списка, чтобы не делать лишний запрос
        this.trades.unshift(response);
        // сделка меняет холдинги и попадает в общую ленту — обновляем оба
        await Promise.all([usePortfolioStore().fetchSummary(), useFeedStore().fetchFeed()]);
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

    async updateTrade(id: string, form: Partial<createTrade>) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api(`/transactions/${id}`, {
          method: "PATCH",
          body: form,
        });
        const index = this.trades.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.trades[index] = response;
        }
        await Promise.all([usePortfolioStore().fetchSummary(), useFeedStore().fetchFeed()]);
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при обновлении сделки";
      } finally {
        this.loading = false;
      }
    },

    async deleteTrade(id: string) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api(`/transactions/${id}`, {
          method: "DELETE",
        });
        this.trades = this.trades.filter((t) => t.id !== id);
        await Promise.all([usePortfolioStore().fetchSummary(), useFeedStore().fetchFeed()]);
      } catch (e: any) {
        this.error = e?.message || "Ошибка при удалении сделки";
        throw e;
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
