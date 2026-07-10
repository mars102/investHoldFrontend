<template>
  <article class="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 p-4 pb-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
        {{ userInitial }}
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-900 text-sm">{{ username }}</span>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">Пост</span>
        </div>
        <div class="text-xs text-gray-400 mt-0.5">
          {{ formatRelativeTime(post.createdAt) }}
        </div>
      </div>

      <div v-if="coin" class="flex items-center gap-1.5 shrink-0">
        <div class="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
          <img v-if="coin.logoUrl" :src="coin.logoUrl" class="w-full h-full object-cover" />
          <span v-else>{{ coin.ticker.slice(0, 1) }}</span>
        </div>
        <span class="text-sm font-bold text-gray-900">{{ coin.ticker }}</span>
      </div>

      <button
        v-if="!isEditing"
        class="w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Редактировать"
        @click="isEditing = true"
      >
        <UIcon name="i-heroicons-pencil" class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Edit mode -->
    <div v-if="isEditing" class="px-4 pb-4">
      <PostEditForm :post="post" @saved="isEditing = false" @cancel="isEditing = false" @deleted="isEditing = false" />
    </div>

    <template v-else>
      <div class="px-4 pb-4">
        <h3 class="text-sm font-bold text-gray-900 mb-1">{{ post.title }}</h3>
        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ post.content }}</p>

        <div
          v-if="sortedMedia.length"
          class="mt-3 gap-1 grid"
          :class="sortedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
        >
          <div
            v-for="media in sortedMedia"
            :key="media.id"
            class="rounded-md overflow-hidden bg-gray-100"
            :class="sortedMedia.length === 1 ? 'max-h-96' : 'aspect-square'"
          >
            <video v-if="media.type === 'video'" :src="media.url" controls class="w-full h-full object-cover" />
            <img v-else :src="media.url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'
import type { Coin } from '~/types/coins'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  post: Post
  coin: Coin | undefined
}>()

const isEditing = ref(false)

const sortedMedia = computed(() => [...(props.post.media ?? [])].sort((a, b) => a.order - b.order))

const authStore = useAuthStore()
const username = computed(() => authStore.user?.username ?? 'Вы')
const userInitial = computed(() => username.value.slice(0, 1).toUpperCase())
</script>
