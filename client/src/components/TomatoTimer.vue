<template>
  <div class="tomato-timer" :class="{ 'tomato-timer--celebrating': isCelebrating }">
    <!-- Tomato SVG Background -->
    <div class="tomato-timer__tomato">
      <svg viewBox="0 0 200 200" class="tomato-timer__svg">
        <!-- Tomato body -->
        <ellipse
          cx="100"
          cy="110"
          rx="75"
          ry="70"
          :fill="tomatoColor"
          class="tomato-timer__body"
        />
        <!-- Tomato highlight -->
        <ellipse
          cx="70"
          cy="90"
          rx="20"
          ry="15"
          fill="rgba(255, 255, 255, 0.2)"
          class="tomato-timer__highlight"
        />
        <!-- Tomato stem -->
        <path
          d="M95 45 Q100 35 105 45 L105 55 Q100 50 95 55 Z"
          fill="#30D158"
          class="tomato-timer__stem"
        />
        <!-- Tomato leaves -->
        <path
          d="M85 50 Q70 40 75 55 Q85 50 85 50"
          fill="#30D158"
          class="tomato-timer__leaf"
        />
        <path
          d="M115 50 Q130 40 125 55 Q115 50 115 50"
          fill="#30D158"
          class="tomato-timer__leaf"
        />
      </svg>
    </div>
    
    <!-- Progress Ring overlay -->
    <div class="tomato-timer__ring">
      <ProgressRing
        :duration="duration"
        :remaining="remaining"
        :color="ringColor"
        :size="ringSize"
        :stroke-width="8"
        :show-time="false"
        :animated="true"
      />
    </div>
    
    <!-- Timer display -->
    <div class="tomato-timer__display">
      <span class="tomato-timer__time">{{ formattedTime }}</span>
      <span class="tomato-timer__label">{{ statusLabel }}</span>
    </div>
    
    <!-- Celebration particles -->
    <div v-if="isCelebrating" class="tomato-timer__celebration">
      <div
        v-for="i in 12"
        :key="i"
        class="tomato-timer__particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import ProgressRing from './ProgressRing.vue';

const props = defineProps({
  // Total duration in seconds
  duration: {
    type: Number,
    default: 1500 // 25 minutes
  },
  // Remaining time in seconds
  remaining: {
    type: Number,
    default: 1500
  },
  // Timer state
  isRunning: {
    type: Boolean,
    default: false
  },
  // Is break time
  isBreak: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['complete']);

// Celebration state
const isCelebrating = ref(false);

// Ring size based on container
const ringSize = 180;

// Computed properties
const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, Math.ceil(props.remaining));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const statusLabel = computed(() => {
  if (props.isBreak) {
    return '休息時間';
  }
  if (props.isRunning) {
    return '專注中';
  }
  return '準備開始';
});

// Tomato color changes based on state
const tomatoColor = computed(() => {
  if (props.isBreak) {
    return '#30D158'; // Green for break
  }
  if (props.isRunning) {
    return '#FF2D55'; // Red when running
  }
  return '#FF6B6B'; // Lighter red when paused
});

// Ring color
const ringColor = computed(() => {
  if (props.isBreak) {
    return { start: '#30D158', end: '#34C759' };
  }
  return { start: '#FF2D55', end: '#FF9500' };
});

// Watch for completion
watch(() => props.remaining, (newVal, oldVal) => {
  if (oldVal > 0 && newVal <= 0) {
    triggerCelebration();
  }
});

// Celebration animation
const triggerCelebration = () => {
  isCelebrating.value = true;
  emit('complete');
  
  setTimeout(() => {
    isCelebrating.value = false;
  }, 2000);
};

// Generate particle styles for celebration
const getParticleStyle = (index) => {
  const angle = (index / 12) * 360;
  const colors = ['#FF2D55', '#FF9500', '#30D158', '#0A84FF', '#BF5AF2', '#FFD60A'];
  const color = colors[index % colors.length];
  
  return {
    '--angle': `${angle}deg`,
    '--color': color,
    '--delay': `${index * 0.05}s`
  };
};

// Expose for testing
defineExpose({
  isCelebrating,
  triggerCelebration,
  formattedTime
});
</script>


<style scoped lang="scss">
.tomato-timer {
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &--celebrating {
    .tomato-timer__tomato {
      animation: tomato-bounce 0.5s ease-out;
    }
  }
  
  &__tomato {
    position: absolute;
    width: 160px;
    height: 160px;
    z-index: 1;
  }
  
  &__svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(255, 45, 85, 0.3));
  }
  
  &__body {
    transition: fill 0.3s ease;
  }
  
  &__ring {
    position: absolute;
    z-index: 2;
  }
  
  &__display {
    position: absolute;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  &__time {
    font-size: 36px;
    font-weight: 300;
    color: #FFFFFF;
    font-variant-numeric: tabular-nums;
    letter-spacing: -1px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
  
  &__label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  &__celebration {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }
  
  &__particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: particle-explode 1s ease-out var(--delay) forwards;
  }
}

@keyframes tomato-bounce {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.05);
  }
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-100px);
  }
}
</style>
