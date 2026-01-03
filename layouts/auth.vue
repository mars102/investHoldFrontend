<template>
  <div class="auth-layout">
<!--    <PhoenixMain width="600px"-->
<!--                 height="900px"-->
<!--                 :animation-speed="0.55"-->
<!--                 />-->
    <!-- Анимированный фон с геометрическими паттернами -->
    <div class="background-animation">
      <div class="grid-pattern"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="light-beams"></div>
    </div>

    <!-- Основной контейнер -->
    <div class="container">
      <!-- Заголовок с анимацией -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-icon">
            <img src="/images/logo.png">
            <div>
              <span style="color: #ffc865; font-size: 32px;">Invest</span><span style="color:#1c667d;">Hold</span>
            </div>
          </div>
          <h1 class="logo-text">
            <span class="text-subtitle">Менеджер портфелей криптовалют</span>
          </h1>
        </div>
      </div>

      <!-- Карточка формы с анимацией перехода -->
      <div class="form-card-wrapper">
        <transition
            :name="transitionName"
            mode="out-in"
            @before-enter="beforeEnter"
            @after-enter="afterEnter"
            @before-leave="beforeLeave"
            @after-leave="afterLeave"
        >
          <div
              :key="$route.path"
              class="form-card-container"
          >
            <!-- Компактная карточка формы -->
            <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100
                        transform transition-all duration-300 hover:shadow-xl
                        relative overflow-hidden form-card-inner">

              <!-- Тонкий градиентный акцент -->
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300"></div>

              <!-- Содержимое формы с анимацией -->
              <transition-group
                  name="form-content"
                  tag="div"
                  class="space-y-4 form-content-wrapper"
              >
                <slot :key="$route.path" />
              </transition-group>

              <!-- Минималистичный футер -->
              <div class="mt-6 pt-4 border-t border-gray-100">
                <p class="text-xs text-gray-400 text-center">
                  © 2025 • Команда-феникс
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
  data() {
    return {
      transitionName: 'slide-fade',
      isTransitioning: false,
      prevRoute: null
    }
  },
  watch: {
    '$route'(to, from) {
      this.prevRoute = from

      // Определяем направление анимации на основе URL
      const toPath = to.path
      const fromPath = from.path

      if (toPath.includes('register') && fromPath.includes('login')) {
        this.transitionName = 'slide-left'
      } else if (toPath.includes('login') && fromPath.includes('register')) {
        this.transitionName = 'slide-right'
      } else {
        this.transitionName = 'fade-scale'
      }
    }
  },
  mounted() {
    this.initAnimations()
  },
  methods: {
    initAnimations() {
      setTimeout(() => {
        const shapes = document.querySelectorAll('.shape')
        shapes.forEach((shape, index) => {
          shape.style.animationDelay = `${index * 0.5}s`
        })
      }, 100)
    },

    beforeEnter(el) {
      this.isTransitioning = true
      el.style.opacity = 0
      el.style.transform = 'translateY(20px) scale(0.95)'
    },

    afterEnter(el) {
      this.isTransitioning = false
      el.style.opacity = ''
      el.style.transform = ''
    },

    beforeLeave(el) {
      this.isTransitioning = true
    },

    afterLeave(el) {
      this.isTransitioning = false
    }
  }
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Анимированный фон */
.background-animation {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
}

.floating-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 8px;
  animation: float-shape 15s ease-in-out infinite;
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  bottom: 15%;
  right: 10%;
  animation-delay: 1s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 40%;
  right: 15%;
  animation-delay: 2s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 25%;
  left: 15%;
  animation-delay: 3s;
}

@keyframes float-shape {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.5;
  }
  50% {
    transform: translateY(0) rotate(180deg);
    opacity: 0.3;
  }
  75% {
    transform: translateY(20px) rotate(270deg);
    opacity: 0.5;
  }
}

.light-beams {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  animation: beam-rotate 30s linear infinite;
}

@keyframes beam-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Основной контейнер */
.container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
}

/* Заголовок */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 104px;
  height: 94px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: icon-pulse 4s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* Обертка для карточки формы */
.form-card-wrapper {
  position: relative;
  min-height: 400px;
  perspective: 1000px;
}

.form-card-container {
  position: absolute;
  width: 100%;
  backface-visibility: hidden;
}

.form-card-inner {
  transform-origin: center top;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-content-wrapper {
  position: relative;
}

/* Анимации перехода */

/* 1. Плавное появление с масштабированием */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 2. Слайд влево (для перехода от логина к регистрации) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-left-enter-to,
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 3. Слайд вправо (для перехода от регистрации к логину) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.slide-right-enter-to,
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 4. Комбинированная анимация слайда и фейда */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 5. Анимация перелистывания (3D эффект) */
.flip-enter-active,
.flip-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateY(90deg) scale(0.8);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateY(-90deg) scale(0.8);
}

.flip-enter-to,
.flip-leave-from {
  opacity: 1;
  transform: rotateY(0) scale(1);
}

/* 6. Анимация содержимого формы */
.form-content-enter-active,
.form-content-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.form-content-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.form-content-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-content-enter-to,
.form-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Эффект свечения при смене формы */
.form-card-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 1;
}

.form-card-wrapper.is-transitioning .form-card-inner::before {
  opacity: 1;
  animation: form-glow 1s ease-in-out;
}

@keyframes form-glow {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
}

/* Адаптивность */
@media (max-width: 640px) {
  .container {
    max-width: 100%;
    padding: 0 20px;
  }

  .form-card-inner {
    padding: 24px;
  }

  .text-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    width: 80px;
    height: 80px;
  }

  .form-card-wrapper {
    min-height: 350px;
  }

  /* Упрощаем анимации на мобильных */
  .slide-left-enter-from,
  .slide-left-leave-to,
  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: translateX(30px);
  }
}
</style>