<template>
  <div class="activity-ring" :style="containerStyle">
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
        class="activity-ring__track"
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
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="activity-ring__progress"
        :class="{ 'activity-ring__progress--animated': animated }"
        :style="progressStyle"
      />
    </svg>
    
    <!-- Center content -->
    <div class="activity-ring__content">
      <span v-if="label" class="activity-ring__label">{{ label }}</span>
      <span v-if="sublabel" class="activity-ring__sublabel">{{ sublabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
  // Progress value (0-100)
  progress: {
    type: Number,
    default: 0,
    validator: (val) => val >= 0
  },
  // Ring color (string or gradient object)
  color: {
    type: [String, Object],
    default: '#FF2D55'
  },
  // Ring thickness (px)
  strokeWidth: {
    type: Number,
    default: 20
  },
  // Ring size (px)
  size: {
    type: Number,
    default: 200
  },
  // Enable animation
  animated: {
    type: Boolean,
    default: true
  },
  // Center label
  label: {
    type: String,
    default: ''
  },
  // Sub label
  sublabel: {
    type: String,
    default: ''
  },
  // Track color (background ring)
  trackColor: {
    type: String,
    default: '#2C2C2E'
  }
});

// Unique ID for gradient
const gradientId = ref(`ring-gradient-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

// Calculate progress percentage (capped at 100%)
const normalizedProgress = computed(() => {
  return Math.min(100, Math.max(0, props.progress));
});

// Calculate dash offset for progress
const dashOffset = computed(() => {
  const progressRatio = normalizedProgress.value / 100;
  return circumference.value * (1 - progressRatio);
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
  transformOrigin: 'center'
}));

// Expose calculation function for testing
defineExpose({
  normalizedProgress,
  calculateProgress: (current, target) => {
    if (target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  }
});
</script>


<style scoped lang="scss">
.activity-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &__track {
    opacity: 0.3;
  }
  
  &__progress {
    transition: stroke-dashoffset 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
    
    &--animated {
      animation: ring-appear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
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
  
  &__label {
    font-size: 28px;
    font-weight: 600;
    color: #FFFFFF;
    line-height: 1.2;
  }
  
  &__sublabel {
    font-size: 13px;
    color: #8E8E93;
    margin-top: 4px;
  }
}

@keyframes ring-appear {
  from {
    stroke-dashoffset: var(--circumference, 565);
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
