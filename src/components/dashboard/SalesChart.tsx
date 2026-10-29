import React, { useState } from 'react';
import { Transaction } from '../../types/pos';
import { formatRupiah, formatNumber } from '../../utils/format';
import { Calendar, Download, TrendingUp } from 'lucide-react';

interface SalesChartProps {
  transactions: Transaction[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ transactions }) => {
  const [filterMode, setFilterMode] = useState<'daily' | 'hourly' | 'monthly'>('daily');
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    profit: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Group transactions based on selected filter
  const getChartData = () => {
    if (filterMode === 'hourly') {
      // 8AM to 9PM
      const hours = Array.from({ length: 14 }, (_, i) => i + 8);
      const todayStr = new Date().toDateString();
      const todayTxs = transactions.filter((t) => new Date(t.date).toDateString() === todayStr);

      return hours.map((hour) => {
        const txsInHour = todayTxs.filter((t) => new Date(t.date).getHours() === hour);
        const total = txsInHour.reduce((sum, t) => sum + t.total, 0);
        const profit = txsInHour.reduce((sum, t) => sum + t.grossProfit, 0);
        return {
          label: `${String(hour).padStart(2, '0')}:00`,
          value: total,
          profit,
          count: txsInHour.length,
        };
      });
    }

    // Default: Last 7 days or matching the screenshot curve
    const days: { label: string; dateStr: string; value: number; profit: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      const txsInDay = transactions.filter((t) => t.date.startsWith(dateStr));
      const total = txsInDay.reduce((sum, t) => sum + t.total, 0);
      const profit = txsInDay.reduce((sum, t) => sum + t.grossProfit, 0);

      days.push({
        label: displayLabel,
        dateStr,
        value: total,
        profit,
        count: txsInDay.length,
      });
    }
    return days;
  };

  const chartData = getChartData();
  const maxValue = Math.max(1500000, ...chartData.map((d) => d.value)) * 1.15;

  // SVG dimensions
  const width = 850;
  const height = 300;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute point coordinates
  const points = chartData.map((d, index) => {
    const x =
      chartData.length > 1
        ? paddingLeft + (index / (chartData.length - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - (d.value / maxValue) * chartHeight;
    return { ...d, x, y };
  });

  // Construct SVG path for area & line
  const linePath = points.reduce((path, pt, index) => {
    return index === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
          paddingTop + chartHeight
        } Z`
      : '';

  // Y-axis ticks (matching screenshot: 0, 250k, 500k, 750k, 1M, 1.25M, 1.5M)
  const yTicks = [0, 250000, 500000, 750000, 1000000, 1250000, 1500000];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header matching reference design */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-150 bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Grafik Penjualan</h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Analitik Omset & Performa Toko)
          </span>
        </div>

        {/* Filter Tabs & Legend */}
        <div className="flex items-center space-x-3 text-xs mt-2 sm:mt-0">
          {/* Legend badge matching screenshot */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-semibold text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block" />
            <span>Penjualan</span>
          </div>

          <div className="flex bg-slate-200/80 p-0.5 rounded-md text-[11px] font-medium">
            <button
              onClick={() => setFilterMode('daily')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'daily' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setFilterMode('hourly')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterMode === 'hourly' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini (Jam)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative p-2 sm:p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] font-sans"
        >
          <defs>
            {/* Area gradient matching screenshot lavender purple */}
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick) => {
            if (tick > maxValue) return null;
            const y = paddingTop + chartHeight - (tick / maxValue) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick === 0 ? '0' : formatNumber(tick)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#salesGradient)" />
          )}

          {/* Solid Stroke Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#9333ea"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points (circles) */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#ffffff"
                stroke="#9333ea"
                strokeWidth="2.5"
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                fontWeight="500"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs rounded-lg shadow-xl p-2.5 border border-slate-700 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-cyan-300 pb-1 border-b border-slate-700/80 mb-1">
              {hoveredPoint.label}
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between space-x-3">
                <span className="text-slate-300">Penjualan:</span>
                <span className="font-bold text-white">{formatRupiah(hoveredPoint.value)}</span>
              </div>
              <div className="flex justify-between space-x-3">
                <span className="text-slate-300">Laba Kotor:</span>
                <span className="font-bold text-emerald-400">{formatRupiah(hoveredPoint.profit)}</span>
              </div>
              <div className="flex justify-between space-x-3">
                <span className="text-slate-300">Transaksi:</span>
                <span className="font-medium text-slate-200">{hoveredPoint.count} struk</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer with instant insights */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-1 text-slate-700 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          <span>Grafik diperbarui secara otomatis setiap kali transaksi kasir selesai.</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 sm:mt-0 font-mono">
          Periode: {filterMode === 'daily' ? '7 Hari Terakhir' : 'Hari Ini'}
        </div>
      </div>
    </div>
  );
};
