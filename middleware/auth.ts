
export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // Если не авторизован, перенаправляем на логин
    if (!authStore.isAuthenticated) {
        return navigateTo('/login')
    }

    // Если пользователь не загружен, загружаем
    if (!authStore.user) {
        await authStore.fetchUser()
    }
})