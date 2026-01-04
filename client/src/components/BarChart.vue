<template>
  <div class="bar-chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  data: { type: Array, default: () => [] },
  color: { type: String, default: '#0A84FF' },
  label: { type: String, default: '' },
  height: { type: Number, default: 200 },
  showLegend: { type: Boolean, default: false }
});

const chartData = computed(() => ({
  labels: props.data.map(d => d.label),
  datasets: [{
    label: props.label,
    data: props.data.map(d => d.value),
    backgroundColor: `${props.color}80`,
    borderColor: props.color,
    borderWidth: 1,
    borderRadius: 4,
    hoverBackgroundColor: props.color
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
      grid: { display: false },
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
.bar-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
}
</style>
