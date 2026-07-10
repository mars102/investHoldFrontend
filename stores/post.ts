import { defineStore } from "pinia";
import type { CreatePostPayload, UpdatePostPayload } from "../types/post";
import { useFeedStore } from "./feed";

function toFormData(payload: CreatePostPayload | UpdatePostPayload): FormData {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.content !== undefined) formData.append("content", payload.content);
  if (payload.coinId !== undefined) formData.append("coinId", String(payload.coinId));
  for (const file of payload.media ?? []) {
    formData.append("media", file);
  }
  return formData;
}

export const usePostStore = defineStore("post", {
  state: () => ({
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async createPost(payload: CreatePostPayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api("/posts", {
          method: "POST",
          body: toFormData(payload),
        });
        await useFeedStore().fetchFeed();
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при создании поста";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async updatePost(id: number, payload: UpdatePostPayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api(`/posts/${id}`, {
          method: "PUT",
          body: toFormData(payload),
        });
        await useFeedStore().fetchFeed();
        return response;
      } catch (e: any) {
        this.error = e?.message || "Ошибка при обновлении поста";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async deletePost(id: number) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api(`/posts/${id}`, { method: "DELETE" });
        await useFeedStore().fetchFeed();
      } catch (e: any) {
        this.error = e?.message || "Ошибка при удалении поста";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async deleteMedia(postId: number, mediaId: number) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        await $api(`/posts/${postId}/media/${mediaId}`, { method: "DELETE" });
        await useFeedStore().fetchFeed();
      } catch (e: any) {
        this.error = e?.message || "Ошибка при удалении файла";
        throw e;
      }
    },
  },
});
