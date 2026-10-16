<template>
  <svg
    viewBox="0 0 120 150"
    class="robot overflow-visible"
    :class="`state-${state}`"
    role="img"
    aria-label="Робот-помощник Холди"
  >
    <defs>
      <!-- glossy white shell: lit from top-left, cool blue falloff at the edges -->
      <radialGradient :id="`${uid}-shell`" cx="0.35" cy="0.28" r="0.85">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="55%" stop-color="#f1f5f9" />
        <stop offset="85%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#94a3b8" />
      </radialGradient>
      <linearGradient :id="`${uid}-blue`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#1e3a8a" />
      </linearGradient>
      <radialGradient :id="`${uid}-screen`" cx="0.4" cy="0.3" r="0.9">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="70%" stop-color="#0b1220" />
        <stop offset="100%" stop-color="#020617" />
      </radialGradient>
      <radialGradient :id="`${uid}-eye`" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0%" stop-color="#ecfdf5" />
        <stop offset="40%" stop-color="#6ee7b7" />
        <stop offset="100%" stop-color="#10b981" />
      </radialGradient>
      <radialGradient :id="`${uid}-coin`" cx="0.38" cy="0.32" r="0.75">
        <stop offset="0%" stop-color="#fef9c3" />
        <stop offset="35%" stop-color="#fcd34d" />
        <stop offset="80%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      </radialGradient>
      <linearGradient :id="`${uid}-jet`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d1fae5" />
        <stop offset="35%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#34d399" stop-opacity="0" />
      </linearGradient>
      <filter :id="`${uid}-glow`" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter :id="`${uid}-coin-glow`" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath :id="`${uid}-screen-clip`">
        <rect x="35" y="26" width="50" height="36" rx="15" />
      </clipPath>
    </defs>

    <!-- ground shadow -->
    <ellipse class="shadow" cx="60" cy="144" rx="19" ry="3.5" fill="currentColor" opacity="0.2" />

    <g class="hover-body">
      <!-- jet glow -->
      <path class="flame" d="M54,110 Q60,132 66,110 Z" :fill="`url(#${uid}-jet)`" :filter="`url(#${uid}-glow)`" />

      <!-- left arm (waves) -->
      <g class="arm arm-left">
        <line x1="40" y1="78" x2="31" y2="93" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" />
        <line x1="40" y1="78" x2="31" y2="93" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6" />
        <circle cx="30" cy="95" r="6" :fill="`url(#${uid}-blue)`" />
        <circle cx="28.5" cy="93.2" r="1.6" fill="#ffffff" opacity="0.6" />
      </g>

      <!-- body -->
      <rect x="38" y="64" width="44" height="42" rx="21" :fill="`url(#${uid}-shell)`" />
      <rect x="38" y="64" width="44" height="42" rx="21" fill="none" stroke="#93c5fd" stroke-width="1" opacity="0.55" />
      <ellipse cx="49" cy="74" rx="6" ry="3.2" fill="#ffffff" opacity="0.9" transform="rotate(-25 49 74)" />
      <!-- chest panel -->
      <rect x="48" y="78" width="24" height="16" rx="8" :fill="`url(#${uid}-blue)`" />
      <polyline
        class="chest-chart"
        points="52,90 56,86 59,88 63,83 68,81"
        fill="none"
        stroke="#34d399"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :filter="`url(#${uid}-glow)`"
      />
      <!-- base + nozzle -->
      <path d="M45,100 Q60,110 75,100 L73,105 Q60,113 47,105 Z" :fill="`url(#${uid}-blue)`" />
      <rect x="54" y="105" width="12" height="5" rx="2.5" fill="#0f172a" />
      <rect x="56" y="108" width="8" height="2" rx="1" fill="#34d399" :filter="`url(#${uid}-glow)`" />

      <!-- right arm holding the coin -->
      <g class="arm arm-right">
        <g class="coin" :filter="`url(#${uid}-coin-glow)`">
          <circle cx="104" cy="56" r="11.5" :fill="`url(#${uid}-coin)`" />
          <circle cx="104" cy="56" r="8.5" fill="none" stroke="#fde68a" stroke-width="1.1" opacity="0.9" />
          <polyline
            points="98,60.5 101,57.5 103.5,59 107,54 109.5,52"
            fill="none"
            stroke="#065f46"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M107.3,51.3 L110.4,51.2 L110,54.3" fill="none" stroke="#065f46" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <ellipse cx="100" cy="51" rx="3" ry="1.6" fill="#ffffff" opacity="0.8" transform="rotate(-35 100 51)" />
        </g>
        <path class="sparkle" d="M114,42 l1.2,3 3,1.2 -3,1.2 -1.2,3 -1.2,-3 -3,-1.2 3,-1.2 Z" fill="#fde68a" />
        <line x1="80" y1="78" x2="96" y2="68" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" />
        <line x1="80" y1="78" x2="96" y2="68" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6" />
        <circle cx="98" cy="66.5" r="6" :fill="`url(#${uid}-blue)`" />
        <circle cx="96.5" cy="64.7" r="1.6" fill="#ffffff" opacity="0.6" />
      </g>

      <!-- head -->
      <g class="head">
        <!-- soft contact shadow on the body -->
        <ellipse cx="60" cy="67" rx="20" ry="4" fill="#0f172a" opacity="0.12" />

        <!-- antenna -->
        <line x1="60" y1="17" x2="60" y2="8" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" />
        <circle class="antenna-tip" cx="60" cy="6" r="3.6" fill="#34d399" :filter="`url(#${uid}-glow)`" />

        <!-- ear caps -->
        <circle cx="28" cy="43" r="7.5" :fill="`url(#${uid}-blue)`" />
        <circle cx="28" cy="43" r="3" fill="#34d399" :filter="`url(#${uid}-glow)`" />
        <circle cx="92" cy="43" r="7.5" :fill="`url(#${uid}-blue)`" />
        <circle cx="92" cy="43" r="3" fill="#34d399" :filter="`url(#${uid}-glow)`" />

        <!-- shell -->
        <rect x="27" y="16" width="66" height="54" rx="26" :fill="`url(#${uid}-shell)`" />
        <rect x="27" y="16" width="66" height="54" rx="26" fill="none" stroke="#93c5fd" stroke-width="1" opacity="0.55" />
        <ellipse cx="40" cy="22.5" rx="9" ry="3.5" fill="#ffffff" opacity="0.95" transform="rotate(-18 40 22.5)" />

        <!-- face screen -->
        <rect x="35" y="26" width="50" height="36" rx="15" :fill="`url(#${uid}-screen)`" />
        <rect x="35" y="26" width="50" height="36" rx="15" fill="none" stroke="#1e3a8a" stroke-width="1.4" />

        <g :clip-path="`url(#${uid}-screen-clip)`">
          <g class="face" :filter="`url(#${uid}-glow)`">
            <template v-if="state === 'happy'">
              <path d="M45,44 Q50,36 55,44" fill="none" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round" />
              <path d="M65,44 Q70,36 75,44" fill="none" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round" />
              <path d="M51,50 Q60,59 69,50" fill="none" stroke="#6ee7b7" stroke-width="2.4" stroke-linecap="round" />
            </template>
            <template v-else-if="state === 'sad'">
              <ellipse cx="50" cy="43" rx="4.5" ry="5" fill="#93c5fd" />
              <ellipse cx="70" cy="43" rx="4.5" ry="5" fill="#93c5fd" />
              <path d="M45,36 L54,38.5" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" />
              <path d="M75,36 L66,38.5" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" />
              <path d="M54,55 Q60,51 66,55" fill="none" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round" />
            </template>
            <template v-else>
              <g class="eyes">
                <ellipse class="eye" cx="50" cy="42" rx="5.5" ry="7" :fill="`url(#${uid}-eye)`" />
                <ellipse class="eye" cx="70" cy="42" rx="5.5" ry="7" :fill="`url(#${uid}-eye)`" />
                <circle cx="52" cy="39" r="1.7" fill="#ffffff" />
                <circle cx="72" cy="39" r="1.7" fill="#ffffff" />
              </g>
              <path d="M53,52 Q60,58 67,52" fill="none" stroke="#6ee7b7" stroke-width="2.2" stroke-linecap="round" />
            </template>
          </g>

          <!-- cheeks -->
          <ellipse cx="42" cy="51" rx="3.5" ry="2" fill="#60a5fa" opacity="0.35" />
          <ellipse cx="78" cy="51" rx="3.5" ry="2" fill="#60a5fa" opacity="0.35" />

          <!-- scanning beam while thinking -->
          <rect v-if="state === 'thinking'" class="scan" x="35" y="26" width="6" height="36" fill="#34d399" opacity="0.45" />

          <!-- glass reflection -->
          <path d="M40,29 L50,29 L42,46 L37,46 Z" fill="#ffffff" opacity="0.07" />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
