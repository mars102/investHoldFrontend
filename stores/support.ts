import { defineStore } from "pinia";
import type {
  CreateSupportTicketPayload,
  SupportMessage,
  SupportReplyPayload,
  SupportStatus,
  SupportTicket,
  SupportTicketList,
} from "~/types/support";

export interface AdminTicketFilters {
  status: SupportStatus | "all";
  search: string;
}

const EMPTY_COUNTS: Record<SupportStatus, number> = { new: 0, in_progress: 0, answered: 0, closed: 0 };

/**
 * For background polling (unread badges, counters): the $api plugin pops an
 * error toast on any 4xx and logs out on 401, which must not happen for
 * requests the user never asked for.
 */
function silentFetch<T>(url: string, params?: Record<string, string | undefined>) {
  const authStore = useAuthStore();
  return $fetch<T>(url, {
    params,
    baseURL: useRuntimeConfig().public.apiUrl,
    headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
  });
}

export const useSupportStore = defineStore("support", {
  state: () => ({
    // user side
    myTickets: [] as SupportTicket[],
    myLoading: false,
    myCurrent: null as SupportTicket | null,
    // admin side
    adminTickets: [] as SupportTicket[],
    adminTotal: 0,
    adminCounts: { ...EMPTY_COUNTS } as Record<SupportStatus, number>,
    adminLoading: false,
    // admin: currently opened ticket with messages
    current: null as SupportTicket | null,
    currentLoading: false,
    sending: false,
  }),

  getters: {
    myUnreadCount: (state) => state.myTickets.filter((t) => t.hasUnread).length,
  },

  actions: {
    /**
     * Creating a ticket works for guests too, so it goes through plain $fetch:
     * the $api plugin treats 401 as an expired session and redirects to /login.
     */
    async createTicket(payload: CreateSupportTicketPayload) {
      const authStore = useAuthStore();
      const { attachments, ...fields } = payload;
      this.sending = true;
      try {
        return await $fetch<SupportTicket>("/support", {
          method: "POST",
          baseURL: useRuntimeConfig().public.apiUrl,
          headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
          body: buildSupportFormData(fields, attachments),
        });
      } finally {
        this.sending = false;
      }
    },

    /* ---------- user ---------- */

    async fetchMyTickets() {
      this.myLoading = true;
      try {
        this.myTickets = (await silentFetch<SupportTicket[]>("/support/my")) ?? [];
      } catch {
        this.myTickets = [];
      } finally {
        this.myLoading = false;
      }
    },

    async openMyTicket(id: number) {
      const { $api } = useNuxtApp();
      this.currentLoading = true;
      try {
        this.myCurrent = await $api<SupportTicket>(`/support/my/${id}`);
        // the detail request marks admin replies as read on the backend
        const listed = this.myTickets.find((t) => t.id === id);
        if (listed) listed.hasUnread = false;
      } finally {
        this.currentLoading = false;
      }
    },

    async replyAsUser(id: number, payload: SupportReplyPayload) {
      const { $api } = useNuxtApp();
      this.sending = true;
      try {
        const message = await $api<SupportMessage>(`/support/my/${id}/messages`, {
          method: "POST",
          body: buildSupportFormData({ text: payload.text }, payload.attachments),
        });
        this.appendToCurrent(id, message, "new");
        return message;
      } finally {
        this.sending = false;
      }
    },

    /* ---------- admin ---------- */

    async fetchAdminTickets(filters: AdminTicketFilters) {
      this.adminLoading = true;
      try {
        // silent: the inbox shows load errors inline and refreshes every minute
        const response = await silentFetch<SupportTicketList>("/support/admin", {
          status: filters.status === "all" ? undefined : filters.status,
          search: filters.search.trim() || undefined,
        });
        this.adminTickets = response.items ?? [];
        this.adminTotal = response.total ?? 0;
        this.adminCounts = { ...EMPTY_COUNTS, ...(response.counts ?? {}) };
      } finally {
        this.adminLoading = false;
      }
    },

    /** Lightweight counters for the admin nav badge */
    async fetchAdminCounts() {
      try {
        const counts = await silentFetch<Record<SupportStatus, number>>("/support/admin/stats");
        this.adminCounts = { ...EMPTY_COUNTS, ...(counts ?? {}) };
      } catch {
        // badge is non-essential
      }
    },

    async openAdminTicket(id: number) {
      const { $api } = useNuxtApp();
      this.currentLoading = true;
      try {
        this.current = await $api<SupportTicket>(`/support/admin/${id}`);
        const listed = this.adminTickets.find((t) => t.id === id);
        if (listed) listed.hasUnread = false;
      } finally {
        this.currentLoading = false;
      }
    },

    async replyAsAdmin(id: number, payload: SupportReplyPayload) {
      const { $api } = useNuxtApp();
      this.sending = true;
      try {
        const message = await $api<SupportMessage>(`/support/admin/${id}/messages`, {
          method: "POST",
          body: buildSupportFormData({ text: payload.text, status: payload.status }, payload.attachments),
        });
        this.appendToCurrent(id, message, payload.status ?? "answered");
        return message;
      } finally {
        this.sending = false;
      }
    },

    async setStatus(id: number, status: SupportStatus) {
      const { $api } = useNuxtApp();
      await $api(`/support/admin/${id}`, { method: "PATCH", body: { status } });
      const previous = this.adminTickets.find((t) => t.id === id)?.status ?? this.current?.status;
      if (this.current?.id === id) this.current.status = status;
      const listed = this.adminTickets.find((t) => t.id === id);
      if (listed) listed.status = status;
      if (previous && previous !== status) {
        this.adminCounts[previous] = Math.max(0, this.adminCounts[previous] - 1);
        this.adminCounts[status] += 1;
      }
    },

    appendToCurrent(id: number, message: SupportMessage, status: SupportStatus) {
      for (const opened of [this.current, this.myCurrent]) {
        if (opened?.id === id) {
          opened.messages = [...(opened.messages ?? []), message];
          opened.status = status;
        }
      }
      for (const list of [this.myTickets, this.adminTickets]) {
        const listed = list.find((t) => t.id === id);
        if (listed) {
          listed.status = status;
          listed.preview = message.text.split("\n")[0] ?? "";
          listed.lastMessageAt = message.createdAt;
          listed.messagesCount += 1;
        }
      }
    },

    closeCurrent() {
      this.current = null;
    },

    closeMyCurrent() {
      this.myCurrent = null;
    },
  },
});
