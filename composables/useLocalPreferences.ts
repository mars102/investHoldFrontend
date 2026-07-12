export interface LocalPreferences {
  currency: string
  emailNotifications: boolean
  priceAlertNotifications: boolean
}

const STORAGE_KEY = 'investhold:preferences'

function readStored(): LocalPreferences {
  const defaults: LocalPreferences = {
    currency: 'USD',
    emailNotifications: true,
    priceAlertNotifications: true
  }
  if (import.meta.server) return defaults
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

/** Preferences that only live in this browser — the backend has no endpoint
 *  yet to persist profile/currency/notification settings server-side. */
export function useLocalPreferences() {
  const prefs = useState<LocalPreferences>('local-preferences', readStored)

  watch(
    prefs,
    (value) => {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      }
    },
    { deep: true }
  )

  return prefs
}
