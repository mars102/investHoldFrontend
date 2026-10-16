import type { SupportCategory, SupportStatus } from "~/types/support";

export const MAX_SUPPORT_ATTACHMENTS = 5;
export const MAX_SUPPORT_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_SUPPORT_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateSupportAttachments(files: File[]): string | null {
  if (files.length > MAX_SUPPORT_ATTACHMENTS) {
    return `Можно прикрепить не более ${MAX_SUPPORT_ATTACHMENTS} скриншотов`;
  }
  for (const file of files) {
    if (!ALLOWED_SUPPORT_ATTACHMENT_MIME_TYPES.includes(file.type)) {
      return `Можно прикреплять только картинки (JPG, PNG, WebP, GIF): ${file.name}`;
    }
    if (file.size > MAX_SUPPORT_ATTACHMENT_SIZE_BYTES) {
      return `Файл ${file.name} больше 10MB`;
    }
  }
  return null;
}

export function buildSupportFormData(fields: Record<string, string | undefined>, attachments: File[]): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) formData.append(key, value);
  }
  for (const file of attachments) {
    formData.append("attachments", file);
  }
  return formData;
}

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  bug: "Ошибка",
  idea: "Идея",
  question: "Вопрос",
  other: "Другое",
};

export const SUPPORT_STATUS_META: Record<SupportStatus, { label: string; badge: string }> = {
  new: {
    label: "Новое",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  in_progress: {
    label: "В работе",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  answered: {
    label: "Отвечено",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  closed: {
    label: "Закрыто",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300",
  },
};
