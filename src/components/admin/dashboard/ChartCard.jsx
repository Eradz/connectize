import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartCard = ({ title, subtitle, type = "line", data: customData }) => {
  // Mock data - replace with real data
  const defaultLineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: [1200, 1900, 3000, 5000, 4200, 6200],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const defaultBarData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 30000, 50000, 42000, 62000],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const defaultDoughnutData = {
    labels: ["Products", "Services", "Posts"],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: type !== "doughnut" ? {
      y: {
        beginAtZero: true,
      },
    } : {},
  };

  const getChartData = () => {
    if (customData) return customData;
    
    switch (type) {
      case "bar":
        return defaultBarData;
      case "doughnut":
        return defaultDoughnutData;
      default:
        return defaultLineData;
    }
  };

  const renderChart = () => {
    const data = getChartData();
    
    switch (type) {
      case "bar":
        return <Bar data={data} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;
