import React, { useEffect, useState } from 'react';
import { api, setToken } from './api.js';
import LoginForm from './components/LoginForm.jsx';
import StockChart from './components/StockChart.jsx';
import RSIChart from './components/RSIChart.jsx';
import RiskRewardTable from './components/RiskRewardTable.jsx';

import { RefreshCw, TrendingUp, Target, AlertCircle, LogOut } from 'lucide-react';

export default function App() {
  const [token, setTok] = useState(localStorage.getItem('token'));
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);

  const stockOptions = [
    'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
    'SBIN.NS', 'BHARTIARTL.NS', 'HINDUNILVR.NS', 'ITC.NS', 'LT.NS'
  ];

  // update axios auth token whenever it changes
  useEffect(() => { setToken(token); }, [token]);

  // fetch indicators when symbol changes
  useEffect(() => {
    if (!symbol || !token) return;
    setLoading(true);
    api.get(`/stock/${encodeURIComponent(symbol)}/indicators`)
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [symbol, token]);

  // handle ingest (refresh data)
  const handleIngest = async () => {
    setIngestLoading(true);
    try {
      await api.post(`/stock/ingest/${encodeURIComponent(symbol)}`);
      const response = await api.get(`/stock/${encodeURIComponent(symbol)}/indicators`);
      setData(response.data);
      alert('Stock data refreshed successfully!');
    } catch (e) {
      alert('Data refresh failed. Please ensure you are logged in.');
    } finally {
      setIngestLoading(false);
    }
  };

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setTok(null);
    setData(null);
  };

  const candles = data?.candles ?? [];
  const lastCandleIndex = candles.length - 1;
  const riskReward = data?.riskReward;

  const getRiskRewardColor = (ratio) => {
    if (ratio >= 2) return 'text-green-600 bg-green-50 border-green-200';
    if (ratio >= 1.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (ratio >= 1) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // 🚨 Show only LoginForm if not logged in
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <LoginForm
          onLogin={(t) => {
            localStorage.setItem('token', t);
            setTok(t);
          }}
        />
      </div>
    );
  }

  // 🚨 Show full dashboard only when logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              DailyTrades Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced risk/reward analysis for Indian stocks
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stock Selection and Controls */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Stock
              </label>
              <select
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                {stockOptions.map(s => (
                  <option key={s} value={s}>
                    {s.replace('.NS', '')} - NSE
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleIngest}
                disabled={ingestLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ingestLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card mb-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-lg text-gray-600">
                  Loading {symbol.replace('.NS', '')} data...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Analysis */}
        {data && !loading && (
          <div className="space-y-6">
            <StockChart candles={candles} ema={data.ema} highlightIndex={lastCandleIndex} />
            <RSIChart rsi={data.rsi14} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk/Reward Analysis */}
              <div className="card">
                {/* ... same as before ... */}
              </div>

              {/* Top 500 Table */}
              <div className="lg:col-span-1">
                <RiskRewardTable />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
