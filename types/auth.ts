export interface User {
    id: string
    name: string
    email: string
    created_at: string
    updated_at: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    access_token: string
    refresh_token: string
    user: User
}