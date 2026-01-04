<template>
  <div class="progress-ring" :style="containerStyle">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- Gradient definitions -->
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="gradientStart" />
          <stop offset="100%" :stop-color="gradientEnd" />
        </linearGradient>
      </defs>
      
      <!-- Background ring (track) -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
        class="progress-ring__track"
      />
      
      <!-- Progress ring -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="`url(#${gradientId})`"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="animatedDashOffset"
        stroke-linecap="round"
        class="progress-ring__progress"
        :style="progressStyle"
      />
    </svg>
    
    <!-- Center content slot -->
    <div class="progress-ring__content">
      <slot>
        <span v-if="showTime" class="progress-ring__time">{{ formattedTime }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  // Total duration in seconds
  duration: {
    type: Number,
    default: 1500 // 25 minutes default
  },
  // Remaining time in seconds
  remaining: {
    type: Number,
    default: 1500
  },
  // Ring color (string or gradient object)
  color: {
    type: [String, Object],
    default: '#FF2D55'
  },
  // Ring thickness (px)
  strokeWidth: {
    type: Number,
    default: 12
  },
  // Ring size (px)
  size: {
    type: Number,
    default: 200
  },
  // Track color (background ring)
  trackColor: {
    type: String,
    default: '#2C2C2E'
  },
  // Show formatted time in center
  showTime: {
    type: Boolean,
    default: true
  },
  // Enable smooth countdown animation
  animated: {
    type: Boolean,
    default: true
  }
});

// Unique ID for gradient
const gradientId = ref(`progress-gradient-${Math.random().toString(36).substr(2, 9)}`);

// Animation state
const animatedDashOffset = ref(0);
let animationFrame = null;

// Computed properties
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

// Calculate progress (0-1) based on remaining time
const progress = computed(() => {
  if (props.duration <= 0) return 0;
  return Math.max(0, Math.min(1, props.remaining / props.duration));
});

// Target dash offset
const targetDashOffset = computed(() => {
  return circumference.value * (1 - progress.value);
});

// Format time as MM:SS
const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, Math.ceil(props.remaining));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Gradient colors
const gradientStart = computed(() => {
  if (typeof props.color === 'object' && props.color.start) {
    return props.color.start;
  }
  return props.color;
});

const gradientEnd = computed(() => {
  if (typeof props.color === 'object' && props.color.end) {
    return props.color.end;
  }
  return props.color;
});

// Container style
const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}));

// Progress ring style
const progressStyle = computed(() => ({
  transform: 'rotate(-90deg)',
  transformOrigin: 'center',
  transition: props.animated ? 'stroke-dashoffset 0.5s ease-out' : 'none'
}));

// Watch for changes and animate
watch(targetDashOffset, (newVal) => {
  if (props.animated) {
    animatedDashOffset.value = newVal;
  } else {
    animatedDashOffset.value = newVal;
  }
}, { immediate: true });

// Initialize
onMounted(() => {
  animatedDashOffset.value = targetDashOffset.value;
});

// Cleanup
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});

// Expose for testing
defineExpose({
  progress,
  formattedTime
});
</script>


<style scoped lang="scss">
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &__track {
    opacity: 0.3;
  }
  
  &__progress {
    will-change: stroke-dashoffset;
  }
  
  &__content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  &__time {
    font-size: 48px;
    font-weight: 300;
    color: #FFFFFF;
    font-variant-numeric: tabular-nums;
    letter-spacing: -1px;
  }
}
</style>
