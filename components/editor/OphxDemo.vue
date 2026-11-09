<template>
  <div
    class="relative"
    @dragover.prevent="onDragOver"
    @dragleave.self="dragOver = false"
    @drop.prevent="onDrop"
  >
    <!-- Drop overlay -->
    <div
      v-if="dragOver"
      class="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-cyan-500/10 backdrop-blur-[1px]"
    >
      <div class="rounded-2xl border-2 border-dashed border-cyan-500 bg-white px-8 py-6 text-center shadow-xl dark:bg-gray-900">
        <UIcon name="i-heroicons-document-arrow-up" class="mx-auto h-10 w-10 text-cyan-500" />
        <p class="mt-2 font-semibold text-gray-900 dark:text-white">Отпустите, чтобы открыть .ophx</p>
      </div>
    </div>

    <!-- Header -->
    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
          <input
            v-model="doc.filename"
            class="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-lg font-bold text-gray-900 hover:border-gray-200 focus:border-cyan-400 focus:outline-none dark:text-white dark:hover:border-gray-700"
            aria-label="Имя документа"
            placeholder="Без названия"
          />
        </div>
        <p class="mt-0.5 pl-8 text-xs text-gray-500 dark:text-gray-400">
          {{ stats.words }} {{ plural(stats.words, 'слово', 'слова', 'слов') }} · {{ stats.chars }} симв.
          <span v-if="savedAt"> · черновик сохранён {{ savedAtLabel }}</span>
          <span v-if="styleCount"> · стилей из файла: {{ styleCount }}</span>
        </p>
        <div class="mt-1.5 flex flex-wrap items-center gap-1.5 pl-8">
          <a
            href="https://www.npmjs.com/package/@phenix1024/editor"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-500/50 dark:hover:text-red-400"
          >
            <!-- npm logo -->
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-[#cb3837]" fill="currentColor" aria-hidden="true">
              <path d="M0 7.33h24v8h-12v1.34H6.67v-1.34H0v-8zm1.33 6.67h2.67v-4h1.33v4h1.34V8.67H1.33V14zm6.67-5.33V16h2.67v-1.33h2.66V8.67H8zm2.67 1.33H12v2.67h-1.33V10zm4-1.33V14h2.66v-4H20v4h1.33v-4h1.34v4H24V8.67h-9.33z" />
            </svg>
            @phenix1024/editor
          </a>
          <a
            href="https://github.com/mars102/pluginEditor"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-white"
          >
            <!-- GitHub logo -->
            <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            mars102/pluginEditor
          </a>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input ref="fileInput" type="file" accept=".ophx" class="hidden" @change="onFileSelected" />
        <UButtonGroup orientation="horizontal" role="radiogroup" aria-label="Режим документа">
          <UButton
            v-for="option in MODE_OPTIONS"
            :key="option.value"
            :icon="option.icon"
            :color="mode === option.value ? 'primary' : 'gray'"
            :variant="mode === option.value ? 'solid' : 'soft'"
            :title="option.hint"
            role="radio"
            :aria-checked="mode === option.value"
            @click="setMode(option.value)"
          >
            {{ option.label }}
          </UButton>
        </UButtonGroup>
        <UButton color="gray" variant="soft" icon="i-heroicons-document-plus" @click="newDocument">Новый</UButton>
        <UButton color="gray" variant="soft" icon="i-heroicons-folder-open" :loading="importing" @click="fileInput?.click()">
          Открыть .ophx
        </UButton>
        <UButton icon="i-heroicons-arrow-down-tray" :loading="exporting" @click="download">Скачать .ophx</UButton>
      </div>
    </div>

    <p v-if="error" class="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <div class="grid gap-4 xl:grid-cols-[1fr_300px]">
      <!-- Editor -->
      <!-- The editor runs inside an iframe: its own document, so app styles
           (Tailwind preflight, @tailwindcss/forms) can't leak into it, and only
           the package's own CSS applies — including popovers it adds to <body>. -->
      <div class="min-w-0 overflow-hidden rounded-b-xl border border-gray-200 shadow-sm dark:border-gray-800">
        <iframe
          ref="frame"
          title="Редактор документа"
          class="block h-[75vh] w-full xl:h-[calc(100vh-180px)]"
        />
      </div>

      <!-- Side panel -->
      <aside class="space-y-4">
        <section class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Шаблоны</h3>
            <span class="text-xs text-gray-400">{{ DOCUMENT_TEMPLATES.length }}</span>
          </div>
          <ul class="space-y-1">
            <li v-for="t in DOCUMENT_TEMPLATES" :key="t.id">
              <button
                type="button"
                class="group flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                :class="activeTemplateId === t.id ? 'bg-cyan-50 dark:bg-cyan-500/10' : ''"
                @click="loadTemplate(t)"
              >
                <UIcon :name="t.icon" class="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <span class="min-w-0">
                  <span class="block text-xs font-semibold text-gray-900 group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-300">{{ t.title }}</span>
                  <span class="block text-[11px] leading-snug text-gray-500 dark:text-gray-400">{{ t.description }}</span>
                </span>
              </button>
            </li>
          </ul>
          <p class="mt-3 text-[11px] leading-snug text-gray-400">
            Шаблон открывается в режиме «Заполнение». Это упрощённые образцы: перед подписанием проверьте текст с юристом.
          </p>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Поля шаблона</h3>
            <span class="text-xs text-gray-400">{{ fields.length }}</span>
          </div>

          <p v-if="!fields.length" class="text-xs text-gray-500 dark:text-gray-400">
            Полей пока нет. Напишите в тексте <code class="rounded bg-gray-100 px-1 dark:bg-gray-800">____</code> на месте, которое нужно заполнить, и нажмите кнопку ниже.
          </p>
          <ul v-else class="max-h-64 space-y-1.5 overflow-y-auto">
            <li v-for="f in fields" :key="f.id" class="flex items-center gap-2 text-xs">
              <span
                class="h-2 w-2 shrink-0 rounded-full"
                :class="f.value.trim() ? 'bg-emerald-500' : f.required ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'"
              />
              <span class="shrink-0 font-mono text-gray-400">{{ f.id }}</span>
              <span class="truncate text-gray-700 dark:text-gray-300">{{ f.label || '—' }}</span>
              <span class="ml-auto max-w-[45%] truncate text-gray-900 dark:text-white" :title="f.value">
                {{ f.value || 'пусто' }}
              </span>
            </li>
          </ul>

          <div class="mt-3 grid gap-2">
            <UButton
              size="sm"
              color="gray"
              variant="soft"
              icon="i-heroicons-squares-plus"
              block
              :disabled="mode !== 'edit'"
              :title="mode !== 'edit' ? 'Доступно в режиме «Редактирование»' : undefined"
              @click="convertFields"
            >
              Превратить ____ в поля
            </UButton>
            <UButton
              v-if="fields.length && mode === 'edit'"
              size="sm"
              color="gray"
              variant="soft"
              icon="i-heroicons-clipboard-document-list"
              block
              @click="setMode('fill')"
            >
              Перейти к заполнению
            </UButton>
            <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-clipboard-document-check" block @click="checkRequired">
              Проверить обязательные
            </UButton>
          </div>
          <p
            v-if="fieldsMessage"
            class="mt-2 text-xs"
            :class="fieldsMessageIsError ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'"
          >
            {{ fieldsMessage }}
          </p>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <h3 class="mb-2 text-sm font-bold text-gray-900 dark:text-white">Подсказки</h3>
          <ul class="list-disc space-y-1 pl-4">
            <li><b># </b>, <b>## </b> в начале строки — заголовки, <b>- </b> и <b>1. </b> — списки</li>
            <li>«Свернуть» на тулбаре сворачивает раздел под заголовком</li>
            <li>«Содержание» — переход к любому заголовку</li>
            <li>Файл .ophx можно перетащить прямо на страницу</li>
            <li>Черновик сохраняется в браузере автоматически</li>
            <li>«Заполнение» — меняются только поля, остальной текст защищён; <b>Tab</b> / <b>Shift+Tab</b> — к следующему / предыдущему полю</li>
            <li>«Просмотр» отключает правку, поиск и содержание остаются</li>
          </ul>
        </section>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OphxEditor, OphxEditorMode, OphxFieldValue } from '@phenix1024/editor'
