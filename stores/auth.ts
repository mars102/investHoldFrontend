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

            accessToken.value = response.token
            refreshToken.value = response.token
            user.value = response.token

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
                body: JSON.stringify(credentials) ,
                baseURL: useRuntimeConfig().public.apiUrl
            })

            accessToken.value = response.access_token
            refreshToken.value = response.refresh_token
            user.value = response.user

            await navigateTo('/')
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.data?.message || 'Registration failed' }
        }
    }

    const logout = async () => {
        try {
            await $fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                baseURL: useRuntimeConfig().public.apiUrl
            })
        } finally {
            accessToken.value = null
            refreshToken.value = null
            user.value = null
            await navigateTo('/login')
        }
    }

    const fetchUser = async () => {
        if (!accessToken.value) return

        try {
            const response = await $fetch<User>('auth/me', {
                headers: {
                    Authorization: `Bearer ${accessToken.value}`
                },
                baseURL: useRuntimeConfig().public.apiUrl
            })

            user.value = response
        } catch (error) {
            // Если токен истек, разлогиниваем
            if (error.status === 401) {
                logout()
            }
        }
    }

    const refreshAccessToken = async () => {
        if (!refreshToken.value) return false

        try {
            const response = await $fetch<{ access_token: string }>('auth/refresh', {
                method: 'POST',
                body: { refresh_token: refreshToken.value },
                baseURL: useRuntimeConfig().public.apiUrl
            })

            accessToken.value = response.access_token
            return true
        } catch (error) {
            logout()
            return false
        }
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
        refreshAccessToken
    }
})