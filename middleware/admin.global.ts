// Guards every /admin/* route, so new admin pages are protected without having
// to remember a page-level middleware. Real protection is on the backend
// (@Roles('ADMIN')); this keeps non-admins from even seeing the admin UI.
export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path !== '/admin' && !to.path.startsWith('/admin/')) return

    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        return navigateTo('/login')
    }

    if (!authStore.user) {
        await authStore.fetchUser()
    }

    // Token was there but the user couldn't be loaded — the session is gone
    if (!authStore.user) {
        return navigateTo('/login')
    }

    const isAdmin = authStore.user.roles?.some((role) => role.value === 'ADMIN') ?? false
    if (!isAdmin) {
        useToast().add({ title: 'Раздел доступен только администраторам', color: 'red' })
        return navigateTo('/')
    }
})
