<template>
  <div class="user-list">
    <div class="user-list-header">
      <h2>Управление пользователями</h2>

      <div class="filters">
        <div class="search-input">
          <input
              v-model="searchQuery"
              @input="debouncedFetch"
              type="text"
              placeholder="Поиск по имени или email..."
              class="modern-input"
          />
        </div>

        <div class="select-wrapper">
          <select v-model="selectedRole" @change="fetchUsers" class="modern-select">
            <option value="">Все роли</option>
            <option value="USER">Пользователь</option>
            <option value="ADMIN">Администратор</option>
            <option value="MODERATOR">Модератор</option>
          </select>
          <div class="select-arrow">▼</div>
        </div>

        <div class="select-wrapper">
          <select v-model="selectedStatus" @change="fetchUsers" class="modern-select">
            <option value="">Все статусы</option>
            <option value="true">Активные</option>
            <option value="false">Заблокированные</option>
          </select>
          <div class="select-arrow">▼</div>
        </div>

        <button @click="fetchUsers" class="btn-refresh modern-btn">
          <svg class="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Обновить
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      Загрузка...
    </div>

    <div v-else-if="error" class="error">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12" y2="16"/>
      </svg>
      Ошибка: {{ error }}
    </div>

    <div v-else>
      <div class="table-container">
        <table class="users-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(user, index) in users" :key="user.id" :class="{ 'even-row': index % 2 === 0 }">
            <td class="text-color">{{ user.id }}</td>
            <td class="text-color">{{ user.username || '-' }}</td>
            <td class="text-color">{{ user.email || '-' }}</td>
            <td>
              <span class="role-badge" :class="getUserRole(user).toLowerCase()">
                {{ getUserRole(user) }}
              </span>
            </td>
            <td>
              <span
                  class="status-badge"
                  :class="{ 'active': !user.banned, 'inactive': user.banned }"
              >
                <span class="status-dot" :class="{ 'active': !user.banned, 'inactive': user.banned }"></span>
                {{ user.banned ? 'Заблокирован' : 'Активен' }}
              </span>
            </td>
            <td class="text-color">{{ formatDate(user.createdAt) }}</td>
            <td class="actions">
              <button @click="viewUser(user)" class="action-btn btn-view">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button @click="editUser(user)" class="action-btn btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                  @click="toggleUserStatus(user.id)"
                  :class="['action-btn btn-toggle', user.banned ? 'btn-activate' : 'btn-block']"
              >
                <svg v-if="user.banned" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18.36 6.64a9 9 0 11-12.73 0"/>
                  <line x1="12" y1="2" x2="12" y2="12"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </button>
              <button
                  @click="confirmDelete(user)"
                  class="action-btn btn-delete"
                  :disabled="currentUser?.id === user.id"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="users.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="7" r="5"/>
          <path d="M17 14h.01M7 14h.01"/>
          <path d="M12 14v4M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        Пользователи не найдены
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="pagination.page === 1" class="pagination-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Назад
        </button>
        <span class="page-info">
          Страница {{ pagination.page }} из {{ pagination.totalPages }}
        </span>
        <button @click="nextPage" :disabled="pagination.page === pagination.totalPages" class="pagination-btn">
          Вперед
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div class="user-count">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        Всего пользователей: {{ pagination.total }}
      </div>
    </div>

    <!-- Модальное окно удаления -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <div class="delete-modal">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить пользователя "{{ userToDelete?.username }}"?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">
            Отмена
          </button>
          <button @click="deleteUserConfirmed" class="btn-delete">
            Удалить
          </button>
        </div>
      </div>
    </Modal>

    <!-- Модальное окно для просмотра/редактирования -->
    <Modal v-if="showUserModal" @close="closeUserModal">
      <UserModal
          :user="selectedUser"
          :is-editing="isEditing"
          @save="handleSaveUser"
          @close="closeUserModal"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import { useAuthStore } from '../../stores/auth'
import Modal from '../../components/Modal.vue'
import UserModal from '../../components/user/UserModal.vue'

const userStore = useUserStore()
const authStore = useAuthStore()

// Реактивные переменные
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showDeleteModal = ref(false)
const showUserModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref<any>(null)
const selectedUser = ref<any>(null)
const debounceTimer = ref<NodeJS.Timeout | null>(null)

// Компьютед свойства
const users = computed(() => userStore.getUsers)
const pagination = computed(() => userStore.getPagination)
const isLoading = computed(() => userStore.getIsLoading)
const error = computed(() => userStore.getError)
const currentUser = computed(() => authStore.user)

// Методы
const fetchUsers = async () => {
  const filters = {
    search: searchQuery.value || undefined,
    role: selectedRole.value || undefined,
    banned: selectedStatus.value === 'false' ? true :
        selectedStatus.value === 'true' ? false : undefined
  }

  await userStore.fetchUsers(filters)
}

