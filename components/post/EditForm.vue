<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm font-bold text-gray-900">Редактирование поста</p>
      <button class="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" @click="$emit('cancel')">
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </button>
    </div>

    <UInput v-model="form.title" placeholder="Заголовок" class="mb-2" />
    <UTextarea v-model="form.content" placeholder="Текст поста..." autoresize :rows="3" class="mb-2" />
    <USelect v-model="form.coinId" :options="coinOptions" placeholder="Без привязки к монете" class="mb-3" />

    <!-- Existing media -->
    <div v-if="existingMedia.length" class="mb-1">
      <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Файлы</label>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="media in existingMedia"
          :key="media.id"
          class="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200"
        >
          <video v-if="media.type === 'video'" :src="media.url" class="w-full h-full object-cover" muted />
          <img v-else :src="media.url" class="w-full h-full object-cover" />
          <button
            type="button"
            class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-50"
            title="Удалить файл"
            :disabled="removingMediaId === media.id"
            @click="removeExistingMedia(media.id)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- New media -->
    <PostMediaPicker v-model="form.media" class="mb-3 mt-2" />

    <!-- Delete confirmation -->
    <div v-if="isConfirmingDelete" class="flex items-center justify-between rounded-md bg-red-50 border border-red-100 px-3 py-2 mb-3">
      <span class="text-xs font-medium text-red-600">Удалить пост без возможности отмены?</span>
      <div class="flex items-center gap-2 shrink-0">
        <UButton size="xs" color="gray" variant="ghost" :disabled="deleting" @click="isConfirmingDelete = false">
          Отмена
        </UButton>
        <UButton size="xs" color="red" :loading="deleting" @click="remove">
          Да, удалить
        </UButton>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <UButton
        v-if="!isConfirmingDelete"
        size="xs"
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        :disabled="postStore.loading"
        @click="isConfirmingDelete = true"
      >
        Удалить
      </UButton>
      <span v-else />

      <div class="flex items-center gap-2">
        <UButton color="gray" variant="ghost" :disabled="postStore.loading" @click="$emit('cancel')">
          Отмена
        </UButton>
        <UButton :loading="postStore.loading" :disabled="!isValid" @click="submit">
          Сохранить
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post, PostMedia } from '~/types/post'
import type { Coin } from '~/types/coins'
import { usePostStore } from '~/stores/post'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
  deleted: []
}>()

const postStore = usePostStore()
const coins = ref<Coin[]>([])

const form = reactive({
  title: props.post.title,
  content: props.post.content,
  coinId: props.post.coinId ? String(props.post.coinId) : '',
  media: [] as File[]
})

const existingMedia = ref<PostMedia[]>([...(props.post.media ?? [])].sort((a, b) => a.order - b.order))
const removingMediaId = ref<number | null>(null)

const coinOptions = computed(() => [
  { label: 'Без привязки к монете', value: '' },
  ...coins.value.map((coin) => ({ label: `${coin.fullName} (${coin.ticker})`, value: String(coin.id) }))
])

onMounted(async () => {
  const { $api } = useNuxtApp()
  coins.value = await $api('/coins')
})

async function removeExistingMedia(mediaId: number) {
  removingMediaId.value = mediaId
  try {
    await postStore.deleteMedia(props.post.id, mediaId)
    existingMedia.value = existingMedia.value.filter((m) => m.id !== mediaId)
  } catch {
    // error surfaced via postStore.error
  } finally {
    removingMediaId.value = null
  }
}

const isValid = computed(() => !!form.title.trim() && !!form.content.trim())

async function submit() {
  if (!isValid.value) return

  await postStore.updatePost(props.post.id, {
    title: form.title.trim(),
    content: form.content.trim(),
    coinId: form.coinId ? Number(form.coinId) : undefined,
    media: form.media
  })
  emit('saved')
}

const isConfirmingDelete = ref(false)
const deleting = ref(false)

async function remove() {
  deleting.value = true
  try {
    await postStore.deletePost(props.post.id)
    emit('deleted')
  } catch {
    isConfirmingDelete.value = false
  } finally {
    deleting.value = false
  }
}
</script>