// Loaded inside the iframe, not bundled into the app: the package's self-contained
// ES module and its stylesheet, emitted as plain files.
import editorModuleUrl from '@phenix1024/editor/standalone?url'
import editorCssUrl from '@phenix1024/editor/style.css?url'
import { DOCUMENT_TEMPLATES, type DocumentTemplate } from './templates'

type OphxModule = typeof import('@phenix1024/editor')

const DRAFT_KEY = 'investhold-ophx-draft'
const EDITABLE_KEY = 'investhold-ophx-editable'

const MODE_OPTIONS: { value: OphxEditorMode; label: string; icon: string; hint: string }[] = [
  { value: 'edit', label: 'Редактирование', icon: 'i-heroicons-pencil-square', hint: 'Править весь документ' },
  { value: 'fill', label: 'Заполнение', icon: 'i-heroicons-clipboard-document-list', hint: 'Менять только поля шаблона' },
  { value: 'view', label: 'Просмотр', icon: 'i-heroicons-eye', hint: 'Только чтение' }
]


const DEMO_CONTENT = `
<h1>Договор поставки № ____</h1>
<p>г. Москва, «____» ____________ 2026 г.</p>
<p><strong>InvestHold</strong>, именуемый в дальнейшем «Поставщик», и ____________, именуемый в дальнейшем «Покупатель», заключили настоящий договор о нижеследующем.</p>
<h2>1. Предмет договора</h2>
<p>Поставщик обязуется передать, а Покупатель — принять и оплатить товар согласно спецификации:</p>
<table>
  <tr><th>Наименование</th><th>Количество</th><th>Цена, ₽</th></tr>
  <tr><td>Лицензия InvestHold Pro</td><td>1</td><td>12 000</td></tr>
  <tr><td>Поддержка, 12 месяцев</td><td>1</td><td>6 000</td></tr>
</table>
<h2>2. Условия оплаты</h2>
<ul>
  <li>Предоплата 50% в течение ____ рабочих дней.</li>
  <li>Остаток — после подписания акта.</li>
</ul>
<h2>3. Как попробовать редактор</h2>
<ol>
  <li>Нажмите «Превратить ____ в поля» справа — подчёркивания станут полями для заполнения.</li>
  <li>Включите режим «Заполнение»: менять можно только поля, Tab переходит к следующему.</li>
  <li>Попробуйте поиск, содержание и сворачивание разделов на панели инструментов.</li>
  <li>Скачайте документ как .ophx и откройте его снова.</li>
</ol>
`

