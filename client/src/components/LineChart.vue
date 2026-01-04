<template>
  <div class="line-chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
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
  data: { type: Array, default: () => [] },
  color: { type: String, default: '#0A84FF' },
  label: { type: String, default: '' },
  height: { type: Number, default: 200 },
  fill: { type: Boolean, default: true },
  showLegend: { type: Boolean, default: false }
});

const chartData = computed(() => ({
  labels: props.data.map(d => d.label),
  datasets: [{
    label: props.label,
    data: props.data.map(d => d.value),
    borderColor: props.color,
    backgroundColor: props.fill ? `${props.color}20` : 'transparent',
    tension: 0.4,
    fill: props.fill,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: props.color
  }]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: props.showLegend },
    tooltip: {
      backgroundColor: 'rgba(28, 28, 30, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#38383A',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
      ticks: { color: '#8E8E93', font: { size: 10 } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
      ticks: { color: '#8E8E93', font: { size: 10 } },
      beginAtZero: true
    }
  }
}));
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
}
</style>
