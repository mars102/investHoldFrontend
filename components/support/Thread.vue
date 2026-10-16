<template>
  <div class="space-y-3">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="flex"
      :class="isMine(msg) ? 'justify-end' : 'justify-start'"
    >
      <div class="max-w-[85%]">
        <div
          class="text-[10px] mb-1 flex items-center gap-1.5"
          :class="isMine(msg) ? 'justify-end text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'"
        >
          <span class="font-semibold" :class="msg.authorType === 'admin' ? 'text-cyan-600 dark:text-cyan-400' : ''">
            {{ authorLabel(msg) }}
          </span>
          <span>· {{ formatDateTime(msg.createdAt) }}</span>
        </div>
        <div
          class="rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words"
          :class="isMine(msg)
            ? 'bg-cyan-600 text-white rounded-br-md dark:bg-cyan-700'
            : 'bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100'"
        >{{ msg.text }}</div>

        <div v-if="msg.attachments?.length" class="flex flex-wrap gap-1.5 mt-1.5" :class="isMine(msg) ? 'justify-end' : ''">
          <button
            v-for="att in msg.attachments"
            :key="att.id"
            type="button"
            class="w-20 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:ring-2 hover:ring-cyan-400 transition dark:border-gray-700 dark:bg-gray-800"
            :title="att.originalName || 'Скриншот'"
            @click="lightbox = att.url"
          >
            <img :src="att.url" :alt="att.originalName || 'Скриншот'" class="w-full h-full object-cover" loading="lazy" />
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightbox"
          class="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          @click="lightbox = null"
        >
          <img :src="lightbox" alt="Скриншот" class="max-w-full max-h-full rounded-lg shadow-2xl" />
          <a
            :href="lightbox"
            target="_blank"
            rel="noopener"
            class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            @click.stop
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
            Открыть оригинал
          </a>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SupportMessage } from '~/types/support'

const props = defineProps<{
  messages: SupportMessage[]
  /** Whose messages are drawn on the right: the current viewer's side */
  viewer: 'user' | 'admin'
}>()

const lightbox = ref<string | null>(null)

function isMine(msg: SupportMessage) {
  return msg.authorType === props.viewer
}

function authorLabel(msg: SupportMessage) {
  if (msg.authorType === 'admin') return props.viewer === 'admin' ? msg.author?.username ?? 'Поддержка' : 'Поддержка InvestHold'
  return props.viewer === 'user' ? 'Вы' : msg.author?.username ?? 'Пользователь'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') lightbox.value = null
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
