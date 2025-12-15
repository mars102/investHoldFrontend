<template>
  <div class="auth-layout">
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
<!--            <span class="text-gradient">InvestHold</span>-->
                          <span class="text-subtitle">Менеджер портфелей криптовалют</span>
          </h1>
        </div>
      </div>

      <!-- Карточка формы -->
      <!-- Компактная карточка формы -->
      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-100
                  transform transition-all duration-300 hover:shadow-xl
                  relative overflow-hidden">

        <!-- Тонкий градиентный акцент -->
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300"></div>

        <!-- Содержимое формы -->
        <div class="space-y-4">
          <slot />
        </div>

        <!-- Минималистичный футер -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-400 text-center">
            © 2025 • Команда-феникс
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
  mounted() {
    this.initAnimations()
  },
  methods: {
    initAnimations() {
      // Инициализация анимаций после монтирования компонента
      setTimeout(() => {
        const shapes = document.querySelectorAll('.shape')
        shapes.forEach((shape, index) => {
          shape.style.animationDelay = `${index * 0.5}s`
        })
      }, 100)
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
  /*background: #ffffff;*/
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
    /*box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);*/
  }
  50% {
    transform: scale(1.05);
    /*box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);*/
  }
}

.icon-animation {
  width: 32px;
  height: 32px;
  background: white;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-position: center;
  animation: icon-rotate 8s linear infinite;
}

@keyframes icon-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-gradient {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e40af, #4f46e5, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.text-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.header-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent);
  margin: 0 auto;
  width: 200px;
  animation: line-glow 2s ease-in-out infinite;
}

@keyframes line-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Карточка формы */
.form-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  position: relative;
  box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
  overflow: hidden;
}

.card-border {
  position: absolute;
  inset: -2px;
  border-radius: 26px;
  padding: 2px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6);
  background-size: 400% 400%;
  animation: border-flow 4s linear infinite;
  z-index: -1;
}

@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.border-animation {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: border-scan 2s linear infinite;
}

@keyframes border-scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.card-content {
  position: relative;
  z-index: 1;
}

/* Индикатор безопасности */
.security-indicator {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.security-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s ease;
}

.dot.active {
  background: #10b981;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.security-text {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Футер */
.footer {
  text-align: center;
}

.footer-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
}

.footer-item:hover {
  color: #3b82f6;
  transform: translateY(-2px);
}

.footer-icon {
  width: 20px;
  height: 20px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.3s ease;
}

.footer-item:hover .footer-icon {
  background: #3b82f6;
  color: white;
  transform: rotate(15deg);
}

/* Адаптивность */
@media (max-width: 640px) {
  .container {
    max-width: 100%;
    padding: 0 20px;
  }

  .form-card {
    padding: 30px 24px;
  }

  .text-gradient {
    font-size: 36px;
  }

  .footer-grid {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    flex-direction: column;
    gap: 12px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
  }

  .text-gradient {
    font-size: 32px;
  }
}
</style>