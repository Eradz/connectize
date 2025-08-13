import React from 'react';
import { Line, Bar, Doughnut, Area } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const ChartContainer = ({ children, title, subtitle, height = 300 }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    {title && (
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    )}
    <div style={{ height: `${height}px` }}>
      {children}
    </div>
  </div>
);

const LineChart = ({ data, options = {}, title, subtitle, height }) => (
  <ChartContainer title={title} subtitle={subtitle} height={height}>
    <Line data={data} options={{ ...defaultOptions, ...options }} />
  </ChartContainer>
);

const BarChart = ({ data, options = {}, title, subtitle, height }) => (
  <ChartContainer title={title} subtitle={subtitle} height={height}>
    <Bar data={data} options={{ ...defaultOptions, ...options }} />
  </ChartContainer>
);

const DoughnutChart = ({ data, options = {}, title, subtitle, height }) => {
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <Doughnut data={data} options={{ ...doughnutOptions, ...options }} />
    </ChartContainer>
  );
};

const AreaChart = ({ data, options = {}, title, subtitle, height }) => {
  const areaOptions = {
    ...defaultOptions,
    fill: true,
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <Line data={data} options={{ ...areaOptions, ...options }} />
    </ChartContainer>
  );
};

// Utility function to generate chart colors
const generateColors = (count, alpha = 1) => {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`, // blue
    `rgba(16, 185, 129, ${alpha})`, // green
    `rgba(245, 101, 101, ${alpha})`, // red
    `rgba(251, 191, 36, ${alpha})`, // yellow
    `rgba(139, 92, 246, ${alpha})`, // purple
    `rgba(236, 72, 153, ${alpha})`, // pink
    `rgba(6, 182, 212, ${alpha})`, // cyan
    `rgba(34, 197, 94, ${alpha})`, // emerald
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

// Pre-built chart configurations
const userGrowthChart = (labels, data) => ({
  labels,
  datasets: [
    {
      label: 'New Users',
      data,
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
  ],
});

const revenueChart = (labels, data) => ({
  labels,
  datasets: [
    {
      label: 'Revenue ($)',
      data,
      backgroundColor: generateColors(data.length, 0.8),
      borderColor: generateColors(data.length, 1),
      borderWidth: 1,
    },
  ],
});

const categoryDistribution = (labels, data) => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: generateColors(data.length, 0.8),
      borderColor: generateColors(data.length, 1),
      borderWidth: 1,
    },
  ],
});

const activityChart = (labels, datasets) => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: generateColors(1, 1)[0],
    backgroundColor: generateColors(1, 0.1)[0],
    fill: true,
  })),
});

export {
  LineChart,
  BarChart,
  DoughnutChart,
  AreaChart,
  ChartContainer,
  generateColors,
  userGrowthChart,
  revenueChart,
  categoryDistribution,
  activityChart
};
