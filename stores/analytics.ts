import { defineStore } from "pinia";
import type { RiskScore, TradeTimingResponse, Insight } from "~/types/analytics";

export const useAnalyticsStore = defineStore("analytics", {
  state: () => ({
    risk: null as RiskScore | null,
    riskLoading: false,

    tradeTiming: null as TradeTimingResponse | null,
    tradeTimingLoading: false,

    insights: [] as Insight[],
    insightsLoading: false,
    generatingInsights: false,

    error: null as string | null,
  }),
  actions: {
    async fetchRisk() {
      const { $api } = useNuxtApp();
      this.riskLoading = true;
      this.error = null;
      try {
        this.risk = await $api<RiskScore>("/analytics/risk", { method: "GET" });
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении риск-скора";
      } finally {
        this.riskLoading = false;
      }
    },

    async fetchTradeTiming(coinId?: number) {
      const { $api } = useNuxtApp();
      this.tradeTimingLoading = true;
      this.error = null;
      try {
        this.tradeTiming = await $api<TradeTimingResponse>("/analytics/trade-timing", {
          method: "GET",
          params: { coinId: coinId ?? undefined },
        });
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении оценки таймингов";
      } finally {
        this.tradeTimingLoading = false;
      }
    },

    async fetchInsights(coinId?: number, limit?: number) {
      const { $api } = useNuxtApp();
      this.insightsLoading = true;
      this.error = null;
      try {
        this.insights = await $api<Insight[]>("/analytics/insights", {
          method: "GET",
          params: { coinId: coinId ?? undefined, limit: limit ?? undefined },
        });
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении инсайтов";
      } finally {
        this.insightsLoading = false;
      }
    },

    async generateInsights() {
      const { $api } = useNuxtApp();
      this.generatingInsights = true;
      this.error = null;
      try {
        this.insights = await $api<Insight[]>("/analytics/insights/generate", { method: "POST" });
      } catch (e: any) {
        this.error = e?.message || "Ошибка при генерации инсайтов";
      } finally {
        this.generatingInsights = false;
      }
    },
  },
});
