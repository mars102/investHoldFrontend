<template>
  <div class="create-coin-container">
    <!-- Компактная кнопка -->
    <button
        @click="openModal"
        class="create-button"
        :disabled="loading"
        aria-label="Создать новую монету"
    >
      <svg v-if="!loading" class="icon-plus" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else class="icon-loading" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
        <path d="M13 7C13 3.134 10.866 1 7 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="btn-text">{{ loading ? '...' : 'Добавить монету' }}</span>
    </button>

    <!-- Модальное окно -->
    <Transition name="fade">
      <div
          v-if="showModal"
          class="modal-overlay"
          @click.self="closeModal"
      >
        <div class="modal-content">
          <!-- Заголовок с градиентом -->
          <div class="modal-header">
            <div class="header-content">
              <h2><span class="gradient-text">Новая монета</span></h2>
              <p class="header-subtitle">Заполните данные для создания</p>
            </div>
            <button @click="closeModal" class="close-button" aria-label="Закрыть">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13 5L5 13M5 5L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Компактная форма -->
          <form @submit.prevent="submitForm" class="coin-form">
            <div class="form-grid">
              <!-- Тикер и Название в одной линии -->
              <div class="form-row">
                <div class="form-group compact">
                  <label for="ticker" class="compact-label">
                    <span class="label-text">Тикер *</span>
                  </label>
                  <input
                      id="ticker"
                      v-model="form.ticker"
                      type="text"
                      :class="['form-input', 'compact-input', { 'error': errors.ticker }]"
                      placeholder="BTC"
                      maxlength="10"
                      required
                  />
                  <div v-if="errors.ticker" class="error-text">{{ errors.ticker }}</div>
                </div>

                <div class="form-group compact">
                  <label for="fullName" class="compact-label">
                    <span class="label-text">Название *</span>
                  </label>
                  <input
                      id="fullName"
                      v-model="form.fullName"
                      type="text"
                      :class="['form-input', 'compact-input', { 'error': errors.fullName }]"
                      placeholder="Bitcoin"
                      maxlength="100"
                      required
                  />
                  <div v-if="errors.fullName" class="error-text">{{ errors.fullName }}</div>
                </div>
              </div>

              <!-- Цена и Валюта в одной линии -->
              <div class="form-row">
                <div class="form-group compact">
                  <label for="currentPrice" class="compact-label">
                    <span class="label-text">Цена *</span>
                  </label>

                    <input
                        id="currentPrice"
                        v-model.number="form.currentPrice"
                        type="number"
                        :class="['form-input', 'compact-input', { 'error': errors.currentPrice }]"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                    />


                  <div v-if="errors.currentPrice" class="error-text">{{ errors.currentPrice }}</div>
                </div>

                <div class="form-group compact">
                  <label for="currency" class="compact-label">
                    <span class="label-text">Валюта *</span>
                  </label>
                  <select
                      id="currency"
                      v-model="form.currency"
                      :class="['form-input', 'compact-input', 'select-input', { 'error': errors.currency }]"
                      required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="RUB">RUB</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <div v-if="errors.currency" class="error-text">{{ errors.currency }}</div>
                </div>
              </div>

              <!-- Быстрые поля в сетке 2x2 -->
              <div class="quick-fields">
                <div class="form-group compact">
                  <label for="blockchain" class="compact-label">
                    <span class="label-text">Блокчейн</span>
                  </label>
                  <input
                      id="blockchain"
                      v-model="form.blockchain"
                      type="text"
                      :class="['form-input', 'compact-input', { 'error': errors.blockchain }]"
                      placeholder="Ethereum"
                  />
                </div>

                <div class="form-group compact">
                  <label for="category" class="compact-label">
                    <span class="label-text">Категория</span>
                  </label>
                  <select
                      id="category"
                      v-model="form.category"
                      :class="['form-input', 'compact-input', 'select-input', { 'error': errors.category }]"
                  >
                    <option value="">Выберите</option>
                    <option value="cryptocurrency">Криптовалюта</option>
                    <option value="token">Токен</option>
                    <option value="stablecoin">Стейблкоин</option>
                    <option value="defi">DeFi</option>
                  </select>
                </div>

                <div class="form-group compact">
                  <label for="logoUrl" class="compact-label">
                    <span class="label-text">Логотип URL</span>
                  </label>
                  <input
                      id="logoUrl"
                      v-model="form.logoUrl"
                      type="url"
                      :class="['form-input', 'compact-input', { 'error': errors.logoUrl }]"
                      placeholder="https://..."
                  />
                </div>

                <div class="form-group compact">
                  <label for="website" class="compact-label">
                    <span class="label-text">Веб-сайт</span>
                  </label>
                  <input
                      id="website"
                      v-model="form.website"
                      type="url"
                      :class="['form-input', 'compact-input', { 'error': errors.website }]"
                      placeholder="https://..."
                  />
                </div>
              </div>

              <!-- Описание -->
              <div class="form-group compact full-width">
                <label for="description" class="compact-label">
                  <span class="label-text">Описание</span>
                  <span class="label-hint">Краткое описание монеты</span>
                </label>
                <textarea
                    id="description"
                    v-model="form.description"
                    :class="['form-input', 'compact-input', 'textarea', { 'error': errors.description }]"
                    placeholder="Опишите монету..."
                    rows="2"
                    maxlength="300"
                ></textarea>
                <div class="char-count">{{ form.description?.length || 0 }}/300</div>
              </div>

              <!-- Компактные флаги -->
              <div class="form-group compact full-width">
                <div class="checkbox-group">
                  <label class="checkbox">
                    <input
                        type="checkbox"
                        v-model="form.isActive"
                        :true-value="true"
                        :false-value="false"
                    />
                    <span class="checkbox-text">Активная</span>
                  </label>
                  <label class="checkbox">
                    <input
                        type="checkbox"
                        v-model="form.isTradable"
                        :true-value="true"
                        :false-value="false"
                    />
                    <span class="checkbox-text">Доступна для торговли</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Кнопки действий - компактные -->
            <div class="form-actions">
              <button
                  type="button"
                  @click="closeModal"
                  class="cancel-button"
                  :disabled="loading"
              >
                Отмена
              </button>
              <button
                  type="submit"
                  class="submit-button"
                  :disabled="loading || !isFormValid"
              >
                <template v-if="loading">
                  <svg class="loading-spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
                    <path d="M13 7C13 3.134 10.866 1 7 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  ...
                </template>
                <template v-else>
                  Создать
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Уведомление - компактное -->
    <Transition name="slide">
      <div
          v-if="notification.show"
          :class="['notification', notification.type]"
          role="alert"
      >
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" class="notification-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else class="notification-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 5.33333V8M8 10.6667H8.00667M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="notification-text">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="notification-close" aria-label="Закрыть уведомление">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 3.5L3.5 10M3.5 3.5L10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface CoinFormData {
  ticker: string
  fullName: string
  description?: string
  currentPrice: number
  currency: string
  logoUrl?: string
  website?: string
  blockchain?: string
  contractAddress?: string
  category?: string
  isActive: boolean
  isTradable: boolean
}

