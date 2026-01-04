<template>
  <div class="stat-chart" :style="containerStyle">
    <div v-if="title" class="stat-chart__header">
      <span class="stat-chart__title">{{ title }}</span>
      <span v-if="subtitle" class="stat-chart__subtitle">{{ subtitle }}</span>
    </div>
    
    <!-- Bar Chart -->
    <div v-if="type === 'bar'" class="stat-chart__bar-container">
      <div class="stat-chart__bars">
        <div
          v-for="(item, index) in normalizedData"
          :key="index"
          class="stat-chart__bar-wrapper"
        >
          <div
            class="stat-chart__bar"
            :style="getBarStyle(item)"
            :class="{ 'stat-chart__bar--animated': animated }"
          >
            <div class="stat-chart__bar-fill" :style="getBarFillStyle(item)"></div>
          </div>
          <span class="stat-chart__bar-label">{{ item.label }}</span>
        </div>
      </div>
      <div v-if="showValues" class="stat-chart__values">
        <span
          v-for="(item, index) in normalizedData"
          :key="index"
          class="stat-chart__value"
        >
          {{ formatValue(item.value) }}
        </span>
      </div>
    </div>
    
    <!-- Line Chart -->
    <div v-else-if="type === 'line'" class="stat-chart__line-container">
      <svg
        :width="chartWidth"
        :height="chartHeight"
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        class="stat-chart__svg"
      >
        <!-- Grid lines -->
        <g class="stat-chart__grid">
          <line
            v-for="i in 4"
            :key="i"
            :x1="padding"
            :y1="padding + ((chartHeight - padding * 2) / 4) * i"
            :x2="chartWidth - padding"
            :y2="padding + ((chartHeight - padding * 2) / 4) * i"
            stroke="#2C2C2E"
            stroke-width="1"
          />
        </g>
        
        <!-- Gradient definition -->
        <defs>
          <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>
        
        <!-- Area fill -->
        <path
          v-if="linePoints.length > 0"
          :d="areaPath"
          :fill="`url(#${gradientId})`"
          class="stat-chart__area"
        />
        
        <!-- Line -->
        <path
          v-if="linePoints.length > 0"
          :d="linePath"
          fill="none"
          :stroke="color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="stat-chart__line"
          :class="{ 'stat-chart__line--animated': animated }"
        />
        
        <!-- Data points -->
        <g class="stat-chart__points">
          <circle
            v-for="(point, index) in linePoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="color"
            class="stat-chart__point"
          />
        </g>
      </svg>
      
      <!-- X-axis labels -->
      <div class="stat-chart__x-labels">
        <span
          v-for="(item, index) in normalizedData"
          :key="index"
          class="stat-chart__x-label"
        >
          {{ item.label }}
        </span>
      </div>
    </div>
    
    <!-- Ring Chart (mini activity ring) -->
    <div v-else-if="type === 'ring'" class="stat-chart__ring-container">
      <svg :width="ringSize" :height="ringSize" :viewBox="`0 0 ${ringSize} ${ringSize}`">
        <circle
          :cx="ringSize / 2"
          :cy="ringSize / 2"
          :r="ringRadius"
          fill="none"
          stroke="#2C2C2E"
          :stroke-width="ringStrokeWidth"
        />
        <circle
          :cx="ringSize / 2"
          :cy="ringSize / 2"
          :r="ringRadius"
          fill="none"
          :stroke="color"
          :stroke-width="ringStrokeWidth"
          :stroke-dasharray="ringCircumference"
          :stroke-dashoffset="ringDashOffset"
          stroke-linecap="round"
          class="stat-chart__ring-progress"
          :class="{ 'stat-chart__ring-progress--animated': animated }"
        />
      </svg>
      <div class="stat-chart__ring-value">
        <span class="stat-chart__ring-number">{{ ringValue }}</span>
        <span class="stat-chart__ring-unit">{{ ringUnit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (val) => ['bar', 'line', 'ring'].includes(val)
  },
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#FF2D55'
  },
  period: {
    type: String,
    default: 'week',
    validator: (val) => ['week', 'month'].includes(val)
  },
  height: {
    type: Number,
    default: 200
  },
  width: {
    type: Number,
    default: 0 // 0 means auto (100%)
  },
  animated: {
    type: Boolean,
    default: true
  },
  showValues: {
    type: Boolean,
    default: false
  },
  valueFormatter: {
    type: Function,
    default: null
  },
  // Ring specific props
  ringProgress: {
    type: Number,
    default: 0
  },
  ringUnit: {
    type: String,
    default: '%'
  }
});

// Unique ID for gradient
const gradientId = ref(`chart-gradient-${Math.random().toString(36).substr(2, 9)}`);

// Chart dimensions
const padding = 20;
const chartWidth = computed(() => props.width || 300);
const chartHeight = computed(() => props.height);

// Ring dimensions
const ringSize = 80;
const ringStrokeWidth = 8;
const ringRadius = (ringSize - ringStrokeWidth) / 2;
const ringCircumference = 2 * Math.PI * ringRadius;

// Normalize data to ensure consistent structure
const normalizedData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }
  return props.data.map(item => ({
    label: item.label || '',
    value: Number(item.value) || 0
  }));
});

