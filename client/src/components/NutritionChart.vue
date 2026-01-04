<template>
  <div class="nutrition-chart-container">
    <div class="chart-header">
      <div class="chart-title">
        <q-icon name="trending_up" size="20px" color="warning" />
        <span>營養攝取趨勢</span>
      </div>
      <q-btn-toggle
        v-model="period"
        toggle-color="warning"
        :options="[
          { label: '7 天', value: 'week' },
          { label: '30 天', value: 'month' }
        ]"
        unelevated
        dense
        class="period-toggle"
        @update:model-value="$emit('period-change', $event)"
      />
    </div>

    <div class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-dot" style="background: #FF9500"></span>
        <span class="legend-label">熱量</span>
        <span class="legend-value">{{ summary.avgCalories }} 大卡/日</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #FF2D55"></span>
        <span class="legend-label">蛋白質</span>
        <span class="legend-value">{{ summary.avgProtein }}g/日</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #0A84FF"></span>
        <span class="legend-label">脂肪</span>
        <span class="legend-value">{{ summary.avgFat }}g/日</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: #30D158"></span>
        <span class="legend-label">碳水</span>
        <span class="legend-value">{{ summary.avgCarb }}g/日</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  initialPeriod: {
    type: String,
    default: 'week'
  }
});

defineEmits(['period-change']);

const period = ref(props.initialPeriod);

const summary = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { avgCalories: 0, avgProtein: 0, avgFat: 0, avgCarb: 0 };
  }
  const len = props.data.length;
  return {
    avgCalories: Math.round(props.data.reduce((sum, d) => sum + (d.calories || 0), 0) / len),
    avgProtein: Math.round(props.data.reduce((sum, d) => sum + (d.protein || 0), 0) / len),
    avgFat: Math.round(props.data.reduce((sum, d) => sum + (d.fat || 0), 0) / len),
    avgCarb: Math.round(props.data.reduce((sum, d) => sum + (d.carb || 0), 0) / len)
  };
});

const chartData = computed(() => {
  const labels = props.data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  return {
    labels,
    datasets: [
      {
        label: '熱量',
        data: props.data.map(d => d.calories || 0),
        borderColor: '#FF9500',
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: '蛋白質',
        data: props.data.map(d => d.protein || 0),
        borderColor: '#FF2D55',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: '脂肪',
        data: props.data.map(d => d.fat || 0),
        borderColor: '#0A84FF',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: '碳水',
        data: props.data.map(d => d.carb || 0),
        borderColor: '#30D158',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(28, 28, 30, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#38383A',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label;
          const value = context.parsed.y;
          if (label === '熱量') return `${label}: ${value} 大卡`;
          return `${label}: ${value}g`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#8E8E93',
        font: { size: 11 }
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: '熱量 (大卡)',
        color: '#FF9500',
        font: { size: 11 }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#8E8E93',
        font: { size: 11 }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: '營養素 (g)',
        color: '#8E8E93',
        font: { size: 11 }
      },
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        color: '#8E8E93',
        font: { size: 11 }
      }
    }
  }
};
</script>

<style scoped>
.nutrition-chart-container {
  background: var(--bg-secondary, #1C1C1E);
  border: 1px solid var(--border-color, #38383A);
  border-radius: 16px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.period-toggle {
  border-radius: 8px;
  overflow: hidden;
}

.chart-wrapper {
  height: 280px;
  margin-bottom: 20px;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg-tertiary, #2C2C2E);
  border-radius: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-label {
  font-size: 12px;
  color: #8E8E93;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

@media (max-width: 600px) {
  .chart-legend {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-wrapper {
    height: 220px;
  }
}
</style>
