import { defineStore } from "pinia";
import type { PortfolioSummary } from "~/types/portfolio";

export const usePortfolioStore = defineStore("portfolio", {
  state: () => ({
    summary: null as PortfolioSummary | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchSummary() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api<PortfolioSummary>("/holdings/portfolio", {
          method: "GET",
        });
        this.summary = response;
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении сводки портфеля";
      } finally {
        this.loading = false;
      }
    },
  },
});
