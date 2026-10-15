export default defineNuxtPlugin(() => {
    const { $pinia } = useNuxtApp()
    const authStore = useAuthStore($pinia)
    const config = useRuntimeConfig()

    const $api = $fetch.create({
        baseURL: config.public.apiUrl,
        onRequest({ request, options }) {
            // Добавляем токен к каждому запросу
            const token = authStore.accessToken
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                }
            }
        },
        onResponseError({ response }) {
            const toast = useToast()

            // Если токен истек, пытаемся обновить
            if (response.status === 401 && !response.url?.includes('/auth/refresh')) {
                authStore.refreshAccessToken().then(refreshed => {
                    if (!refreshed) {
                        toast.add({ title: 'Сессия истекла. Войдите снова.', color: 'red' })
                    }
                })
            }

            // Показываем ошибки
            if (response.status >= 400 && response.status !== 401) {
                const errorMessage = response._data?.message || 'Произошла ошибка'
                toast.add({ title: errorMessage, color: 'red' })
            }
        }
    })

    return {
        provide: {
            api: $api
        }
    }
})