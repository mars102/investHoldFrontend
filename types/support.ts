export type SupportCategory = "bug" | "idea" | "question" | "other";

export type SupportStatus = "new" | "in_progress" | "answered" | "closed";

export interface SupportAttachment {
  id: number;
  url: string;
  mimeType: string;
  originalName?: string;
}

export interface SupportMessage {
  id: number;
  ticketId: number;
  authorType: "user" | "admin";
  author?: { id: number; username: string } | null;
  text: string;
  attachments: SupportAttachment[];
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  category: SupportCategory;
  status: SupportStatus;
  email: string;
  page?: string | null;
  userAgent?: string | null;
  userId?: number | null;
  user?: { id: number; username: string; email: string } | null;
  /** First line of the latest message — for list previews */
  preview: string;
  messagesCount: number;
  /** Ticket has user messages the admin hasn't answered yet / admin replies the user hasn't read */
  hasUnread: boolean;
  lastMessageAt: string;
  createdAt: string;
  /** Present only in the detail endpoints */
  messages?: SupportMessage[];
}

export interface SupportTicketList {
  items: SupportTicket[];
  total: number;
  counts: Record<SupportStatus, number>;
}

export interface CreateSupportTicketPayload {
  category: SupportCategory;
  message: string;
  email: string;
  page: string;
  userAgent: string;
  attachments: File[];
}

/** A message shown in the thread before (or instead of) the server confirming it */
export interface PendingSupportMessage {
  localId: string;
  ticketId: number;
  side: "user" | "admin";
  text: string;
  files: File[];
  previewUrls: string[];
  /** Admin only: status to set together with the reply */
  statusAfter?: SupportStatus;
  state: "sending" | "failed";
  error?: string;
  createdAt: string;
}

export interface SupportReplyPayload {
  text: string;
  attachments: File[];
  /** Admin only: status to set together with the reply */
  status?: SupportStatus;
}
