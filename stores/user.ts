import { defineStore } from 'pinia'
import type { User, UserListFilters, Pagination } from '~/types/user'

interface UserState {
    users: User[]
    currentUser: User | null
    pagination: Pagination
    isLoading: boolean
    error: string | null
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        users: [],
        currentUser: null,
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        },
        isLoading: false,
        error: null
    }),

    getters: {
        getUsers: (state) => state.users,
        getCurrentUser: (state) => state.currentUser,
        getPagination: (state) => state.pagination,
        getIsLoading: (state) => state.isLoading,
        getError: (state) => state.error
    },

    actions: {
        async fetchUsers(filters: UserListFilters = {}) {
            this.isLoading = true
            this.error = null

            try {
                const { $api } = useNuxtApp()

                // Подготавливаем параметры запроса
                const params: any = {
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...filters
                }

                // Преобразуем banned фильтр если нужно
                if (filters.banned !== undefined) {
                    params.banned = filters.banned
                }

                const response = await $api('/users', {
                    method: 'GET',
                    params
                })

                // Обработка ответа API
                if (response && typeof response === 'object') {
                    // Если API возвращает данные в поле 'data'
                    if ('data' in response && Array.isArray(response.data)) {
                        this.users = response.data
                    } else if (Array.isArray(response)) {
                        // Если API возвращает просто массив
                        this.users = response
                    } else {
                        this.users = []
                    }

                    // Обновляем пагинацию если она есть в ответе
                    if (response.pagination) {
                        this.pagination = {
                            ...this.pagination,
                            ...response.pagination
                        }
                    }
                } else {
                    this.users = []
                }
            } catch (error: any) {
                this.error = error.message || 'Ошибка при получении пользователей'
                console.error('Ошибка при загрузке пользователей:', error)
            } finally {
                this.isLoading = false
            }
        },

        async fetchUserById(id: number) {
            try {
                const { $api } = useNuxtApp()
                const response = await $api<User>(`/users/${id}`)
                this.currentUser = response
                return response
            } catch (error: any) {
                console.error('Ошибка при получении пользователя:', error)
                throw error
            }
        },

        async updateUser(id: number, data: Partial<User>) {
            try {
                const { $api } = useNuxtApp()
                const response = await $api<User>(`/users/${id}`, {
                    method: 'PATCH',
                    body: data
                })

                // Обновляем пользователя в списке
                const index = this.users.findIndex(u => u.id === id)
                if (index !== -1) {
                    this.users[index] = { ...this.users[index], ...response }
                }

                // Если это текущий пользователь, обновляем его тоже
                if (this.currentUser?.id === id) {
                    this.currentUser = { ...this.currentUser, ...response }
                }

                return response
            } catch (error: any) {
                console.error('Ошибка при обновлении пользователя:', error)
                throw error
            }
        },

        async deleteUser(id: number) {
            try {
                const { $api } = useNuxtApp()
                await $api(`/users/${id}`, {
                    method: 'DELETE'
                })

                // Удаляем пользователя из списка
                this.users = this.users.filter(u => u.id !== id)

                // Обновляем общее количество
                if (this.pagination.total > 0) {
                    this.pagination.total -= 1
                }

                // Если это текущий пользователь, сбрасываем
                if (this.currentUser?.id === id) {
                    this.currentUser = null
                }

                return true
            } catch (error: any) {
                console.error('Ошибка при удалении пользователя:', error)
                throw error
            }
        },

        async toggleUserStatus(id: number) {
            const user = this.users.find(u => u.id === id)
            if (!user) {
                throw new Error('Пользователь не найден')
            }

            try {
                // Используем banned вместо isActive
                const newBannedStatus = !user.banned
                return await this.updateUser(id, { banned: newBannedStatus })
            } catch (error) {
                console.error('Ошибка при изменении статуса пользователя:', error)
                throw error
            }
        },

        async updateUserRoles(id: number, roleIds: number[]) {
            try {
                const { $api } = useNuxtApp()
                const response = await $api<User>(`/users/${id}/roles`, {
                    method: 'PUT',
                    body: { roleIds }
                })

                // Обновляем пользователя в списке
                const index = this.users.findIndex(u => u.id === id)
                if (index !== -1) {
                    this.users[index] = { ...this.users[index], ...response }
                }

                // Если это текущий пользователь, обновляем его тоже
                if (this.currentUser?.id === id) {
                    this.currentUser = { ...this.currentUser, ...response }
                }

                return response
            } catch (error: any) {
                console.error('Ошибка при обновлении ролей пользователя:', error)
                throw error
            }
        },

        setPage(page: number) {
            if (page >= 1) {
                this.pagination.page = page
            }
        },

        setLimit(limit: number) {
            if (limit > 0) {
                this.pagination.limit = limit
                this.pagination.page = 1 // Сбрасываем на первую страницу
            }
        },

        clearError() {
            this.error = null
        },

        resetPagination() {
            this.pagination = {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0
            }
        }
    }
})