// Calculate max value for scaling
const maxValue = computed(() => {
  if (normalizedData.value.length === 0) return 100;
  const max = Math.max(...normalizedData.value.map(d => d.value));
  return max > 0 ? max : 100;
});

// Container style
const containerStyle = computed(() => ({
  height: props.type === 'ring' ? 'auto' : `${props.height}px`,
  width: props.width ? `${props.width}px` : '100%'
}));

// Bar chart styles
const getBarStyle = (item) => ({
  height: '100%'
});

const getBarFillStyle = (item) => {
  const percentage = maxValue.value > 0 ? (item.value / maxValue.value) * 100 : 0;
  return {
    height: `${Math.min(100, percentage)}%`,
    backgroundColor: props.color
  };
};

// Line chart points calculation
const linePoints = computed(() => {
  if (normalizedData.value.length === 0) return [];
  
  const availableWidth = chartWidth.value - padding * 2;
  const availableHeight = chartHeight.value - padding * 2;
  const stepX = normalizedData.value.length > 1 
    ? availableWidth / (normalizedData.value.length - 1) 
    : 0;
  
  return normalizedData.value.map((item, index) => {
    const x = padding + stepX * index;
    const normalizedValue = maxValue.value > 0 ? item.value / maxValue.value : 0;
    const y = padding + availableHeight * (1 - normalizedValue);
    return { x, y, value: item.value };
  });
});

// Line path for SVG
const linePath = computed(() => {
  if (linePoints.value.length === 0) return '';
  return linePoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
});

// Area path for SVG (filled area under line)
const areaPath = computed(() => {
  if (linePoints.value.length === 0) return '';
  const bottomY = chartHeight.value - padding;
  const firstPoint = linePoints.value[0];
  const lastPoint = linePoints.value[linePoints.value.length - 1];
  
  return `${linePath.value} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
});

// Ring chart calculations
const ringValue = computed(() => {
  return Math.round(props.ringProgress);
});

const ringDashOffset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.ringProgress));
  return ringCircumference * (1 - progress / 100);
});

// Format value for display
const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value);
  }
  return value;
};

// Expose for testing
defineExpose({
  normalizedData,
  maxValue,
  linePoints,
  calculateTrendSum: (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  },
  calculateTrendAverage: (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return sum / data.length;
  },
  calculateCompletionRate: (completed, total) => {
    if (total <= 0) return 0;
    return Math.round((completed / total) * 100);
  }
});
</script>


<style scoped lang="scss">
.stat-chart {
  background: #1C1C1E;
  border-radius: 12px;
  padding: 16px;
  
  &__header {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #FFFFFF;
  }
  
  &__subtitle {
    font-size: 12px;
    color: #8E8E93;
    margin-top: 2px;
  }
  
  // Bar Chart Styles
  &__bar-container {
    display: flex;
    flex-direction: column;
    height: calc(100% - 40px);
  }
  
  &__bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex: 1;
    gap: 8px;
    padding-bottom: 24px;
  }
  
  &__bar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    height: 100%;
  }
  
  &__bar {
    width: 100%;
    max-width: 32px;
    height: 100%;
    background: #2C2C2E;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  
  &__bar-fill {
    width: 100%;
    border-radius: 4px;
    transition: height 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  &__bar--animated &__bar-fill {
    animation: bar-grow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  &__bar-label {
    font-size: 10px;
    color: #8E8E93;
    margin-top: 8px;
    text-align: center;
  }
  
  &__values {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  &__value {
    font-size: 11px;
    color: #FFFFFF;
    text-align: center;
    flex: 1;
  }
  
  // Line Chart Styles
  &__line-container {
    display: flex;
    flex-direction: column;
  }
  
  &__svg {
    width: 100%;
    height: auto;
  }
  
  &__grid line {
    opacity: 0.5;
  }
  
  &__area {
    opacity: 0.8;
  }
  
  &__line {
    transition: stroke-dashoffset 0.5s ease;
    
    &--animated {
      animation: line-draw 1s ease-out;
    }
  }
  
  &__point {
    transition: r 0.2s ease;
    
    &:hover {
      r: 6;
    }
  }
  
  &__x-labels {
    display: flex;
    justify-content: space-between;
    padding: 8px 20px 0;
  }
  
  &__x-label {
    font-size: 10px;
    color: #8E8E93;
    text-align: center;
  }
  
  // Ring Chart Styles
  &__ring-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  &__ring-progress {
    transform: rotate(-90deg);
    transform-origin: center;
    transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    
    &--animated {
      animation: ring-fill 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  }
  
  &__ring-value {
    display: flex;
    flex-direction: column;
  }
  
  &__ring-number {
    font-size: 28px;
    font-weight: 600;
    color: #FFFFFF;
    line-height: 1;
  }
  
  &__ring-unit {
    font-size: 13px;
    color: #8E8E93;
    margin-top: 4px;
  }
}

@keyframes bar-grow {
  from {
    height: 0;
  }
}

@keyframes line-draw {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes ring-fill {
  from {
    stroke-dashoffset: var(--circumference, 226);
  }
}
</style>
