import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth'

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { $api } = useNuxtApp()
        return await $api('/auth/login', {
            method: 'POST',
            body: credentials
        })
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const { $api } = useNuxtApp()
        return await $api('/auth/register', {
            method: 'POST',
            body: credentials
        })
    },

    async logout(): Promise<void> {
        const { $api } = useNuxtApp()
        return await $api('/auth/logout', {
            method: 'POST'
        })
    },

    async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        const { $api } = useNuxtApp()
        return await $api('/auth/refresh', {
            method: 'POST',
            body: { refresh_token: refreshToken }
        })
    },

    async getCurrentUser(): Promise<any> {
        const { $api } = useNuxtApp()
        return await $api('/auth/me')
    }
}