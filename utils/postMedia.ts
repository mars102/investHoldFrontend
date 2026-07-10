export const MAX_POST_MEDIA_FILES = 10;
export const MAX_POST_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;
export const ALLOWED_POST_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

/** Mirrors the backend's upload limits so obviously invalid files are
 *  rejected before spending a round-trip on them — the server is still the
 *  source of truth and enforces the same limits itself. */
export function validatePostMediaFiles(files: File[]): string | null {
  if (files.length > MAX_POST_MEDIA_FILES) {
    return `Можно загрузить не более ${MAX_POST_MEDIA_FILES} файлов за раз`;
  }

  for (const file of files) {
    if (!ALLOWED_POST_MEDIA_MIME_TYPES.includes(file.type)) {
      return `Неподдерживаемый формат файла: ${file.name}`;
    }
    if (file.size > MAX_POST_MEDIA_SIZE_BYTES) {
      return `Файл ${file.name} больше 50MB`;
    }
  }

  return null;
}

export function isVideoMime(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}
