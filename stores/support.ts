import { defineStore } from "pinia";
import type {
  CreateSupportTicketPayload,
  PendingSupportMessage,
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
 * Support requests bypass the $api plugin: it pops an error toast on any 4xx
 * and logs out on 401. Background polling must stay silent, guests must not be
 * redirected, and failed messages are shown inline in the thread instead.
 */
function supportFetch<T>(
  url: string,
  options: { method?: "GET" | "POST" | "PATCH"; params?: Record<string, string | undefined>; body?: any } = {},
) {
  const authStore = useAuthStore();
  return $fetch<T>(url, {
    ...options,
    baseURL: useRuntimeConfig().public.apiUrl,
    headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
  });
}

function errorMessage(error: any, fallback: string): string {
  if (error?.data?.message) return String(error.data.message);
  if (!error?.response) return "Нет связи с сервером";
  return fallback;
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
    // optimistic messages not yet confirmed by the server (both sides)
    pending: [] as PendingSupportMessage[],
  }),

  getters: {
    myUnreadCount: (state) => state.myTickets.filter((t) => t.hasUnread).length,
    pendingFor: (state) => (ticketId: number, side: "user" | "admin") =>
      state.pending.filter((p) => p.ticketId === ticketId && p.side === side),
  },

  actions: {
    async createTicket(payload: CreateSupportTicketPayload) {
      const { attachments, ...fields } = payload;
      this.sending = true;
      try {
        return await supportFetch<SupportTicket>("/support", {
          method: "POST",
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
        this.myTickets = (await supportFetch<SupportTicket[]>("/support/my")) ?? [];
      } catch {
        // keep the previous list: a failed poll shouldn't blank it out
      } finally {
        this.myLoading = false;
      }
    },

    async openMyTicket(id: number) {
      this.currentLoading = true;
      try {
        this.myCurrent = await supportFetch<SupportTicket>(`/support/my/${id}`);
        // the detail request marks admin replies as read on the backend
        const listed = this.myTickets.find((t) => t.id === id);
        if (listed) listed.hasUnread = false;
      } finally {
        this.currentLoading = false;
      }
    },

    /** Poll the open thread; returns true when new messages arrived */
    async refreshMyCurrent(): Promise<boolean> {
      const opened = this.myCurrent;
      if (!opened) return false;
      try {
        const fresh = await supportFetch<SupportTicket>(`/support/my/${opened.id}`);
        if (this.myCurrent?.id !== fresh.id) return false;
        const before = this.myCurrent.messages?.length ?? 0;
        this.myCurrent = fresh;
        return (fresh.messages?.length ?? 0) > before;
      } catch {
        return false;
      }
    },

    /* ---------- admin ---------- */

    async fetchAdminTickets(filters: AdminTicketFilters) {
      this.adminLoading = true;
      try {
        const response = await supportFetch<SupportTicketList>("/support/admin", {
          params: {
            status: filters.status === "all" ? undefined : filters.status,
            search: filters.search.trim() || undefined,
          },
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
        const counts = await supportFetch<Record<SupportStatus, number>>("/support/admin/stats");
        this.adminCounts = { ...EMPTY_COUNTS, ...(counts ?? {}) };
      } catch {
        // badge is non-essential
      }
    },

    async openAdminTicket(id: number) {
      this.currentLoading = true;
      try {
        this.current = await supportFetch<SupportTicket>(`/support/admin/${id}`);
        const listed = this.adminTickets.find((t) => t.id === id);
        if (listed) listed.hasUnread = false;
      } finally {
        this.currentLoading = false;
      }
    },

    async refreshAdminCurrent(): Promise<boolean> {
      const opened = this.current;
      if (!opened) return false;
      try {
        const fresh = await supportFetch<SupportTicket>(`/support/admin/${opened.id}`);
        if (this.current?.id !== fresh.id) return false;
        const before = this.current.messages?.length ?? 0;
        this.current = fresh;
        const listed = this.adminTickets.find((t) => t.id === fresh.id);
        if (listed) Object.assign(listed, { status: fresh.status, hasUnread: false });
        return (fresh.messages?.length ?? 0) > before;
      } catch {
        return false;
      }
    },

    async setStatus(id: number, status: SupportStatus) {
      await supportFetch(`/support/admin/${id}`, { method: "PATCH", body: { status } });
      const previous = this.adminTickets.find((t) => t.id === id)?.status ?? this.current?.status;
      if (this.current?.id === id) this.current.status = status;
      const listed = this.adminTickets.find((t) => t.id === id);
      if (listed) listed.status = status;
      if (previous && previous !== status) {
        this.adminCounts[previous] = Math.max(0, this.adminCounts[previous] - 1);
        this.adminCounts[status] += 1;
      }
    },

    /* ---------- optimistic sending (both sides) ---------- */

    /** Shows the message in the thread right away, then delivers it in the background */
    sendMessage(side: "user" | "admin", ticketId: number, payload: SupportReplyPayload) {
      const pending: PendingSupportMessage = {
        localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ticketId,
        side,
        text: payload.text,
        files: payload.attachments,
        previewUrls: payload.attachments.map((f) => URL.createObjectURL(f)),
        statusAfter: payload.status,
        state: "sending",
        createdAt: new Date().toISOString(),
      };
      this.pending.push(pending);
      void this.deliver(pending.localId);
    },

    async deliver(localId: string) {
      const item = this.pending.find((p) => p.localId === localId);
      if (!item) return;
      item.state = "sending";
      item.error = undefined;

      const url =
        item.side === "user"
          ? `/support/my/${item.ticketId}/messages`
          : `/support/admin/${item.ticketId}/messages`;
      const fields = item.side === "user" ? { text: item.text } : { text: item.text, status: item.statusAfter };

      try {
        const message = await supportFetch<SupportMessage>(url, {
          method: "POST",
          body: buildSupportFormData(fields, item.files),
        });
        this.dropPending(localId);
        this.appendToCurrent(item.ticketId, message, item.side === "user" ? "new" : (item.statusAfter ?? "answered"));
        if (item.side === "admin") void this.fetchAdminCounts();
      } catch (error: any) {
        const failed = this.pending.find((p) => p.localId === localId);
        if (failed) {
          failed.state = "failed";
          failed.error = errorMessage(error, "Не удалось отправить");
        }
      }
    },

    retryPending(localId: string) {
      void this.deliver(localId);
    },

    dropPending(localId: string) {
      const item = this.pending.find((p) => p.localId === localId);
      if (!item) return;
      item.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      this.pending = this.pending.filter((p) => p.localId !== localId);
    },

    appendToCurrent(id: number, message: SupportMessage, status: SupportStatus) {
      let isNew = false;
      for (const opened of [this.current, this.myCurrent]) {
        if (opened?.id === id) {
          // a poll may have already brought this message in
          if (!opened.messages?.some((m) => m.id === message.id)) {
            opened.messages = [...(opened.messages ?? []), message];
            isNew = true;
          }
          opened.status = status;
        }
      }
      for (const list of [this.myTickets, this.adminTickets]) {
        const listed = list.find((t) => t.id === id);
        if (listed) {
          listed.status = status;
          listed.preview = message.text.split("\n")[0] ?? "";
          listed.lastMessageAt = message.createdAt;
          if (isNew) listed.messagesCount += 1;
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
