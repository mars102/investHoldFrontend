<template>
  <div class="coin-list">
    <!-- Ультракомпактная панель управления -->
    <div class="control-panel">
      <div class="panel-left">
        <h1 class="gradient-title">Криптопортфель</h1>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-value">{{ coins.length }}</span>
            <span class="stat-label">монет</span>
          </span>
          <span class="stat-divider">•</span>
          <span class="stat-item">
            <span class="stat-value">{{ totalMarketCap }}</span>
            <span class="stat-label">капитализация</span>
          </span>
        </div>
      </div>
      <div class="panel-right">
        <button
            @click="forceReset"
            class="reset-btn"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Сбросить</span>
        </button>
        <button
            @click="refreshData"
            class="refresh-btn"
            :class="{ 'refreshing': refreshing }"
            :disabled="refreshing"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 7L7 4L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 10V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ refreshing ? '...' : 'Обновить' }}</span>
        </button>
        <CreateCoinButton @coin-created="handleCoinCreated"></CreateCoinButton>
      </div>
    </div>

    <!-- Загрузка данных - компактный индикатор -->
    <div v-if="pending" class="compact-loading">
      <div class="loading-pulse">
        <div class="pulse-dot" style="animation-delay: 0s"></div>
        <div class="pulse-dot" style="animation-delay: 0.2s"></div>
        <div class="pulse-dot" style="animation-delay: 0.4s"></div>
      </div>
      <span class="loading-text">Загрузка данных...</span>
    </div>

    <!-- Сообщение об ошибке - компактное -->
    <div v-else-if="error" class="compact-error">
      <div class="error-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="error-content">
        <div class="error-title">Ошибка загрузки</div>
        <div class="error-message">{{ errorMessage }}</div>
      </div>
      <button @click="refreshData" class="error-retry">Повторить</button>
    </div>

    <!-- Таблица - ультракомпактный дизайн -->
    <div v-else class="table-wrapper">
      <div v-if="coins.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-text">Нет данных о криптовалютах</div>
      </div>

      <div v-else class="compact-table-container">
        <div class="table-scroll">
          <table class="compact-table">
            <thead>
            <tr>
              <th class="rank">#</th>
              <th class="logo"> </th>
              <th class="ticker">Тикер</th>
              <th class="name">Название</th>
              <th class="price">Цена</th>
              <th class="change">24ч</th>
              <th class="market-cap">Капитализация</th>
              <th class="status">Статус</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="coin in coins"
                :key="coin.id"
                @click="handleCoinClick(coin)"
                class="table-row"
            >
              <td class="rank-cell">
                <div class="rank-badge">{{ coin.rank || '—' }}</div>
              </td>
              <td class="logo-cell">
                <div class="logo-wrapper">
                  <img
                      v-if="coin.logoUrl"
                      :src="coin.logoUrl"
                      :alt="coin.fullName"
                      loading="lazy"
                      @error="handleImageError"
                  />
                  <div v-else class="logo-placeholder">
                    {{ coin.ticker.substring(0, 2) }}
                  </div>
                </div>
              </td>
              <td class="ticker-cell">
                <div class="ticker-wrapper">
                  <span class="ticker-symbol">{{ coin.ticker }}</span>
                </div>
              </td>
              <td class="name-cell">
                <div class="name-wrapper">
                  <div class="full-name">{{ coin.fullName }}</div>
                  <div v-if="coin.blockchain" class="blockchain">
                    {{ coin.blockchain }}
                  </div>
                </div>
              </td>
              <td class="price-cell">
                <div class="price-wrapper">
                  <div class="price-amount">
                    {{ formatPrice(coin.currentPrice) }}
                  </div>
                  <div class="price-currency">{{ coin.currency }}</div>
                </div>
              </td>
              <td class="change-cell">
                <div
                    v-if="coin.priceChangePercentage24h !== null"
                    :class="[
                      'change-indicator',
                      coin.priceChangePercentage24h >= 0 ? 'positive' : 'negative'
                    ]"
                >
                  <svg
                      v-if="coin.priceChangePercentage24h >= 0"
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                  >
                    <path d="M5 1V9M9 5L5 9L1 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg
                      v-else
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                  >
                    <path d="M5 9V1M1 5L5 1L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="change-value">
                    {{ coin.priceChangePercentage24h >= 0 ? '+' : '' }}
                    {{ coin.priceChangePercentage24h.toFixed(2) }}%
                  </span>
                </div>
                <div v-else class="change-indicator neutral">
                  —
                </div>
              </td>
              <td class="market-cap-cell">
                <div class="market-cap-wrapper">
                  {{ formatMarketCap(coin.marketCap) }}
                </div>
              </td>
              <td class="status-cell">
                <div
                    :class="[
                      'status-badge',
                      coin.isActive && coin.isTradable ? 'active' : 'inactive'
                    ]"
                >
                  <div class="status-dot"></div>
                  {{ coin.isActive && coin.isTradable ? 'Активна' : 'Неактивна' }}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Компактная информация внизу -->
        <div class="table-footer">
          <div class="update-info">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V3M6 9V11M11 6H9M3 6H1M9.24264 9.24264L7.82843 7.82843M2.17157 4.17157L0.757359 2.75736M9.24264 2.75736L7.82843 4.17157M2.17157 7.82843L0.757359 9.24264" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <template v-if="coins[0]?.priceUpdatedAt">
              Обновлено {{ formatLastUpdated(coins[0].priceUpdatedAt) }}
            </template>
            <template v-else>
              Данные не обновлялись
            </template>
          </div>
          <div class="table-stats">
            <span class="stat">
              <span class="stat-number">{{ coins.length }}</span>
              <span class="stat-label">монет</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CreateCoinButton from "./CreateCoinButton";

