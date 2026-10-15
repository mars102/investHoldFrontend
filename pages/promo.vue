<template>
  <div class="promo min-h-screen bg-[#070b14] text-gray-100 overflow-x-hidden">
    <!-- Background glow -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="glow glow-gold"></div>
      <div class="glow glow-teal"></div>
      <div class="grid-bg"></div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/70 border-b border-white/5">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/promo" class="flex items-center gap-2">
          <img src="/images/logo.png" alt="InvestHold" class="h-9 w-auto" />
          <span class="text-xl font-black tracking-tight">
            <span class="text-[#ffc865]">Invest</span><span class="text-[#3fb8d6]">Hold</span>
          </span>
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" class="hover:text-white transition-colors">Возможности</a>
          <a href="#how" class="hover:text-white transition-colors">Как это работает</a>
          <a href="#honest" class="hover:text-white transition-colors">Честно о нас</a>
          <a href="#faq" class="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div class="flex items-center gap-2">
          <NuxtLink
            v-if="!isAuthenticated"
            to="/login"
            class="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Войти
          </NuxtLink>
          <NuxtLink :to="ctaLink" class="cta-btn px-4 py-2 text-sm">
            {{ ctaShort }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
      <div class="grid lg:grid-cols-2 gap-14 items-center">
        <div class="reveal">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ffc865]/30 bg-[#ffc865]/10 text-[#ffc865] text-xs font-semibold mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ffc865] animate-pulse"></span>
            Менеджер криптопортфеля
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
            Перестаньте гадать,<br />
            <span class="hero-gradient">сколько вы заработали</span>
          </h1>
          <p class="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
            InvestHold собирает все ваши сделки с разных бирж в один портфель, считает среднюю цену,
            реальный P&amp;L и показывает, где вы рискуете. Без таблиц, формул и самообмана.
          </p>
          <div class="mt-9 flex flex-col sm:flex-row gap-3">
            <NuxtLink :to="ctaLink" class="cta-btn cta-big px-7 py-4 text-base">
              {{ ctaLong }}
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
            </NuxtLink>
            <a href="#features" class="ghost-btn px-7 py-4 text-base">
              Что умеет сервис
            </a>
          </div>
          <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-400" />Регистрация за минуту</span>
            <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-400" />Не нужны API-ключи</span>
            <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-400" />Доступ к средствам не нужен</span>
          </div>
        </div>

        <!-- Hero mockup -->
        <div class="reveal relative" style="--delay: 150ms">
          <div class="mockup">
            <div class="flex items-center justify-between mb-5">
              <div>
                <div class="text-xs text-gray-500 uppercase tracking-wider">Баланс портфеля</div>
                <div class="text-3xl font-black tabular-nums mt-1">$ {{ animatedBalance }}</div>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-bold tabular-nums">
                +24.8%
              </div>
            </div>

            <svg viewBox="0 0 400 120" class="w-full h-28" preserveAspectRatio="none">
              <defs>
                <linearGradient id="promoArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#ffc865" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#ffc865" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="chartArea" fill="url(#promoArea)" />
              <path :d="chartLine" fill="none" stroke="#ffc865" stroke-width="2.5" stroke-linecap="round" class="chart-line" />
            </svg>

            <div class="mt-5 space-y-2.5">
              <div
                v-for="coin in mockCoins"
                :key="coin.symbol"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-gray-900" :style="{ background: coin.color }">
                    {{ coin.symbol[0] }}
                  </div>
                  <div>
                    <div class="text-sm font-bold">{{ coin.symbol }}</div>
                    <div class="text-[11px] text-gray-500">ср. цена {{ coin.avg }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold tabular-nums">{{ coin.value }}</div>
                  <div class="text-[11px] font-bold tabular-nums" :class="coin.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ coin.pnl > 0 ? '+' : '' }}{{ coin.pnl }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating cards -->
          <div class="float-card float-a hidden sm:flex">
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-[#3fb8d6]" />
            <div>
              <div class="text-[10px] text-gray-500">Риск-профиль</div>
              <div class="text-xs font-bold">Умеренный · HHI 2840</div>
            </div>
          </div>
          <div class="float-card float-b hidden sm:flex">
            <UIcon name="i-heroicons-bell-alert" class="w-5 h-5 text-[#ffc865]" />
            <div>
              <div class="text-[10px] text-gray-500">Уведомление</div>
              <div class="text-xs font-bold">SOL +12% за сутки</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pain points strip -->
    <section class="border-y border-white/5 bg-white/[0.02]">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div v-for="s in stats" :key="s.label" class="reveal">
          <div class="text-3xl sm:text-4xl font-black hero-gradient">{{ s.value }}</div>
          <div class="mt-1 text-sm text-gray-400">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="max-w-6xl mx-auto px-4 sm:px-6 py-24 scroll-mt-16">
      <div class="reveal text-center max-w-2xl mx-auto">
        <div class="section-tag">Возможности</div>
        <h2 class="section-title">Всё, что нужно инвестору,<br class="hidden sm:block" /> в одном окне</h2>
        <p class="mt-4 text-gray-400">
          Мы сделали инструмент, которым сами пользуемся каждый день. Никакой лишней мишуры — только то, что помогает принимать решения.
        </p>
      </div>

      <div class="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          class="reveal feature-card"
          :style="{ '--delay': `${(i % 3) * 80}ms`, '--accent': f.color }"
        >
          <div class="feature-icon">
            <UIcon :name="f.icon" class="w-6 h-6" />
          </div>
          <h3 class="mt-5 text-lg font-bold">{{ f.title }}</h3>
          <p class="mt-2 text-sm text-gray-400 leading-relaxed">{{ f.text }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="relative py-24 scroll-mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="reveal text-center max-w-2xl mx-auto">
          <div class="section-tag">Как это работает</div>
          <h2 class="section-title">Три шага до полной картины</h2>
        </div>

        <div class="mt-14 grid md:grid-cols-3 gap-6 relative">
          <div class="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#ffc865]/0 via-[#ffc865]/40 to-[#3fb8d6]/0"></div>
          <div
            v-for="(step, i) in steps"
            :key="step.title"
            class="reveal relative text-center"
            :style="{ '--delay': `${i * 120}ms` }"
          >
            <div class="step-num">{{ i + 1 }}</div>
            <h3 class="mt-6 text-lg font-bold">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Honest pros / cons -->
    <section id="honest" class="max-w-6xl mx-auto px-4 sm:px-6 py-24 scroll-mt-16">
      <div class="reveal text-center max-w-2xl mx-auto">
        <div class="section-tag">Честно о нас</div>
        <h2 class="section-title">Плюсы и минусы — без маркетинга</h2>
        <p class="mt-4 text-gray-400">
          Мы не идеальны и не будем притворяться. Вот что мы делаем отлично, а над чем ещё работаем.
        </p>
      </div>

      <div class="mt-14 grid lg:grid-cols-2 gap-6">
        <div class="reveal honest-card border-emerald-500/20">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <UIcon name="i-heroicons-hand-thumb-up" class="w-5 h-5 text-emerald-400" />
            </div>
            <h3 class="text-xl font-bold">Плюсы</h3>
          </div>
          <ul class="space-y-4">
            <li v-for="p in pros" :key="p.title" class="flex gap-3">
              <UIcon name="i-heroicons-check-circle-solid" class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div class="font-semibold">{{ p.title }}</div>
                <div class="text-sm text-gray-400 mt-0.5">{{ p.text }}</div>
              </div>
            </li>
          </ul>
        </div>

        <div class="reveal honest-card border-amber-500/20" style="--delay: 120ms">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <UIcon name="i-heroicons-wrench-screwdriver" class="w-5 h-5 text-amber-400" />
            </div>
            <h3 class="text-xl font-bold">Минусы <span class="text-sm font-medium text-gray-500">(пока)</span></h3>
          </div>
          <ul class="space-y-4">
            <li v-for="c in cons" :key="c.title" class="flex gap-3">
              <UIcon name="i-heroicons-minus-circle-solid" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div class="font-semibold">{{ c.title }}</div>
                <div class="text-sm text-gray-400 mt-0.5">{{ c.text }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Comparison -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
      <div class="reveal text-center">
        <h2 class="section-title">InvestHold vs таблица в Excel</h2>
      </div>
      <div class="reveal mt-10 overflow-x-auto rounded-2xl border border-white/10">
        <table class="w-full text-sm min-w-[480px]">
          <thead>
            <tr class="bg-white/[0.04] text-gray-400">
              <th class="text-left font-semibold px-5 py-4"></th>
              <th class="font-bold px-5 py-4 text-[#ffc865]">InvestHold</th>
              <th class="font-semibold px-5 py-4">Excel / заметки</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparison" :key="row.label" class="border-t border-white/5">
              <td class="px-5 py-3.5 text-gray-300">{{ row.label }}</td>
              <td class="px-5 py-3.5 text-center">
                <UIcon name="i-heroicons-check-circle-solid" class="w-5 h-5 text-emerald-400 inline-block" />
              </td>
              <td class="px-5 py-3.5 text-center">
                <UIcon
                  :name="row.excel ? 'i-heroicons-check-circle-solid' : 'i-heroicons-x-circle'"
                  class="w-5 h-5 inline-block"
                  :class="row.excel ? 'text-gray-500' : 'text-rose-400/70'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="max-w-3xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-16">
      <div class="reveal text-center">
        <div class="section-tag">FAQ</div>
        <h2 class="section-title">Частые вопросы</h2>
      </div>
      <div class="mt-10 space-y-3">
        <div
          v-for="(q, i) in faq"
          :key="q.q"
          class="reveal rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
          <button
            class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold hover:bg-white/[0.03] transition-colors"
            @click="openFaq = openFaq === i ? null : i"
          >
            {{ q.q }}
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': openFaq === i }"
            />
          </button>
          <div class="faq-body" :class="{ open: openFaq === i }">
            <div class="overflow-hidden">
              <p class="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{{ q.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="px-4 sm:px-6 pb-24">
      <div class="reveal final-cta max-w-5xl mx-auto text-center">
        <h2 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Ваш портфель заслуживает<br />
          <span class="hero-gradient">большего, чем таблица</span>
        </h2>
        <p class="mt-5 text-gray-300 max-w-xl mx-auto">
          Зарегистрируйтесь, добавьте первую сделку и через пару минут увидите свой портфель так, как никогда раньше.
        </p>
        <NuxtLink :to="ctaLink" class="cta-btn cta-big mt-9 px-9 py-4 text-lg">
          {{ ctaLong }}
          <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5" />
        </NuxtLink>
        <p v-if="!isAuthenticated" class="mt-4 text-sm text-gray-500">
          Уже есть аккаунт? <NuxtLink to="/login" class="text-[#3fb8d6] hover:underline">Войти</NuxtLink>
        </p>
      </div>
    </section>

    <footer class="border-t border-white/5 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <img src="/images/logo.png" alt="" class="h-6 w-auto opacity-70" />
          <span>© {{ year }} InvestHold</span>
        </div>
        <span>Не является инвестиционной рекомендацией.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({ title: 'InvestHold — менеджер криптопортфеля' })

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const ctaLink = computed(() => (isAuthenticated.value ? '/' : '/register'))
const ctaShort = computed(() => (isAuthenticated.value ? 'В портфель' : 'Регистрация'))
const ctaLong = computed(() => (isAuthenticated.value ? 'Открыть мой портфель' : 'Создать аккаунт'))

const year = new Date().getFullYear()
const openFaq = ref<number | null>(0)

// Hero chart
const chartPoints = [70, 78, 65, 72, 60, 64, 50, 56, 42, 48, 36, 40, 28, 33, 20]
const chartLine = computed(() => {
  const step = 400 / (chartPoints.length - 1)
  return chartPoints.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y}`).join(' ')
})
const chartArea = computed(() => `${chartLine.value} L400,120 L0,120 Z`)

const mockCoins = [
  { symbol: 'BTC', avg: '$58 420', value: '$ 8 214', pnl: 31.2, color: '#f7931a' },
  { symbol: 'ETH', avg: '$2 910', value: '$ 3 902', pnl: 14.6, color: '#8ea2ff' },
  { symbol: 'SOL', avg: '$168', value: '$ 1 140', pnl: -4.3, color: '#3fd6b0' },
]

// Animated balance counter
const targetBalance = 13256.4
const balance = ref(0)
const animatedBalance = computed(() =>
  balance.value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
)

const stats = [
  { value: '1 мин', label: 'на регистрацию' },
  { value: '0', label: 'API-ключей и доступа к бирже' },
  { value: '10+', label: 'метрик аналитики' },
  { value: '24/7', label: 'контроль цен' },
]

const features = [
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Портфель с реальным P&L',
    text: 'Средняя цена покупки, вложено, текущая стоимость и прибыль по каждой монете и по всему портфелю.',
    color: '#ffc865',
  },
  {
    icon: 'i-heroicons-chart-pie',
    title: 'Глубокая аналитика',
    text: 'Распределение активов, лучшая и худшая сделка, средний P&L, активность по биржам и периодам.',
    color: '#a78bfa',
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Риск-профиль',
    text: 'Индекс концентрации HHI показывает, не сложили ли вы все яйца в одну корзину.',
    color: '#3fb8d6',
  },
  {
    icon: 'i-heroicons-clock',
    title: 'Оценка тайминга',
    text: 'Узнайте, насколько удачно вы входите и выходите из позиций. Цифры не врут — в отличие от памяти.',
    color: '#34d399',
  },
  {
    icon: 'i-heroicons-chat-bubble-left-right',
    title: 'Дневник трейдера',
    text: 'Записывайте мысли к каждой сделке, прикладывайте скриншоты и ведите ленту своих решений.',
    color: '#f472b6',
  },
  {
    icon: 'i-heroicons-bell-alert',
    title: 'Watchlist и уведомления',
    text: 'Следите за интересными монетами и получайте уведомления о резких изменениях цены.',
    color: '#fb923c',
  },
  {
    icon: 'i-heroicons-presentation-chart-line',
    title: 'Графики с линиями тренда',
    text: 'Рисуйте линии тренда прямо на графике монеты и смотрите баланс по ней во времени.',
    color: '#60a5fa',
  },
  {
    icon: 'i-heroicons-photo',
    title: 'Красивые карточки для шеринга',
    text: 'Поделитесь удачной сделкой картинкой в один клик — друзьям или в свой канал.',
    color: '#facc15',
  },
  {
    icon: 'i-heroicons-arrow-down-tray',
    title: 'Ваши данные — ваши',
    text: 'Экспорт всех сделок в CSV в любой момент. Скрытие баланса одной кнопкой, тёмная тема.',
    color: '#94a3b8',
  },
]

const steps = [
  { title: 'Создайте аккаунт', text: 'Email и пароль — больше ничего. Никаких API-ключей и верификаций.' },
  { title: 'Добавьте сделки', text: 'Монета, количество, цена, биржа. Можно сразу записать, почему вы её совершили.' },
  { title: 'Смотрите аналитику', text: 'Портфель, P&L, риск и тайминг посчитаются автоматически.' },
]

const pros = [
  { title: 'Безопасно по определению', text: 'Мы не просим API-ключи и не имеем доступа к вашим средствам. Взламывать нечего.' },
  { title: 'Все биржи в одном месте', text: 'Отмечайте биржу у каждой сделки и смотрите, где вы торгуете активнее всего.' },
  { title: 'Аналитика, которой нет у бирж', text: 'Тайминг сделок, риск-профиль, лучшие и худшие решения — биржи такого не покажут.' },
  { title: 'Дневник решений', text: 'Мысли к сделкам помогают учиться на своих ошибках, а не повторять их.' },
  { title: 'Быстро и без лишнего', text: 'Чистый интерфейс, тёмная тема, адаптив под телефон.' },
]

const cons = [
  { title: 'Сделки вносятся вручную', text: 'Автоматического импорта с бирж пока нет. Зато вы полностью контролируете данные.' },
  { title: 'Только криптовалюта', text: 'Акции, облигации и фиат пока не поддерживаются.' },
  { title: 'Нет нативного приложения', text: 'Работаем в браузере — на телефоне тоже удобно, но в App Store нас пока нет.' },
  { title: 'Нет налоговых отчётов', text: 'Экспорт в CSV есть, но готовой декларации мы не формируем.' },
  { title: 'Мы — молодой проект', text: 'Некоторые функции ещё шлифуются. Зато мы слышим каждого пользователя.' },
]

const comparison = [
  { label: 'Средняя цена и P&L считаются сами', excel: false },
  { label: 'Актуальные цены монет', excel: false },
  { label: 'Риск-профиль портфеля', excel: false },
  { label: 'Оценка тайминга сделок', excel: false },
  { label: 'Уведомления о цене', excel: false },
  { label: 'Заметки к сделкам', excel: true },
  { label: 'Экспорт в CSV', excel: true },
]

const faq = [
  {
    q: 'Нужно ли подключать биржу или давать API-ключи?',
    a: 'Нет. Вы вносите сделки сами, поэтому сервису не нужен никакой доступ к вашим аккаунтам и средствам.',
  },
  {
    q: 'Можно ли через InvestHold покупать и продавать крипту?',
    a: 'Нет, InvestHold — это трекер и аналитика. Сами сделки вы совершаете на своей бирже, а здесь ведёте учёт.',
  },
  {
    q: 'Какие биржи поддерживаются?',
    a: 'Любые. Биржа указывается у сделки как метка, поэтому вы можете вести учёт хоть по десятку площадок и кошельков.',
  },
  {
    q: 'Можно ли выгрузить свои данные?',
    a: 'Да, все сделки экспортируются в CSV в один клик — откройте в Excel или перенесите куда угодно.',
  },
  {
    q: 'Работает ли сервис на телефоне?',
    a: 'Да, интерфейс полностью адаптирован под мобильные устройства и открывается в любом браузере.',
  },
]

onMounted(() => {
  // Balance count-up
  const start = performance.now()
  const duration = 1600
  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    balance.value = targetBalance * (1 - Math.pow(1 - t, 3))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  // Scroll reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.promo .reveal').forEach((el) => observer.observe(el))
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<style scoped>
.promo {
  scroll-behavior: smooth;
}

/* Background */
.glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  opacity: 0.35;
}
.glow-gold {
  width: 520px;
  height: 520px;
  top: -160px;
  right: -120px;
  background: #ffc865;
  animation: drift 18s ease-in-out infinite;
}
.glow-teal {
  width: 600px;
  height: 600px;
  top: 40%;
  left: -260px;
  background: #1c667d;
  animation: drift 22s ease-in-out infinite reverse;
}
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%);
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-60px, 40px); }
}

/* Text */
.hero-gradient {
  background: linear-gradient(120deg, #ffc865 0%, #ff9f43 40%, #3fb8d6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc865;
  margin-bottom: 12px;
}
.section-title {
  font-size: clamp(1.875rem, 4vw, 2.75rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Buttons */
.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  color: #111827;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffd88a 0%, #ffc865 45%, #ff9f43 100%);
  box-shadow: 0 8px 24px -8px rgba(255, 180, 70, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px -8px rgba(255, 180, 70, 0.75);
}
.cta-big {
  position: relative;
  overflow: hidden;
}
.cta-big::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: shine 3.5s ease-in-out infinite;
}
@keyframes shine {
  0%, 60% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
  transition: background 0.2s, border-color 0.2s;
}
.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Hero mockup */
.mockup {
  position: relative;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 200, 101, 0.05);
  backdrop-filter: blur(16px);
  transform: perspective(1200px) rotateY(-6deg) rotateX(3deg);
  transition: transform 0.6s;
}
.mockup:hover {
  transform: perspective(1200px) rotateY(0) rotateX(0);
}
.chart-line {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: draw 2s 0.3s ease-out forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
.float-card {
  position: absolute;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(15, 20, 32, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}
.float-a {
  top: -18px;
  left: -28px;
  animation: bob 5s ease-in-out infinite;
}
.float-b {
  bottom: 40px;
  right: -24px;
  animation: bob 6s ease-in-out infinite 1s;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Features */
.feature-card {
  position: relative;
  padding: 28px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: transform 0.3s, border-color 0.3s, background 0.3s;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}
.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  box-shadow: 0 0 24px -6px var(--accent);
}

/* Steps */
.step-num {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 900;
  color: #ffc865;
  background: #0d1320;
  border: 1px solid rgba(255, 200, 101, 0.3);
  box-shadow: 0 0 40px -10px rgba(255, 200, 101, 0.5);
}

/* Pros / cons */
.honest-card {
  padding: 32px;
  border-radius: 24px;
  border-width: 1px;
  background: rgba(255, 255, 255, 0.025);
}

/* FAQ */
.faq-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.faq-body.open {
  grid-template-rows: 1fr;
}

/* Final CTA */
.final-cta {
  position: relative;
  padding: 72px 24px;
  border-radius: 32px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255, 200, 101, 0.25), transparent 60%),
    radial-gradient(ellipse at 90% 100%, rgba(28, 102, 125, 0.5), transparent 60%),
    #0d1320;
  border: 1px solid rgba(255, 200, 101, 0.2);
}

/* Reveal on scroll */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  transition-delay: var(--delay, 0ms);
}
.reveal.visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .glow, .float-card, .cta-big::after, .chart-line { animation: none; }
  .chart-line { stroke-dashoffset: 0; }
}
</style>