export type RobotState = 'idle' | 'wave' | 'fly' | 'listening' | 'thinking' | 'happy' | 'sad'

withDefaults(defineProps<{ state?: RobotState }>(), { state: 'idle' })

// Each instance needs its own gradient/filter ids — the header avatar and the
// floating robot are on the page at the same time.
const uid = `robot-${useId()}`
</script>

<style scoped>
.robot * {
  transform-box: fill-box;
}

.hover-body {
  transform-box: view-box;
  animation: hover-float 3.2s ease-in-out infinite;
}
.shadow {
  transform-origin: center;
  animation: shadow-pulse 3.2s ease-in-out infinite;
}
.flame {
  transform-origin: top center;
  animation: flicker 0.2s ease-in-out infinite alternate;
}
.antenna-tip {
  animation: antenna 1.6s ease-in-out infinite;
}
.coin {
  transform-origin: center;
  animation: coin-glow 2.4s ease-in-out infinite;
}
.sparkle {
  transform-origin: center;
  animation: sparkle 2.4s ease-in-out infinite;
}
.chest-chart {
  animation: antenna 2.4s ease-in-out infinite;
}
.eye {
  transform-origin: center;
  animation: blink 4.5s infinite;
}

/* arms rotate around their shoulder joints */
.arm {
  transform-box: view-box;
  transition: transform 0.35s ease;
}
.arm-left {
  transform-origin: 40px 78px;
}
.arm-right {
  transform-origin: 80px 78px;
}
.head {
  transform-origin: 50% 90%;
  transition: transform 0.4s ease;
}
.eyes {
  transition: transform 0.3s ease;
}

