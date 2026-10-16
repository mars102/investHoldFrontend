<template>
  <div
    class="rounded-lg transition-colors"
    :class="dragOver ? 'bg-cyan-50 ring-2 ring-cyan-400 dark:bg-cyan-500/10' : ''"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="ALLOWED_SUPPORT_ATTACHMENT_MIME_TYPES.join(',')"
      multiple
      class="hidden"
      @change="onSelect"
    />

    <div class="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 disabled:opacity-40"
        :disabled="files.length >= MAX_SUPPORT_ATTACHMENTS"
        @click="fileInput?.click()"
      >
        <UIcon name="i-heroicons-paper-clip" class="w-4 h-4" />
        Прикрепить скриншот
      </button>
      <span class="text-[10px] text-gray-400 dark:text-gray-500">или Ctrl+V / перетащите</span>
    </div>

    <p v-if="error" class="text-[11px] text-red-600 dark:text-red-400 mt-1">{{ error }}</p>

    <div v-if="files.length" class="flex flex-wrap gap-2 mt-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <img :src="previewUrl(file)" :alt="file.name" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
          title="Убрать"
          @click="remove(index)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ pasteTarget?: HTMLElement | null }>(), { pasteTarget: null })

const files = defineModel<File[]>({ required: true })

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const dragOver = ref(false)
const previewUrls = new Map<File, string>()

function previewUrl(file: File) {
  let url = previewUrls.get(file)
  if (!url) {
    url = URL.createObjectURL(file)
    previewUrls.set(file, url)
  }
  return url
}

function add(picked: File[]) {
  if (!picked.length) return
  const combined = [...files.value, ...picked]
  const validationError = validateSupportAttachments(combined)
  if (validationError) {
    error.value = validationError
    return
  }
  error.value = ''
  files.value = combined
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  add(Array.from(input.files ?? []))
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  add(Array.from(e.dataTransfer?.files ?? []))
}

// Screenshots usually live in the clipboard — let Ctrl+V into the form attach them.
function onPaste(e: ClipboardEvent) {
  const images = Array.from(e.clipboardData?.items ?? [])
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item, i) => {
      const file = item.getAsFile()
      if (!file) return null
      const ext = file.type.split('/')[1] || 'png'
      return new File([file], `screenshot-${Date.now()}-${i}.${ext}`, { type: file.type })
    })
    .filter((f): f is File => !!f)
  if (images.length) {
    e.preventDefault()
    add(images)
  }
}

function remove(index: number) {
  const file = files.value[index]
  if (file) {
    const url = previewUrls.get(file)
    if (url) URL.revokeObjectURL(url)
    previewUrls.delete(file)
  }
  files.value = files.value.filter((_, i) => i !== index)
}

watch(
  () => props.pasteTarget,
  (target, previous) => {
    previous?.removeEventListener('paste', onPaste)
    target?.addEventListener('paste', onPaste)
  },
  { immediate: true }
)

// Clearing the model from outside (after sending) should also drop the previews
watch(files, (current) => {
  if (current.length) return
  for (const url of previewUrls.values()) URL.revokeObjectURL(url)
  previewUrls.clear()
  error.value = ''
})

onUnmounted(() => {
  props.pasteTarget?.removeEventListener('paste', onPaste)
  for (const url of previewUrls.values()) URL.revokeObjectURL(url)
})
</script>
