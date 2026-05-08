import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Activity, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsOverview = () => {
  const [speedData, setSpeedData] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const handleSpeedUpdate = (e) => {
      setSpeedData(prev => [...prev, e.detail.speed].slice(-30));
      setLabels(prev => [...prev, e.detail.timestamp].slice(-30));
    };

    window.addEventListener('iss-speed-update', handleSpeedUpdate);
    return () => window.removeEventListener('iss-speed-update', handleSpeedUpdate);
  }, []);

  const lineChartData = {
    labels: labels.length > 0 ? labels : Array(10).fill(''),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: speedData.length > 0 ? speedData : Array(10).fill(27600),
        borderColor: '#ff4d4d',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        segment: {
          borderColor: (ctx) => '#ff4d4d',
        },
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 10 },
        bodyFont: { size: 12, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { 
        min: 27000, 
        max: 28200,
        grid: { color: 'rgba(238, 228, 218, 0.5)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 10 }, padding: 10 }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: '#94a3b8', 
          font: { size: 9 }, 
          maxRotation: 45, 
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    }
  };

  return (
    <div className="bg-[#fff9f5] dark:bg-gray-800 rounded-3xl border border-[#eee4da] dark:border-gray-700 p-6 flex flex-col h-full shadow-lg transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#2c3e50] dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" /> ISS Speed Trend
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Feed</span>
        </div>
      </div>
      <div className="flex-1 min-h-[350px] relative">
        <Line data={lineChartData} options={lineOptions} />
      </div>
    </div>
  );
};

export default ChartsOverview;
