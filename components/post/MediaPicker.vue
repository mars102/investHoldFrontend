<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
      multiple
      class="hidden"
      @change="onFilesSelected"
    />
    <button
      type="button"
      class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
      @click="fileInput?.click()"
    >
      <UIcon name="i-heroicons-photo" class="w-4 h-4" />
      Добавить фото/видео
    </button>

    <p v-if="error" class="text-[11px] text-red-600 mt-1">{{ error }}</p>

    <div v-if="files.length" class="flex flex-wrap gap-2 mt-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200"
      >
        <video v-if="isVideoMime(file.type)" :src="previewUrl(file)" class="w-full h-full object-cover" muted />
        <img v-else :src="previewUrl(file)" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
          title="Убрать"
          @click="removeFile(index)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const files = defineModel<File[]>({ required: true })

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const previewUrls = new Map<File, string>()

function previewUrl(file: File): string {
  let url = previewUrls.get(file)
  if (!url) {
    url = URL.createObjectURL(file)
    previewUrls.set(file, url)
  }
  return url
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  input.value = ''
  if (!picked.length) return

  const combined = [...files.value, ...picked]
  const validationError = validatePostMediaFiles(combined)
  if (validationError) {
    error.value = validationError
    return
  }

  error.value = ''
  files.value = combined
}

function removeFile(index: number) {
  const file = files.value[index]
  if (file) {
    const url = previewUrls.get(file)
    if (url) URL.revokeObjectURL(url)
    previewUrls.delete(file)
  }
  files.value = files.value.filter((_, i) => i !== index)
}

onUnmounted(() => {
  for (const url of previewUrls.values()) URL.revokeObjectURL(url)
})
</script>
