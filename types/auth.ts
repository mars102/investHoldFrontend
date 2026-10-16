export interface UserRole {
    id: number
    value: 'USER' | 'ADMIN' | 'MODERATOR'
    description: string
}

export interface User {
    id: string
    name: string
    username: string
    email: string
    emailVerified?: boolean
    roles?: UserRole[]
    created_at: string
    updated_at: string
}

export interface LoginCredentials {
    login: string
    password: string
}

export interface RegisterCredentials {
    username: string
    email: string
    password: string
}

export interface AuthResponse {
    access_token?: string
    refresh_token?: string
    // /auth/registration replies with a single `token` instead of the
    // access/refresh pair /auth/login uses.
    token?: string
    user: User
}