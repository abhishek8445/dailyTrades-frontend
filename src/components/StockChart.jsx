import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend
} from 'chart.js';
import { BarChart3, Eye, EyeOff } from 'lucide-react';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function StockChart({ candles = [], ema = {}, highlightIndex = null }) {
  const [visibleEMAs, setVisibleEMAs] = React.useState({
    close: true,
    ema10: true,
    ema20: true,
    ema50: true,
    ema200: true,
  });

  const labels = candles.map(c => new Date(c.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }));
  
  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1] || 0;
  const previousPrice = closes[closes.length - 2] || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  const datasets = [
    {
      label: 'Close Price',
      data: visibleEMAs.close ? closes : [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.2,
      fill: false,
    },
    {
      label: 'EMA 10',
      data: visibleEMAs.ema10 ? (ema.ema10 || []) : [],
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
      borderDash: [],
    },
    {
      label: 'EMA 20',
      data: visibleEMAs.ema20 ? (ema.ema20 || []) : [],
      borderColor: 'rgb(251, 146, 60)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
    },
    {
      label: 'EMA 50',
      data: visibleEMAs.ema50 ? (ema.ema50 || []) : [],
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
    },
    {
      label: 'EMA 200',
      data: visibleEMAs.ema200 ? (ema.ema200 || []) : [],
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
    },
  ].filter(dataset => dataset.data.length > 0);

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
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
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
          maxTicksLimit: 8,
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          callback: function(value) {
            return '₹' + value.toFixed(0);
          }
        }
      }
    }
  };

  const highlightPlugin = {
    id: 'highlightLast',
    afterDatasetsDraw(chart, args, opts) {
      if (highlightIndex == null) return;
      const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
      const xPos = x.getPixelForValue(highlightIndex);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xPos, top);
      ctx.lineTo(xPos, bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.restore();
    }
  };

  const toggleEMA = (emaType) => {
    setVisibleEMAs(prev => ({
      ...prev,
      [emaType]: !prev[emaType]
    }));
  };

  const emaColors = {
    close: 'bg-blue-500',
    ema10: 'bg-green-500',
    ema20: 'bg-orange-500',
    ema50: 'bg-purple-500',
    ema200: 'bg-red-500',
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Price Chart with EMAs</h3>
              <p className="text-sm text-gray-500">Exponential moving averages overlay</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">₹{currentPrice.toFixed(2)}</span>
              <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                priceChange >= 0 
                  ? 'text-success-700 bg-success-100' 
                  : 'text-danger-700 bg-danger-100'
              }`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} 
                ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* EMA Toggle Controls */}
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {Object.entries(visibleEMAs).map(([emaType, isVisible]) => (
            <button
              key={emaType}
              onClick={() => toggleEMA(emaType)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isVisible 
                  ? 'bg-white shadow-sm border border-gray-200 text-gray-700' 
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${emaColors[emaType]} ${!isVisible ? 'opacity-50' : ''}`}></div>
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {emaType === 'close' ? 'Price' : emaType.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {candles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No price data available</p>
          </div>
        </div>
      ) : (
        <div className="h-72 sm:h-96">
          <Line data={{ labels, datasets }} options={chartOptions} plugins={[highlightPlugin]} />
        </div>
      )}

      {/* Chart Info */}
      {candles.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Period: {labels[0]} - {labels[labels.length - 1]}</span>
            <span>Data Points: {candles.length}</span>
          </div>
          {highlightIndex !== null && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary-500 opacity-50" style={{ borderStyle: 'dashed' }}></div>
              <span>Current Position</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}