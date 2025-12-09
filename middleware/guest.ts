export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // Если авторизован, перенаправляем на главную
    if (authStore.isAuthenticated) {
        return navigateTo('/')
    }
})