import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { TrendingUp, ArrowUpDown, Search } from 'lucide-react';

export default function RiskRewardTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('ratio');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    setLoading(true);
    api.get('/stock/top500')
      .then(r => setRows(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSortedRows = React.useMemo(() => {
    let filtered = rows.filter(row => 
      row.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [rows, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRatioColor = (ratio) => {
    if (ratio >= 2) return 'text-success-600 bg-success-50';
    if (ratio >= 1.5) return 'text-yellow-600 bg-yellow-50';
    if (ratio >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-danger-600 bg-danger-50';
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top 500 Risk/Reward</h3>
            <p className="text-sm text-gray-500">Sorted by R/R ratio</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading market data...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('symbol')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      Symbol
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('close')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors ml-auto"
                    >
                      Close Price
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('ratio')}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors ml-auto"
                    >
                      R/R Ratio
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedRows.map((row, index) => (
                  <tr 
                    key={row.symbol} 
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {row.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{row.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-900">
                        ₹{row.close?.toFixed?.(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatioColor(row.ratio ?? 0)}`}>
                        {(row.ratio ?? 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedRows.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No stocks found matching your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}