<template>
  <div class="coin-list">
    <!-- Заголовок и состояние загрузки -->
    <div v-if="pending" class="loading">
      <div class="loading-spinner"></div>
      <div>Загрузка данных о криптовалютах...</div>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div>
        <h3>Ошибка при загрузке данных</h3>
        <p>{{ errorMessage }}</p>
        <button @click="refreshData" class="retry-button">
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Таблица с данными -->
    <div v-else class="table-container">
      <div class="table-header">
        <h2>Список криптовалют</h2>
        <button @click="refreshData" class="refresh-button" :disabled="refreshing">
          {{ refreshing ? 'Обновление...' : 'Обновить' }}
        </button>
         <CreateCoinButton @coin-created="handleCoinCreated"></CreateCoinButton>
      </div>

      <div v-if="coins.length === 0" class="empty-state">
        Нет данных о криптовалютах
      </div>

      <div v-else class="table-wrapper">
        <table class="coin-table">
          <thead>
          <tr>
            <th>Ранг</th>
            <th>Логотип</th>
            <th>Тикер</th>
            <th>Название</th>
            <th>Текущая цена</th>
            <th>Изменение (24ч)</th>
            <th>Рыночная капитализация</th>
            <th>Объем (24ч)</th>
            <th>Статус</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="coin in coins" :key="coin.id">
            <td class="rank">{{ coin.rank }}</td>
            <td class="logo">
              <img
                  v-if="coin.logoUrl"
                  :src="coin.logoUrl"
                  :alt="coin.fullName"
                  width="32"
                  height="32"
                  loading="lazy"
              />
              <div v-else class="no-logo">—</div>
            </td>
            <td class="ticker">
              <strong>{{ coin.ticker }}</strong>
            </td>
            <td class="name">
              <div class="full-name">{{ coin.fullName }}</div>
              <div v-if="coin.description" class="description">
                {{ truncateDescription(coin.description) }}
              </div>
            </td>
            <td class="price">
              {{ formatPrice(coin.currentPrice) }} {{ coin.currency }}
            </td>
            <td
                :class="[
                  'change',
                  coin.priceChange24h >= 0 ? 'positive' : 'negative'
                ]"
            >
              {{ coin.priceChange24h >= 0 ? '+' : '' }}
              {{ formatPrice(coin.priceChange24h) }}
              ({{ coin.priceChangePercentage24h >= 0 ? '+' : '' }}
              {{ coin.priceChangePercentage24h }}%)
            </td>
            <td class="market-cap">
              {{ formatMarketCap(coin.marketCap) }}
            </td>
            <td class="volume">
              {{ formatVolume(coin.volume24h) }}
            </td>
            <td class="status">
                <span
                    :class="[
                    'status-badge',
                    coin.isActive && coin.isTradable ? 'active' : 'inactive'
                  ]"
                >
                  {{ coin.isActive && coin.isTradable ? 'Активна' : 'Неактивна' }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Информация о последнем обновлении -->
      <div v-if="coins.length > 0" class="last-updated">
        Последнее обновление: {{ formatLastUpdated(coins[0].priceUpdatedAt) }}
        <span class="data-count">{{ coins.length }} монет</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CreateCoinButton from "./CreateCoinButton";

// Интерфейс для типизации данных монеты
interface Coin {
  id: number
  ticker: string
  fullName: string
  description?: string
  currentPrice: number
  currency: string
  externalId: string
  logoUrl?: string
  website?: string
  blockchain: string
  contractAddress?: string
  category: string
  marketCap: number
  volume24h: number
  priceChange24h: number
  priceChangePercentage24h: number
  rank: number
  isActive: boolean
  isTradable: boolean
  createdAt: string
  updatedAt: string
  priceUpdatedAt: string
}

// Получаем API из плагина
const { $api } = useNuxtApp()

// Реактивные состояния
const coins = ref<Coin[]>([])
const pending = ref(true)
const error = ref<any>(null)
const errorMessage = ref('')
const refreshing = ref(false)

// Обработка события создания монеты
const handleCoinCreated = (coin) => {
  console.log('Монета создана:', coin)
  refreshData()
  // Здесь можно обновить список монет
  // Например, вызвать функцию загрузки данных или emit событие
}
// Функция для загрузки данных
const loadCoins = async () => {
  pending.value = true
  error.value = null
  errorMessage.value = ''

  try {
    // Используем $api из плагина для запроса
    const response = await $api('/coins')

    // Обрабатываем ответ в зависимости от формата API
    // Предполагаем, что API возвращает либо массив Coin[], либо { data: Coin[], ... }
    if (Array.isArray(response)) {
      coins.value = response
    } else if (response && response.data && Array.isArray(response.data)) {
      coins.value = response.data
    } else if (response && response.items && Array.isArray(response.items)) {
      coins.value = response.items
    } else {
      console.warn('Неожиданный формат ответа API:', response)
      coins.value = []
    }
  } catch (err: any) {
    error.value = err
    errorMessage.value = err.message || 'Произошла ошибка при загрузке данных'
    console.error('Ошибка загрузки данных:', err)
  } finally {
    pending.value = false
  }
}

// Функция для обновления данных
const refreshData = async () => {
  if (refreshing.value) return

  refreshing.value = true
  await loadCoins()
  refreshing.value = false
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadCoins()
})

// Вспомогательные функции форматирования
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)} трлн`
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)} млрд`
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)} млн`
  }
  return formatPrice(marketCap)
}

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)} млрд`
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)} млн`
  }
  return formatPrice(volume)
}

const truncateDescription = (description: string, maxLength: number = 50): string => {
  if (!description) return ''
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength) + '...'
}

const formatLastUpdated = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return 'Неизвестно'
  }
}
</script>

<style scoped>
.coin-list {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  font-size: 16px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 12px;
  border: 1px solid #ffcdd2;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.error p {
  margin: 0 0 20px 0;
  color: #666;
}

.retry-button {
  padding: 10px 24px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #5a67d8;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.refresh-button {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.3);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

.table-wrapper {
  overflow-x: auto;
}

.coin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.coin-table thead {
  background-color: #f8f9fa;
}

.coin-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coin-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.coin-table tbody tr:hover {
  background-color: #f8f9fa;
}

.coin-table td {
  padding: 16px 12px;
  vertical-align: middle;
}

.rank {
  font-weight: 600;
  color: #6c757d;
  text-align: center;
  width: 60px;
}

.logo {
  text-align: center;
  width: 70px;
}

.logo img {
  border-radius: 50%;
  object-fit: cover;
}

.no-logo {
  color: #adb5bd;
  font-size: 14px;
}

.ticker {
  font-weight: 600;
  color: #212529;
  width: 80px;
}

.name {
  max-width: 250px;
  min-width: 200px;
}

.full-name {
  font-weight: 500;
  color: #212529;
  margin-bottom: 4px;
}

.description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.price {
  font-weight: 600;
  color: #212529;
  width: 120px;
}

.change {
  font-weight: 600;
  width: 150px;
}

.change.positive {
  color: #10b981;
}

.change.negative {
  color: #ef4444;
}

.market-cap, .volume {
  font-weight: 500;
  color: #495057;
  width: 140px;
}

.status {
  width: 100px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.last-updated {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  color: #6c757d;
  font-size: 14px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.data-count {
  font-weight: 600;
  color: #495057;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .coin-list {
    padding: 10px;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .table-header h2 {
    font-size: 20px;
  }
}
</style>