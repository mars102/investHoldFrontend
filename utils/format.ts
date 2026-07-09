type NumberLike = number | string | null | undefined

function toNumber(value: NumberLike): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function formatNumber(value?: NumberLike): string {
  return toNumber(value).toFixed(2)
}

export function formatPercent(value?: NumberLike): string {
  const v = toNumber(value)
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export function formatPrice(value?: NumberLike): string {
  const v = toNumber(value)
  if (v === 0) return '0.00'
  if (v < 1) return v.toFixed(6)
  if (v < 100) return v.toFixed(4)
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatQuantity(value?: NumberLike): string {
  return Number(toNumber(value).toFixed(8)).toString()
}

/** Formats a Date as a "YYYY-MM-DDTHH:mm" string in *local* time, suitable for
 *  an <input type="datetime-local"> default value. `date.toISOString()` would
 *  return UTC and silently shift the value by the user's timezone offset. */
export function toDatetimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes} мин назад`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ч назад`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} дн назад`

  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}
