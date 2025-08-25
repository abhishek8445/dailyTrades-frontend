import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler
} from 'chart.js';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

export default function RSIChart({ rsi = [] }) {
  const labels = rsi.map((_, i) => i);
  const currentRSI = rsi[rsi.length - 1] || 0;
  
  const getRSIStatus = (value) => {
    if (value >= 70) return { status: 'Overbought', color: 'text-danger-600', icon: TrendingDown };
    if (value <= 30) return { status: 'Oversold', color: 'text-success-600', icon: TrendingUp };
    return { status: 'Neutral', color: 'text-gray-600', icon: Activity };
  };

  const rsiStatus = getRSIStatus(currentRSI);
  const StatusIcon = rsiStatus.icon;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'RSI(14)',
        data: rsi,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `RSI: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          maxTicksLimit: 10,
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  // Custom plugin to draw RSI levels
  const rsiLevelsPlugin = {
    id: 'rsiLevels',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart;
      
      // Draw overbought line (70)
      const overboughtY = y.getPixelForValue(70);
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(left, overboughtY);
      ctx.lineTo(right, overboughtY);
      ctx.stroke();
      
      // Draw oversold line (30)
      const oversoldY = y.getPixelForValue(30);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.moveTo(left, oversoldY);
      ctx.lineTo(right, oversoldY);
      ctx.stroke();
      
      ctx.restore();
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Relative Strength Index</h3>
            <p className="text-sm text-gray-500">14-period momentum oscillator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${rsiStatus.color}`} />
            <span className={`text-sm font-medium ${rsiStatus.color}`}>
              {rsiStatus.status}
            </span>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium text-gray-900">
              RSI: {currentRSI.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {rsi.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No RSI data available</p>
          </div>
        </div>
      ) : (
        <div className="h-64 sm:h-80">
          <Line data={chartData} options={chartOptions} plugins={[rsiLevelsPlugin]} />
        </div>
      )}

      {/* RSI Level Indicators */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-0.5 bg-success-500 opacity-50"></div>
          <span className="text-gray-600">Oversold (30)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Overbought (70)</span>
          <div className="w-3 h-0.5 bg-danger-500 opacity-50"></div>
        </div>
      </div>
    </div>
  );
}