/* states */
.state-wave .arm-left {
  animation: wave 0.9s ease-in-out infinite;
}
.state-wave .head {
  transform: rotate(-4deg);
}
.state-listening .eyes {
  transform: translateX(-3px);
}
.state-listening .head {
  transform: rotate(-3deg);
}
.state-thinking .head {
  animation: think 1.4s ease-in-out infinite;
}
.state-thinking .eyes {
  transform: translateY(-2px);
}
.state-thinking .antenna-tip {
  animation-duration: 0.4s;
}
.scan {
  animation: scan 1.1s ease-in-out infinite alternate;
}
.state-happy .hover-body {
  animation: celebrate 0.7s ease-in-out 3, hover-float 3.2s ease-in-out 2.1s infinite;
}
.state-happy .arm-left {
  transform: rotate(125deg);
}
.state-happy .arm-right {
  transform: rotate(-35deg);
}
.state-happy .coin {
  animation: coin-spin 0.9s ease-in-out 2;
}
.state-sad .head {
  transform: rotate(6deg) translateY(1px);
}
.state-sad .arm-right {
  transform: rotate(30deg);
}
/* flying: boosted jet, coin raised forward */
.state-fly .flame {
  animation: flicker-boost 0.12s ease-in-out infinite alternate;
}
.state-fly .arm-right {
  transform: rotate(-30deg);
}
.state-fly .arm-left {
  transform: rotate(30deg);
}
.state-fly .shadow {
  opacity: 0.06;
}

@keyframes hover-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes shadow-pulse {
  0%, 100% { transform: scaleX(1); opacity: 0.2; }
  50% { transform: scaleX(0.8); opacity: 0.1; }
}
@keyframes flicker {
  from { transform: scaleY(0.85) scaleX(1.05); opacity: 0.8; }
  to { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
}
@keyframes flicker-boost {
  from { transform: scaleY(1.5) scaleX(1.1); opacity: 0.9; }
  to { transform: scaleY(1.9) scaleX(0.95); opacity: 1; }
}
@keyframes antenna {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
@keyframes coin-glow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes coin-spin {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(-1); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(45deg); }
}
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}
@keyframes wave {
  0%, 100% { transform: rotate(105deg); }
  50% { transform: rotate(140deg); }
}
@keyframes think {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes scan {
  from { transform: translateX(0); }
  to { transform: translateX(44px); }
}
@keyframes celebrate {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

@media (prefers-reduced-motion: reduce) {
  .robot *,
  .hover-body {
    animation: none !important;
  }
}
</style>
