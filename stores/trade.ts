import { defineStore } from 'pinia'
import type { createTrade } from '../types/trade'

export const useMyTradeStore = defineStore('trade', {
  state: () => ({
    isCreate: false,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    toggleCreate() {
      this.isCreate = !this.isCreate
    },
    async createTrade(form: createTrade) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const response = await $api('/transactions', {
          method: 'POST',
          body: form,
        })
        this.isCreate = false
        return response
      } catch (e: any) {
        this.error = e?.message || 'Ошибка при создании сделки'
      } finally {
        this.loading = false
      }
    }
  }
})