// Интерфейс для типизации данных монеты
interface Coin {
  id: number
  ticker: string
  fullName: string
  description?: string
  currentPrice: number
  currency: string
  externalId: string | null
  logoUrl?: string
  website?: string
  blockchain: string
  contractAddress?: string
  category: string
  marketCap: number | null
  volume24h: number | null
  priceChange24h: number | null
  priceChangePercentage24h: number | null
  rank: number | null
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
}

// Вычисляемая общая капитализация
const totalMarketCap = computed(() => {
  if (!coins.value.length) return '0'
  const total = coins.value.reduce((sum, coin) => sum + (coin.marketCap || 0), 0)
  return formatMarketCap(total)
})

// Функция для загрузки данных
const loadCoins = async () => {
  pending.value = true
  error.value = null
  errorMessage.value = ''

  try {
    // Используем реальный API
    const response = await $api('/coins')
    console.log('Ответ API получен:', response) // Для отладки

    // Обрабатываем ответ в зависимости от формата API
    if (Array.isArray(response)) {
      // Преобразуем строковые числа в числа и обрабатываем null значения
      coins.value = response.map(coin => ({
        ...coin,
        currentPrice: parseFloat(coin.currentPrice) || 0,
        marketCap: coin.marketCap ? parseFloat(coin.marketCap) : null,
        volume24h: coin.volume24h ? parseFloat(coin.volume24h) : null,
        priceChange24h: coin.priceChange24h ? parseFloat(coin.priceChange24h) : null,
        priceChangePercentage24h: coin.priceChangePercentage24h ? parseFloat(coin.priceChangePercentage24h) : null,
        rank: coin.rank || null
      }))
      console.log('Данные обработаны:', coins.value)
    } else if (response && response.data && Array.isArray(response.data)) {
      coins.value = response.data.map(coin => ({
        ...coin,
        currentPrice: parseFloat(coin.currentPrice) || 0,
        marketCap: coin.marketCap ? parseFloat(coin.marketCap) : null,
        priceChangePercentage24h: coin.priceChangePercentage24h ? parseFloat(coin.priceChangePercentage24h) : null,
        rank: coin.rank || null
      }))
    } else {
      console.warn('Неожиданный формат ответа API:', response)
      coins.value = []
      errorMessage.value = 'Неправильный формат данных от сервера'
    }

  } catch (err: any) {
    error.value = err
    errorMessage.value = err.message || 'Произошла ошибка при загрузке данных'
    console.error('Ошибка загрузки данных:', err)
    coins.value = [] // Сбрасываем данные при ошибке
  } finally {
    console.log('Загрузка завершена, pending установлен в false')
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

// Обработка клика по монете
const handleCoinClick = (coin: Coin) => {
  console.log('Выбрана монета:', coin)
  // Здесь можно добавить навигацию к деталям монеты
}

// Обработка ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  target.parentElement?.querySelector('.logo-placeholder')?.classList.remove('hidden')
}

// Функция принудительного сброса состояния
const forceReset = () => {
  pending.value = false
  refreshing.value = false
  coins.value = []
  error.value = null
  errorMessage.value = 'Состояние сброшено'

  // Через 2 секунды пробуем загрузить снова
  setTimeout(() => {
    loadCoins()
  }, 2000)
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  console.log('Компонент смонтирован, начинаем загрузку данных')
  loadCoins()
})

