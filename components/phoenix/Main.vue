
<template>
  <div
      ref="container"
      class="phoenix-container"
      :style="{
      width: width || '100%',
      height: height || '100%',
      background: background || 'transparent'
    }"
  >
    <!-- Контейнер для PixiJS canvas -->

    <!-- Панель управления анимацией -->
    <div class="controls-panel" v-if="showControls">
      <button
          @click="stop"
          class="control-btn"
          :disabled="!isPlaying"
          title="Остановить анимацию"
      >
        ⏹ Остановить
      </button>

      <button
          @click="play"
          class="control-btn"
          :disabled="isPlaying"
          title="Запустить анимацию"
      >
        ▶ Запустить
      </button>

      <button
          @click="toggle"
          class="control-btn toggle-btn"
          title="Переключить воспроизведение"
      >
        {{ isPlaying ? '⏸ Пауза' : '▶ Воспроизвести' }}
      </button>

      <div class="speed-control" v-if="showSpeedControl">
        <span>Скорость:</span>
        <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            :value="animationSpeed"
            @input="setAnimationSpeed($event.target.valueAsNumber)"
            class="speed-slider"
        />
        <span class="speed-value">{{ animationSpeed.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
// Определение spritesheet феникса
const PHOENIX_SHEET = {
  "frames": {
    "phoenix-0.png": {
      "frame": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-1.png": {
      "frame": { "x": 256, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-2.png": {
      "frame": { "x": 512, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-3.png": {
      "frame": { "x": 768, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-4.png": {
      "frame": { "x": 1024, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-5.png": {
      "frame": { "x": 1280, "y": 0, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-6.png": {
      "frame": { "x": 0, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-7.png": {
      "frame": { "x": 256, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-8.png": {
      "frame": { "x": 512, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-9.png": {
      "frame": { "x": 768, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-10.png": {
      "frame": { "x": 1024, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-11.png": {
      "frame": { "x": 1280, "y": 256, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-12.png": {
      "frame": { "x": 0, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-13.png": {
      "frame": { "x": 256, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-14.png": {
      "frame": { "x": 512, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-15.png": {
      "frame": { "x": 768, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-16.png": {
      "frame": { "x": 1024, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-17.png": {
      "frame": { "x": 1280, "y": 512, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-18.png": {
      "frame": { "x": 0, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-19.png": {
      "frame": { "x": 256, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-20.png": {
      "frame": { "x": 512, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-21.png": {
      "frame": { "x": 768, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-22.png": {
      "frame": { "x": 1024, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    },
    "phoenix-23.png": {
      "frame": { "x": 1280, "y": 768, "w": 256, "h": 256 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 256, "h": 256 },
      "sourceSize": { "w": 256, "h": 256 }
    }
  },
  "animations": {
    "fly": [
      "phoenix-0.png",
      "phoenix-1.png",
      "phoenix-2.png",
      "phoenix-3.png",
      "phoenix-4.png",
      "phoenix-5.png",
      "phoenix-6.png",
      "phoenix-7.png",
      "phoenix-8.png",
      "phoenix-9.png",
      "phoenix-10.png",
      "phoenix-11.png",
      "phoenix-12.png",
      "phoenix-13.png",
      "phoenix-14.png",
      "phoenix-15.png",
      "phoenix-16.png",
      "phoenix-17.png",
      "phoenix-18.png",
      "phoenix-19.png",
      "phoenix-20.png",
      "phoenix-21.png",
      "phoenix-22.png",
      "phoenix-23.png"
    ]
  },
  "meta": {
    "image": "ph2.png",
    "format": "RGBA8888",
    "size": { "w": 1536, "h": 1024 },
    "scale": "1"
  }
}

// Функция для ожидания загрузки baseTexture
function waitBaseTextureReady(baseTexture, timeout = 5000) {
  if (!baseTexture) return Promise.reject(new Error("No baseTexture"))

  // Если текстура уже валидна
  if (baseTexture.valid) {
    console.log('BaseTexture уже валиден')
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    console.log('Ожидание загрузки baseTexture...')

    const onLoaded = () => {
      cleanup()
      console.log('BaseTexture загружен')
      resolve()
    }

    const onError = (error) => {
      cleanup()
      console.error('Ошибка загрузки baseTexture:', error)
      reject(error)
    }

    const timeoutId = setTimeout(() => {
      cleanup()
      console.warn('Таймаут ожидания baseTexture')
      reject(new Error('Таймаут загрузки текстуры'))
    }, timeout)

    const cleanup = () => {
      clearTimeout(timeoutId)
      baseTexture.off('loaded', onLoaded)
      baseTexture.off('error', onError)
    }

    try {
      baseTexture.on('loaded', onLoaded)
      baseTexture.on('error', onError)
    } catch (e) {
      cleanup()
      reject(e)
    }
  })
}

export default {
  name: 'PhoenixAnimation',

  props: {
    imageUrl: {
      type: String,
      default: '/ph2.png' // По умолчанию в static/ папке
    },
    animationSpeed: {
      type: Number,
      default: 0.1
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    fit: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '500px'
    },
    height: {
      type: String,
      default: '500px'
    },
    background: {
      type: String,
      default: 'transparent'
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showSpeedControl: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      app: null,
      phoenix: null,
      sheet: null,
      _onResize: null,
      isPlaying: this.autoplay
    }
  },

  watch: {
    animationSpeed(newSpeed) {
      if (this.phoenix) {
        this.phoenix.animationSpeed = newSpeed
      }
    },
    autoplay(newVal) {
      if (this.phoenix) {
        if (newVal) {
          this.phoenix.play()
          this.isPlaying = true
        } else {
          this.phoenix.stop()
          this.isPlaying = false
        }
      }
    }
  },

  mounted() {
    // Инициализируем PixiJS только на клиенте (Nuxt 2)
    if (typeof window !== 'undefined') {
      this.initPixi()
    }
  },

  beforeDestroy() {
    this.destroyPixi()
  },

  methods: {
    async initPixi() {
      console.log('1. Начало инициализации Pixi')

      try {
        // Динамический импорт PixiJS для избежания ошибок SSR
        const pixiMod = await import("pixi.js")
        const PIXI = pixiMod.default ?? pixiMod
        console.log('3. Pixi загружен')

        const { Application, Assets, Spritesheet, AnimatedSprite } = PIXI
        const container = this.$refs.container

        if (!container) {
          console.error('Контейнер не найден!')
          return
        }

        console.log('4. Размеры контейнера:', {
          width: container.clientWidth,
          height: container.clientHeight
        })

        // Создаём PixiJS приложение
        const app = new Application()
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(2, window.devicePixelRatio || 1),
          resizeTo: container
        })

        this.app = app
        container.appendChild(app.canvas)

        console.log('8. Canvas создан:', {
          canvasWidth: app.canvas.width,
          canvasHeight: app.canvas.height
        })

        // Загружаем текстуру
        console.log('9. Загрузка текстуры:', this.imageUrl)
        const texture = await Assets.load(this.imageUrl)

        console.log('10. Текстура загружена:', {
          width: texture.width,
          height: texture.height,
          isValid: texture.valid,
          baseTexture: !!texture.baseTexture
        })

        // ВАЖНО: используем baseTexture
        const baseTexture = texture.baseTexture

        console.log('11. BaseTexture:', {
          type: baseTexture?.constructor?.name,
          valid: baseTexture?.valid,
          width: baseTexture?.width,
          height: baseTexture?.height
        })

        if (!baseTexture) {
          throw new Error("BaseTexture не определен")
        }

        // Ожидаем загрузку baseTexture
        if (!baseTexture.valid) {
          console.log('12. BaseTexture не валиден, ждем...')
          try {
            await waitBaseTextureReady(baseTexture)
            console.log('13. BaseTexture стал валиден')
          } catch (err) {
            console.warn('Ошибка ожидания baseTexture:', err.message)
            console.warn('Продолжаем без ожидания...')
          }
        } else {
          console.log('12. BaseTexture уже валиден')
        }

        // Парсим spritesheet
        console.log('14. Парсинг spritesheet')
        const sheet = new Spritesheet(baseTexture, PHOENIX_SHEET)
        this.sheet = sheet
        await sheet.parse()

        console.log('15. Spritesheet распарсен, текстуры:',
            Object.keys(sheet.textures).length)

        // Получаем кадры анимации
        const frames = (PHOENIX_SHEET.animations.fly || [])
            .map((name) => sheet.textures[name])
            .filter(Boolean)

        console.log('16. Количество кадров:', frames.length)

        if (!frames.length) {
          console.error('Кадры не найдены! Проверьте PHOENIX_SHEET определение')
          return
        }

        // Создаём анимированный спрайт
        console.log('17. Создание AnimatedSprite')
        const phoenix = new AnimatedSprite(frames)
        this.phoenix = phoenix

        phoenix.anchor.set(0.5)
        phoenix.animationSpeed = this.animationSpeed
        phoenix.loop = true

        if (this.autoplay) {
          console.log('18. Запуск анимации')
          phoenix.play()
          this.isPlaying = true
        } else {
          this.isPlaying = false
        }

        app.stage.addChild(phoenix)
        console.log('19. Sprite добавлен на stage')

        // Функция для обновления размеров
        const layout = () => {
          const w = container.clientWidth || 1
          const h = container.clientHeight || 1

          phoenix.x = w / 2
          phoenix.y = h / 2

          if (this.fit) {
            const target = Math.min(w, h) * 0.75
            const s = target / 256
            phoenix.scale.set(s)
          }
        }

        this._onResize = () => layout()
        window.addEventListener("resize", this._onResize, { passive: true })
        layout()

        console.log('20. Инициализация завершена успешно')

      } catch (error) {
        console.error("Критическая ошибка инициализации:", error)
        console.error('Stack:', error.stack)
      }
    },

    destroyPixi() {
      if (this._onResize) {
        window.removeEventListener("resize", this._onResize)
      }

      if (this.app) {
        try {
          this.app.destroy(true, { children: true, texture: true, baseTexture: true })
        } catch (error) {
          console.warn('Ошибка при уничтожении PixiJS:', error)
        }
        this.app = null
      }

      this.phoenix = null
      this.sheet = null
      this._onResize = null
    },

    // Методы управления анимацией
    play() {
      if (this.phoenix && !this.phoenix.playing) {
        this.phoenix.play()
        this.isPlaying = true
      }
    },

    stop() {
      if (this.phoenix && this.phoenix.playing) {
        this.phoenix.stop()
        this.isPlaying = false
      }
    },

    toggle() {
      if (this.phoenix) {
        if (this.phoenix.playing) {
          this.phoenix.stop()
          this.isPlaying = false
        } else {
          this.phoenix.play()
          this.isPlaying = true
        }
      }
    },

    setAnimationSpeed(speed) {
      if (this.phoenix) {
        this.phoenix.animationSpeed = speed
      }
      this.$emit('speed-change', speed)
    },

    // Метод для принудительного обновления размеров
    resize() {
      if (this.app && this.phoenix) {
        const container = this.$refs.container
        if (container) {
          const w = container.clientWidth || 1
          const h = container.clientHeight || 1

          this.phoenix.x = w / 2
          this.phoenix.y = h / 2

          if (this.fit) {
            const target = Math.min(w, h) * 0.75
            const s = target / 256
            this.phoenix.scale.set(s)
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.phoenix-container {
  position: relative;
  overflow: hidden;
  min-width: 100px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phoenix-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Панель управления */
.controls-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 15px;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.control-btn {
  background: linear-gradient(135deg, #ff6b00, #ff0000);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.control-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff8533, #ff3333);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 0, 0.3);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  background: rgba(128, 128, 128, 0.5);
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.toggle-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5dade2, #3498db);
}

/* Контроль скорости */
.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 14px;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.speed-slider {
  width: 100px;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff6b00;
  cursor: pointer;
  border: 2px solid white;
}

.speed-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff6b00;
  cursor: pointer;
  border: 2px solid white;
}

.speed-value {
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  background: rgba(255, 107, 0, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}
</style>