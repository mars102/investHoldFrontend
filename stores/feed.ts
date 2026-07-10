import { defineStore } from "pinia";
import type { FeedItem, FeedResponse, FeedFilterType } from "../types/feed";

export const useFeedStore = defineStore("feed", {
  state: () => ({
    items: [] as FeedItem[],
    total: 0,
    limit: 20,
    type: "all" as FeedFilterType,
    coinId: null as number | null,
    loading: false,
    loadingMore: false,
    error: null as string | null,
  }),
  getters: {
    hasMore: (state) => state.items.length < state.total,
  },
  actions: {
    setFilters(type: FeedFilterType, coinId: number | null) {
      this.type = type;
      this.coinId = coinId;
    },

    async fetchFeed() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api<FeedResponse>("/feed", {
          method: "GET",
          params: {
            type: this.type,
            coinId: this.coinId ?? undefined,
            limit: this.limit,
            offset: 0,
          },
        });
        this.items = response.items;
        this.total = response.total;
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении ленты";
      } finally {
        this.loading = false;
      }
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;
      const { $api } = useNuxtApp();
      this.loadingMore = true;
      this.error = null;
      try {
        const response = await $api<FeedResponse>("/feed", {
          method: "GET",
          params: {
            type: this.type,
            coinId: this.coinId ?? undefined,
            limit: this.limit,
            offset: this.items.length,
          },
        });
        this.items.push(...response.items);
        this.total = response.total;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при получении ленты";
      } finally {
        this.loadingMore = false;
      }
    },
  },
});