// Вспомогательные функции форматирования
const formatPrice = (price: number): string => {
  if (!price && price !== 0) return '—'

  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)}M`
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(2)}K`
  }
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatMarketCap = (marketCap: number): string => {
  if (!marketCap && marketCap !== 0) return '—'

  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`
  }
  return formatPrice(marketCap)
}

const formatLastUpdated = (dateString?: string): string => {
  if (!dateString) return 'неизвестно'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)

    if (diffMinutes < 1) return 'только что'
    if (diffMinutes < 60) return `${diffMinutes} мин назад`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} ч назад`

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return 'неизвестно'
  }
}
</script>

<style scoped>
.change-indicator.neutral {
  background: #f1f5f9;
  color: #64748b;
}
.coin-list {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
}

/* Ультракомпактная панель управления */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.panel-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gradient-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  color: #cbd5e1;
  font-size: 12px;
}

.panel-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  min-width: 90px;
  height: 32px;
}

.reset-btn:hover {
  background: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  min-width: 90px;
  height: 32px;
}

.refresh-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
}

.refresh-btn.refreshing {
  opacity: 0.8;
  cursor: not-allowed;
}

.refresh-btn.refreshing svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Компактная загрузка */
.compact-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-pulse {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Компактная ошибка */
.compact-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 12px;
  border: 1px solid #fca5a5;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  color: #dc2626;
}

.error-content {
  flex: 1;
  margin: 0 16px;
}

.error-title {
  font-size: 13px;
  font-weight: 700;
  color: #7f1d1d;
  margin-bottom: 2px;
}

.error-message {
  font-size: 11px;
  color: #991b1b;
  opacity: 0.8;
}

.error-retry {
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  height: 32px;
}

.error-retry:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Ультракомпактная таблица */
.table-wrapper {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.compact-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.compact-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.compact-table thead {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.compact-table th {
  padding: 14px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.compact-table th.rank { width: 60px; padding-left: 20px; }
.compact-table th.logo { width: 50px; text-align: center; }
.compact-table th.ticker { width: 80px; }
.compact-table th.name { min-width: 160px; }
.compact-table th.price { width: 100px; }
.compact-table th.change { width: 90px; }
.compact-table th.market-cap { width: 120px; }
.compact-table th.status { width: 100px; padding-right: 20px; }

.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateX(2px);
}

.table-row:last-child {
  border-bottom: none;
}

.compact-table td {
  padding: 12px;
  vertical-align: middle;
}

/* Стили ячеек */
.rank-cell {
  padding-left: 20px !important;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.logo-cell {
  text-align: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.logo-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.logo-placeholder {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.ticker-wrapper {
  display: flex;
  align-items: center;
}

.ticker-symbol {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.full-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  line-height: 1.2;
}

.blockchain {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.price-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-amount {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.price-currency {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-cell {
  text-align: center;
}

.change-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.change-indicator.positive {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.change-indicator.negative {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.change-indicator svg {
  flex-shrink: 0;
}

.market-cap-wrapper {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
}

.status-cell {
  padding-right: 20px !important;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  line-height: 1;
}

.status-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Компактный футер таблицы */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #e2e8f0;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.table-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-number {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .coin-list {
    padding: 12px;
  }

  .control-panel {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .panel-left {
    align-items: center;
    text-align: center;
  }

  .panel-right {
    width: 100%;
    justify-content: center;
  }

  .reset-btn,
  .refresh-btn,
  .error-retry {
    min-width: 80px;
    font-size: 11px;
  }

  .compact-table th {
    padding: 10px 8px;
    font-size: 10px;
  }

  .compact-table td {
    padding: 10px 8px;
  }

  .table-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

/* Темная тема (опционально) */
@media (prefers-color-scheme: dark) {
  .coin-list {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .control-panel,
  .table-wrapper {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border-color: rgba(100, 116, 139, 0.2);
  }

  .ticker-symbol,
  .price-amount {
    color: #f1f5f9;
  }

  .full-name {
    color: #cbd5e1;
  }

  .rank-badge {
    background: rgba(100, 116, 139, 0.2);
    color: #cbd5e1;
  }
}
</style>