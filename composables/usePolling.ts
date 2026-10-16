/**
 * Calls `fn` every `intervalMs` while `active` is true and the browser tab is
 * visible. Coming back to the tab triggers an immediate refresh, so replies
 * that arrived while it was hidden show up at once.
 */
export function usePolling(fn: () => unknown, intervalMs: number, active: Ref<boolean> | (() => boolean) = () => true) {
  const visibility = useDocumentVisibility()
  const isActive = computed(() => (typeof active === 'function' ? active() : active.value) && visibility.value === 'visible')

  let timer: ReturnType<typeof setInterval> | undefined
  let running = false

  async function tick() {
    if (running) return // don't stack requests on a slow connection
    running = true
    try {
      await fn()
    } finally {
      running = false
    }
  }

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  watch(
    isActive,
    (on, wasOn) => {
      stop()
      if (!on) return
      if (wasOn === false) void tick()
      timer = setInterval(tick, intervalMs)
    },
    { immediate: true }
  )

  onScopeDispose(stop)
}