const debouncedFetch = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    userStore.setPage(pagination.value.page - 1)
    fetchUsers()
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    userStore.setPage(pagination.value.page + 1)
    fetchUsers()
  }
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '-'
  }
}

const getUserRole = (user: any): string => {
  if (!user.roles || user.roles.length === 0) return 'USER'

  // Возвращаем первую роль (в данных обычно одна роль на пользователя)
  return user.roles[0]?.value || 'USER'
}

const viewUser = (user: any) => {
  if (!user) return
  selectedUser.value = { ...user }
  isEditing.value = false
  showUserModal.value = true
}

const editUser = (user: any) => {
  if (!user) return
  selectedUser.value = { ...user }
  isEditing.value = true
  showUserModal.value = true
}

const toggleUserStatus = async (userId: number) => {
  try {
    await userStore.toggleUserStatus(userId)
    // Можно показать уведомление об успехе
  } catch (error) {
    console.error('Ошибка при изменении статуса:', error)
  }
}

const confirmDelete = (user: any) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUserConfirmed = async () => {
  if (userToDelete.value) {
    try {
      await userStore.deleteUser(userToDelete.value.id)
      showDeleteModal.value = false
      userToDelete.value = null
      // Можно показать уведомление об успехе
    } catch (error) {
      console.error('Ошибка при удалении:', error)
    }
  }
}

const handleSaveUser = async (userData: any) => {
  try {
    if (isEditing.value && selectedUser.value) {
      await userStore.updateUser(selectedUser.value.id, userData)
    }
    closeUserModal()
    // Можно показать уведомление об успехе
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
  }
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
  isEditing.value = false
}

// Наблюдатели
watch([selectedRole, selectedStatus], () => {
  fetchUsers()
})

// Хуки жизненного цикла
onMounted(async () => {
  await fetchUsers()
})
</script>

<style scoped>
.user-list {
  padding: 24px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.user-list-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  position: relative;
}

.modern-input {
  padding: 10px 16px;
  padding-left: 40px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  width: 280px;
  background: white;
  font-size: 14px;
  color: #334155;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 12px center;
  background-size: 16px;
}

.modern-input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230ea5e9' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E");
}

.select-wrapper {
  position: relative;
  display: inline-block;
}

.modern-select {
  appearance: none;
  padding: 10px 36px 10px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.modern-select:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

.modern-select:focus + .select-arrow {
  color: #0ea5e9;
}

.btn-refresh {
  padding: 10px 20px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.btn-refresh:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
  background: linear-gradient(135deg, #0284c7, #0369a1);
}

.refresh-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0;
}

.users-table th {
  padding: 14px 16px;
  text-align: left;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.users-table th:first-child {
  border-top-left-radius: 12px;
}

.users-table th:last-child {
  border-top-right-radius: 12px;
}

.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  font-size: 13px;
  transition: background-color 0.15s ease;
}

.text-color {
  color: #334155 !important;
}

.users-table tr:hover td {
  background-color: rgba(241, 245, 249, 0.6);
}

.users-table tr.even-row td {
  background-color: rgba(248, 250, 252, 0.4);
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:last-child td:first-child {
  border-bottom-left-radius: 12px;
}

.users-table tr:last-child td:last-child {
  border-bottom-right-radius: 12px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.role-badge.user {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-color: #93c5fd;
}

.role-badge.admin {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  color: #6b21a8;
  border-color: #d8b4fe;
}

.role-badge.moderator {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border-color: #86efac;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.status-badge.active {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #166534;
  border-color: #86efac;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  color: #991b1b;
  border-color: #fca5a5;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.active {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}

.status-dot.inactive {
  background: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
}

.btn-view {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.btn-view:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  color: #475569;
}

.btn-edit {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: 1px solid #2563eb;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.btn-toggle.btn-block {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border: 1px solid #d97706;
}

.btn-toggle.btn-block:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-toggle.btn-activate {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: 1px solid #059669;
}

.btn-toggle.btn-activate:hover {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-delete {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border: 1px solid #dc2626;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.pagination-btn {
  padding: 8px 16px;
  border: 1.5px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #0ea5e9;
  color: #0ea5e9;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.15);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.user-count {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 48px 20px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(14, 165, 233, 0.2);
  border-radius: 50%;
  border-top-color: #0ea5e9;
  animation: spin 1s linear infinite;
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc2626;
  background: rgba(254, 226, 226, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state svg {
  color: #cbd5e1;
}

.delete-modal {
  padding: 24px;
}

.delete-modal h3 {
  margin-top: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.delete-modal p {
  margin: 16px 0 24px;
  color: #64748b;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1.5px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: #94a3b8;
  color: #475569;
}

.btn-delete {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

@media (max-width: 1024px) {
  .user-list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .modern-input {
    width: 100%;
  }

  .modern-select {
    width: 100%;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .user-list {
    padding: 16px;
  }

  .users-table th,
  .users-table td {
    padding: 10px 12px;
  }

  .actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .page-info {
    order: -1;
  }
}
</style>