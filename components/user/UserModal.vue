<template>
  <div class="user-modal">
    <h3>{{ isEditing ? 'Редактировать пользователя' : 'Просмотр пользователя' }}</h3>

    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label>Имя пользователя:</label>
        <input
            v-model="formData.username"
            :disabled="!isEditing"
            required
        />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input
            v-model="formData.email"
            type="email"
            :disabled="!isEditing"
            required
        />
      </div>

      <div class="form-group">
        <label>Роль:</label>
        <select
            v-model="formData.role"
            :disabled="!isEditing"
        >
          <option value="USER">Пользователь</option>
          <option value="ADMIN">Администратор</option>
          <option value="MODERATOR">Модератор</option>
        </select>
      </div>

      <div class="form-group">
        <label>
          <input
              type="checkbox"
              v-model="formData.isActive"
              :disabled="!isEditing"
          />
          Активный
        </label>
      </div>

      <div v-if="!isEditing" class="readonly-info">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Дата регистрации:</strong> {{ formatDate(user.createdAt) }}</p>
        <p><strong>Последнее обновление:</strong> {{ formatDate(user.updatedAt) }}</p>
      </div>

      <div class="modal-actions">
        <button type="button" @click="$emit('close')" class="btn-cancel">
          {{ isEditing ? 'Отмена' : 'Закрыть' }}
        </button>
        <button v-if="isEditing" type="submit" class="btn-save">
          Сохранить
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  user: any
  isEditing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'close'])

const formData = ref({
  username: '',
  email: '',
  role: 'USER',
  isActive: true
})

// Синхронизируем форму с пропсами
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      username: newUser.username || '',
      email: newUser.email || '',
      role: newUser.role || 'USER',
      isActive: newUser.isActive ?? true
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', formData.value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.user-modal {
  min-width: 400px;
}

.user-modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.readonly-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.readonly-info p {
  margin: 5px 0;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>