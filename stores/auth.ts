import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const accessToken = useCookie<string | null>('access_token', {
        maxAge: 60 * 60 * 24, // 24 часа
        sameSite: 'strict'
    })

    const refreshToken = useCookie<string | null>('refresh_token', {
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        sameSite: 'strict'
    })

    const isAuthenticated = computed(() => !!accessToken.value)

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await $fetch<AuthResponse>('auth/login', {
                method: 'POST',
                body: credentials,
                baseURL: useRuntimeConfig().public.apiUrl
            })

            // Исправление: сохраняем токен и загружаем данные пользователя
            accessToken.value = response.access_token || response.token
            refreshToken.value = response.refresh_token || response.token

            // Загружаем данные пользователя сразу после успешного логина
            await fetchUser()

            await navigateTo('/')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.data?.message || 'Login failed' }
        }
    }

    const register = async (credentials: RegisterCredentials) => {
        try {
            const response = await $fetch<AuthResponse>('auth/registration', {
                method: 'POST',
                body: JSON.stringify(credentials),
                baseURL: useRuntimeConfig().public.apiUrl
            })

            accessToken.value = response.access_token
            refreshToken.value = response.refresh_token

            // Устанавливаем пользователя из ответа или загружаем
            if (response.user) {
                user.value = response.user
            } else {
                // Если пользователь не пришел в ответе, загружаем отдельно
                await fetchUser()
            }

            await navigateTo('/')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.data?.message || 'Registration failed' }
        }
    }

    const logout = async () => {
        try {
            if (accessToken.value) {
                await $fetch('/auth/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken.value}`
                    },
                    baseURL: useRuntimeConfig().public.apiUrl
                })
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            accessToken.value = null
            refreshToken.value = null
            user.value = null
            await navigateTo('/login')
        }
    }

    const fetchUser = async () => {
        if (!accessToken.value) {
            user.value = null
            return null
        }

        try {
            const response = await $fetch<User>('auth/me', {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                baseURL: useRuntimeConfig().public.apiUrl
            })

            user.value = response
            return response
        } catch (error: any) {
            // Если токен истек, пробуем обновить
            if (error.status === 401) {
                const refreshed = await refreshAccessToken()
                if (refreshed) {
                    return await fetchUser() // Повторяем запрос с новым токеном
                }
            }
            user.value = null
            return null
        }
    }

    const refreshAccessToken = async () => {
        if (!refreshToken.value) {
            await logout()
            return false
        }

        try {
            const response = await $fetch<{ access_token: string }>('auth/refresh', {
                method: 'POST',
                body: { refresh_token: refreshToken.value },
                baseURL: useRuntimeConfig().public.apiUrl
            })

            accessToken.value = response.access_token
            return true
        } catch (error) {
            await logout()
            return false
        }
    }

    // Метод для инициализации при монтировании приложения
    const init = async () => {
        if (accessToken.value) {
            await fetchUser()
        }
        return user.value
    }

    return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUser,
        refreshAccessToken,
        init
    }
})