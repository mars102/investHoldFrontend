<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-sm font-bold text-gray-900">Активность</h3>
      <div class="flex items-center gap-3 text-[11px]">
        <span class="flex items-center gap-1.5 text-gray-500">
          <span class="w-2 h-2 rounded-sm" style="background-color: #2a78d6" />
          Сделки
        </span>
        <span class="flex items-center gap-1.5 text-gray-500">
          <span class="w-2 h-2 rounded-sm" style="background-color: #1baf7a" />
          Посты
        </span>
      </div>
    </div>
    <p class="text-xs text-gray-400 mb-4">
      В этом месяце: <span class="font-semibold text-gray-700">{{ monthTradeCount }} сделок</span> ·
      <span class="font-semibold text-gray-700">{{ monthPostCount }} постов</span>
    </p>

    <div class="flex items-end gap-[2px] h-32">
      <div
        v-for="day in days"
        :key="day.key"
        class="flex-1 h-full flex flex-col justify-end relative cursor-default"
        @mouseenter="hovered = day.key"
        @mouseleave="hovered = null"
      >
        <div
          v-if="hovered === day.key && (day.trades || day.posts)"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg z-10"
        >
          <div class="font-bold">{{ day.label }}</div>
          <div class="text-gray-300">{{ day.trades }} сделок · {{ day.posts }} постов</div>
        </div>

        <div class="w-full flex flex-col justify-end rounded-sm overflow-hidden" :style="{ height: day.totalHeight + '%' }">
          <div v-if="day.posts" class="w-full bg-[#1baf7a]" :style="{ height: day.postsShare + '%' }" />
          <div v-if="day.trades" class="w-full bg-[#2a78d6]" :style="{ height: day.tradesShare + '%' }" />
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-2 text-[10px] text-gray-400">
      <span>{{ days[0]?.axisLabel }}</span>
      <span>{{ days[Math.floor(days.length / 2)]?.axisLabel }}</span>
      <span>{{ days[days.length - 1]?.axisLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trade } from '~/types/trade'
import type { Post } from '~/types/post'

const props = defineProps<{
  trades: Trade[]
  posts: Post[]
}>()

const hovered = ref<string | null>(null)

const DAYS_WINDOW = 30

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

const days = computed(() => {
  const counts = new Map<string, { trades: number; posts: number }>()
  const today = new Date()

  const list: { key: string; date: Date }[] = []
  for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = dayKey(date)
    counts.set(key, { trades: 0, posts: 0 })
    list.push({ key, date })
  }

  for (const trade of props.trades) {
    const key = dayKey(new Date(trade.executedAt))
    const entry = counts.get(key)
    if (entry) entry.trades += 1
  }
  for (const post of props.posts) {
    const key = dayKey(new Date(post.createdAt))
    const entry = counts.get(key)
    if (entry) entry.posts += 1
  }

  const maxTotal = Math.max(...[...counts.values()].map((c) => c.trades + c.posts), 1)

  return list.map(({ key, date }) => {
    const entry = counts.get(key)!
    const total = entry.trades + entry.posts
    return {
      key,
      trades: entry.trades,
      posts: entry.posts,
      totalHeight: (total / maxTotal) * 100,
      tradesShare: total ? (entry.trades / total) * 100 : 0,
      postsShare: total ? (entry.posts / total) * 100 : 0,
      label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
      axisLabel: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
    }
  })
})

const monthTradeCount = computed(() => {
  const now = new Date()
  return props.trades.filter((t) => {
    const d = new Date(t.executedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})

const monthPostCount = computed(() => {
  const now = new Date()
  return props.posts.filter((p) => {
    const d = new Date(p.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})
</script>