const showModal = ref(false)
const loading = ref(false)

const notification = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const form = reactive<CoinFormData>({
  ticker: '',
  fullName: '',
  description: '',
  currentPrice: 0,
  currency: 'USD',
  logoUrl: '',
  website: '',
  blockchain: '',
  contractAddress: '',
  category: '',
  isActive: true,
  isTradable: true
})

const errors = reactive({
  ticker: '',
  fullName: '',
  description: '',
  currentPrice: '',
  currency: '',
  logoUrl: '',
  website: '',
  blockchain: '',
  contractAddress: '',
  category: ''
})

const isFormValid = computed(() => {
  return form.ticker.trim() !== '' &&
      form.fullName.trim() !== '' &&
      form.currentPrice > 0 &&
      form.currency.trim() !== ''
})

const openModal = () => {
  showModal.value = true
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

const closeModal = () => {
  if (!loading.value) {
    showModal.value = false
    resetForm()
  }
}

const resetForm = () => {
  Object.assign(form, {
    ticker: '',
    fullName: '',
    description: '',
    currentPrice: 0,
    currency: 'USD',
    logoUrl: '',
    website: '',
    blockchain: '',
    contractAddress: '',
    category: '',
    isActive: true,
    isTradable: true
  })
}

const validateForm = (): boolean => {
  let isValid = true

  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  if (!form.ticker.trim()) {
    errors.ticker = 'Тикер обязателен'
    isValid = false
  } else if (form.ticker.length > 10) {
    errors.ticker = 'Максимум 10 символов'
    isValid = false
  } else if (!/^[A-Z0-9]+$/.test(form.ticker)) {
    errors.ticker = 'Только заглавные буквы и цифры'
    isValid = false
  }

  if (!form.fullName.trim()) {
    errors.fullName = 'Название обязательно'
    isValid = false
  } else if (form.fullName.length > 100) {
    errors.fullName = 'Максимум 100 символов'
    isValid = false
  }

  if (form.currentPrice <= 0) {
    errors.currentPrice = 'Цена должна быть больше 0'
    isValid = false
  }

  if (!form.currency.trim()) {
    errors.currency = 'Выберите валюту'
    isValid = false
  }

  if (form.logoUrl && !isValidUrl(form.logoUrl)) {
    errors.logoUrl = 'Неверный формат URL'
    isValid = false
  }

  if (form.website && !isValidUrl(form.website)) {
    errors.website = 'Неверный формат URL'
    isValid = false
  }

  if (form.description && form.description.length > 300) {
    errors.description = 'Максимум 300 символов'
    isValid = false
  }

  return isValid
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = {
    show: true,
    type,
    message
  }

  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const submitForm = async () => {
  if (!validateForm()) {
    showNotification('error', 'Исправьте ошибки в форме')
    return
  }

  loading.value = true

  try {
    const { $api } = useNuxtApp()

    const dataToSend = {
      ticker: form.ticker.trim().toUpperCase(),
      fullName: form.fullName.trim(),
      description: form.description?.trim() || undefined,
      currentPrice: Number(form.currentPrice),
      currency: form.currency,
      logoUrl: form.logoUrl?.trim() || undefined,
      website: form.website?.trim() || undefined,
      blockchain: form.blockchain?.trim() || undefined,
      contractAddress: form.contractAddress?.trim() || undefined,
      category: form.category?.trim() || undefined,
      isActive: form.isActive,
      isTradable: form.isTradable
    }

    const response = await $api('/coins', {
      method: 'POST',
      body: dataToSend
    })

    showNotification('success', 'Монета создана!')
    closeModal()
    emit('coin-created', response)

  } catch (error: any) {
    console.error('Ошибка:', error)

    let errorMessage = 'Произошла ошибка'

    if (error.response?.status === 409) {
      errorMessage = 'Монета с таким тикером уже существует'
    } else if (error.response?.status === 400) {
      errorMessage = 'Неверные данные запроса'
    } else if (error.response?.status === 403) {
      errorMessage = 'Недостаточно прав'
    } else if (error.response?.status === 401) {
      errorMessage = 'Не авторизован'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    showNotification('error', errorMessage)
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  'coin-created': [coin: any]
}>()
</script>

<style scoped>
.create-coin-container {
  position: relative;
  display: inline-block;
}

/* Кнопка создания - ультра компактная */
.create-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  line-height: 1;
  min-width: 100px;
  height: 32px;
}

.create-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.create-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.2);
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-button .icon-loading {
  animation: spin 0.8s linear infinite;
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.3px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Модальное окно - ультра современное */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(6px);
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Заголовок модалки с градиентом */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 16px 16px 0 0;
}

.header-content {
  flex: 1;
}

.modal-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.close-button {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  padding: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 12px;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Компактная форма */
.coin-form {
  padding: 20px 24px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group.compact {
  display: flex;
  flex-direction: column;
}

.form-group.compact.full-width {
  grid-column: 1 / -1;
}

.compact-label {
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-hint {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.2;
}

.compact-input {
  padding: 8px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.2;
  height: 36px;
}

.compact-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.compact-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.compact-input.textarea {
  height: 72px;
  resize: none;
  line-height: 1.4;
  padding: 10px 12px;
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 14px;
  padding-right: 32px;
  cursor: pointer;
}

.price-input {
  position: relative;
}

.price-input .currency {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #64748b;
  pointer-events: none;
  font-weight: 500;
}

.char-count {
  text-align: right;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
}

.error-text {
  color: #ef4444;
  font-size: 10px;
  margin-top: 4px;
  min-height: 14px;
  font-weight: 500;
}

/* Компактные чекбоксы */
.checkbox-group {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  position: relative;
}

.checkbox input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.checkbox-text {
  font-size: 12px;
  color: #475569;
  line-height: 1.2;
  font-weight: 500;
}

/* Кнопки действий - компактные */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.cancel-button {
  padding: 8px 16px;
  background: #ffffff;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  height: 32px;
  min-width: 80px;
}

.cancel-button:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  height: 32px;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-button .loading-spinner {
  animation: spin 0.8s linear infinite;
}

/* Уведомления - компактные */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 1100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 320px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
}

.notification.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
  color: #ffffff;
}

.notification.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
  color: #ffffff;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-text {
  font-size: 12px;
  line-height: 1.2;
  font-weight: 500;
}

.notification-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: inherit;
  padding: 4px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  width: 22px;
  height: 22px;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.25);
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%) translateY(-10px);
  opacity: 0;
}

/* Стили для скролла */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>