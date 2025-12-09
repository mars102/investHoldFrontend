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
            const { $toast } = useNuxtApp()

            // Если токен истек, пытаемся обновить
            if (response.status === 401 && !response.url?.includes('/auth/refresh')) {
                authStore.refreshAccessToken().then(refreshed => {
                    if (!refreshed) {
                        $toast.error('Session expired. Please login again.')
                    }
                })
            }

            // Показываем ошибки
            if (response.status >= 400 && response.status !== 401) {
                const errorMessage = response._data?.message || 'An error occurred'
                $toast.error(errorMessage)
            }
        }
    })

    return {
        provide: {
            api: $api
        }
    }
})