/** Shared flag the main scroll container (in layouts/default.vue) reads to
 *  freeze its own scrolling — used while a floating composer is expanded so
 *  it doesn't drift away from under the user while they're typing. */
export function useScrollLock() {
  return useState<boolean>('main-scroll-locked', () => false)
}