interface DocMeta {
  filename: string
  title: string
  styles: Record<string, string>
  bodyContentEditable?: 'true' | 'false'
}

const frame = ref<HTMLIFrameElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const doc = reactive<DocMeta>({ filename: 'Договор поставки', title: 'Договор поставки', styles: {} })
const fields = ref<OphxFieldValue[]>([])
const stats = reactive({ words: 0, chars: 0 })
const savedAt = ref<Date | null>(null)
const error = ref('')
const importing = ref(false)
const exporting = ref(false)
const dragOver = ref(false)
const fieldsMessage = ref('')
const fieldsMessageIsError = ref(false)
const mode = ref<OphxEditorMode>('edit')
const activeTemplateId = ref<string | null>(null)

const styleCount = computed(() => Object.keys(doc.styles).length)
const savedAtLabel = computed(() =>
  savedAt.value ? savedAt.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''
)

// Plain variables on purpose: Vue proxies (ref/reactive) break Tiptap.
// Both come from the iframe's window, so the editor lives entirely in its document.
let editor: OphxEditor | null = null
let ophx: OphxModule | null = null

const colorMode = useColorMode()

/** Minimal page around the editor: only layout, the editor itself is styled by the package CSS. */
function frameHtml() {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${editorCssUrl}">
<style>
  html, body { margin: 0; }
  body { min-height: 100vh; background: #f3f4f6; }
  .page { padding: 24px 12px; }
  #editor { max-width: 860px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, .08); }
</style>
<script type="module">
  import * as ophx from '${editorModuleUrl}'
  window.OphxModule = ophx
<\/script>
</head>
<body>
<div id="toolbar"></div>
<div class="page"><div id="editor"></div></div>
</body>
</html>`
}

function syncFrameTheme() {
  const body = frame.value?.contentDocument?.body
  if (body) body.style.background = colorMode.value === 'dark' ? '#030712' : '#f3f4f6'
}

/** Drag & drop of .ophx onto the editor: drops land in the iframe's document, not ours. */
function bindFrameDrop(d: Document) {
  d.addEventListener('dragover', (e) => {
    if (!e.dataTransfer?.types.includes('Files')) return
    e.preventDefault()
    dragOver.value = true
  })
  d.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget) dragOver.value = false
  })
  // Capture phase: take .ophx files before the editor treats them as a regular drop
  d.addEventListener(
    'drop',
    (e) => {
      dragOver.value = false
      const file = e.dataTransfer?.files?.[0]
      if (!file?.name.toLowerCase().endsWith('.ophx')) return
      e.preventDefault()
      e.stopPropagation()
      void openFile(file)
    },
    true
  )
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

function refreshDerived() {
  if (!editor) return
  fields.value = editor.getFields()
  const text = editor.getText().trim()
  stats.chars = text.length
  stats.words = text ? text.split(/\s+/).length : 0
}

const saveDraft = useDebounceFn(() => {
  if (!editor) return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ html: editor.getHTML(), ...doc }))
    savedAt.value = new Date()
  } catch {
    // storage full or unavailable — the editor keeps working without drafts
  }
}, 800)

function loadDraft(): ({ html: string } & DocMeta) | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function applyDocument(html: string, meta: Partial<DocMeta>) {
  if (!editor) return
  editor.setContent(html)
  doc.filename = meta.filename || 'Без названия'
  doc.title = meta.title || doc.filename
  doc.styles = meta.styles ?? {}
  doc.bodyContentEditable = meta.bodyContentEditable
  fieldsMessage.value = ''
  refreshDerived()
  saveDraft()
}

function hasUserContent() {
  return Boolean(editor && editor.getText().trim())
}

function loadTemplate(template: DocumentTemplate) {
  if (!editor) return
  if (hasUserContent() && !window.confirm(`Открыть шаблон «${template.title}»? Текущий документ будет заменён.`)) return
  error.value = ''
  // bodyContentEditable 'false': the downloaded .ophx reopens in fill mode as a template
  applyDocument(template.html, { filename: template.title, title: template.title, bodyContentEditable: 'false' })
  activeTemplateId.value = template.id
  setMode('fill')
  fieldsMessageIsError.value = false
  fieldsMessage.value = `Шаблон «${template.title}»: полей ${fields.value.length}. Tab — к следующему полю.`
}

function newDocument() {
  error.value = ''
  activeTemplateId.value = null
  applyDocument('<p></p>', { filename: 'Новый документ' })
  setMode('edit')
  editor?.focus('start')
}

function setMode(next: OphxEditorMode) {
  if (!editor) return
  editor.setMode(next)
  mode.value = editor.mode
  if (next === 'fill') fieldsMessage.value = ''
}

async function openFile(file: File) {
  error.value = ''
  if (!file.name.toLowerCase().endsWith('.ophx')) {
    error.value = `«${file.name}» — не файл .ophx`
    return
  }
  if (!editor) return
  importing.value = true
  try {
    // loadOphx sets the content itself; applyDocument re-sets the same html and syncs our meta
    const imported = await editor.loadOphx(file)
    activeTemplateId.value = null
    applyDocument(imported.html, imported)
    // A template archive (<body contenteditable="false">) switches the editor to 'fill' by itself
    mode.value = editor.mode
  } catch (e: any) {
    error.value = `Не удалось открыть «${file.name}»: ${e?.message || 'файл повреждён или старого формата'}`
  } finally {
    importing.value = false
  }
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void openFile(file)
}

function onDragOver(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) dragOver.value = true
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) void openFile(file)
}

async function download() {
  if (!editor) return
  error.value = ''
  exporting.value = true
  try {
    // The archive's inner HTML must share the outer file's basename, and both
    // must be plain names — strip path separators and the extension if typed.
    const filename = (doc.filename.trim() || 'Документ').replace(/[\\/:*?"<>|]/g, '_').replace(/\.ophx$/i, '')
    await editor.downloadOphx({
      filename,
      title: doc.title || filename,
      styles: doc.styles,
      bodyContentEditable: doc.bodyContentEditable
    })
  } catch (e: any) {
    error.value = `Не удалось сохранить файл: ${e?.message || 'неизвестная ошибка'}`
  } finally {
    exporting.value = false
  }
}

function convertFields() {
  if (!editor || !ophx) return
  const result = ophx.convertUnderscoresToFields(editor.getHTML())
  fieldsMessageIsError.value = false
  if (!result.count) {
    fieldsMessageIsError.value = true
    fieldsMessage.value = 'Не найдено ни одного «____». Поставьте два или больше подчёркиваний там, где нужно поле, и нажмите снова.'
    return
  }
  editor.setContent(result.html)
  refreshDerived()
  saveDraft()
  fieldsMessage.value = `Создано полей: ${result.count}. Чтобы заполнить шаблон, включите режим «Заполнение».`
}

function checkRequired() {
  if (!editor) return
  const missing = editor.getMissingRequiredFields()
  fieldsMessageIsError.value = missing.length > 0
  fieldsMessage.value = missing.length
    ? `Не заполнены обязательные поля: ${missing.map((f) => f.label || f.id).join(', ')}`
    : fields.value.length
      ? 'Все обязательные поля заполнены'
      : 'В документе нет полей'
}

function loadFrame(el: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    // Module scripts delay the load event, so the editor module is ready by then
    el.addEventListener('load', () => resolve(), { once: true })
    el.srcdoc = frameHtml()
  })
}

onMounted(async () => {
  const el = frame.value
  if (!el) return
  await loadFrame(el)

  const win = el.contentWindow as (Window & { OphxModule?: OphxModule }) | null
  const d = el.contentDocument
  if (!win?.OphxModule || !d) {
    error.value = 'Не удалось загрузить редактор. Обновите страницу.'
    return
  }
  ophx = win.OphxModule
  syncFrameTheme()
  bindFrameDrop(d)

  const draft = loadDraft()
  editor = new ophx.OphxEditor({
    element: d.getElementById('editor')!,
    toolbar: d.getElementById('toolbar')!,
    content: draft?.html || DEMO_CONTENT,
    placeholder: 'Начните писать…',
    editableStorageKey: EDITABLE_KEY,
    onUpdate: () => {
      refreshDerived()
      saveDraft()
    }
  })
  mode.value = editor.mode

  if (draft) {
    doc.filename = draft.filename
    doc.title = draft.title
    doc.styles = draft.styles ?? {}
    doc.bodyContentEditable = draft.bodyContentEditable
  }
  refreshDerived()
})

watch(() => doc.filename, () => saveDraft())
watch(() => colorMode.value, syncFrameTheme)

onBeforeUnmount(() => {
  // destroy() also removes the built-in toolbar
  editor?.destroy()
  editor = null
})
</script>
