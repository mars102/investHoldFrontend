import { defineStore } from 'pinia'

export const useMyTradeStore = defineStore('trade',{

  state: () => ({isCreate:false }),
  actions: {
    toggleCreate() {
      this.isCreate = !this.isCreate
    }
  }
})
