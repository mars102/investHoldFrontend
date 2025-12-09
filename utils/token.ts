export const token = {
    setAccessToken(token: string) {
        useCookie('access_token').value = token
    },

    getAccessToken(): string | null {
        return useCookie('access_token').value
    },

    removeAccessToken() {
        useCookie('access_token').value = null
    },

    setRefreshToken(token: string) {
        useCookie('refresh_token').value = token
    },

    getRefreshToken(): string | null {
        return useCookie('refresh_token').value
    },

    removeRefreshToken() {
        useCookie('refresh_token').value = null
    },

    clearTokens() {
        this.removeAccessToken()
        this.removeRefreshToken()
    }
}