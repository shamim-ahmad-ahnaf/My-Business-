import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { SaleRecord, BusinessExpense, SpoilageRecord } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

interface SalesExpensesChartProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages?: SpoilageRecord[];
}

type TimeRange = '7' | '14' | '30';
type ChartStyle = 'composed' | 'area';

interface DailyDataPoint {
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // e.g. "২২ সেপ (মঙ্গল)"
  shortDate: string; // e.g. "২২ সেপ"
  sales: number;
  expenses: number;
  profit: number;
  cashCollected: number;
  orderCount: number;
}

const MONTH_NAMES_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ', 'অক্টো', 'নভে', 'ডিসে'
];

const DAY_NAMES_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const SalesExpensesChart: React.FC<SalesExpensesChartProps> = ({
  sales,
  expenses,
  spoilages = []
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('composed');

  // Compute daily aggregated data points based on selected range
  const chartData = useMemo(() => {
    const daysCount = parseInt(timeRange, 10);
    const result: DailyDataPoint[] = [];
    const now = new Date();

    // Generate date keys for the past N days up to today
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);

      const dayIndex = d.getDay();
      const monthIndex = d.getMonth();
      const dayNum = d.getDate();

      const shortDate = `${toBengaliNumber(dayNum)} ${MONTH_NAMES_BN[monthIndex]}`;
      const displayDate = `${shortDate} (${DAY_NAMES_BN[dayIndex]})`;

      // Filter sales for this day
      const daySales = sales.filter(s => s.date.slice(0, 10) === dateKey);
      const daySalesTotal = daySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const dayCashCollected = daySales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);

      // Filter expenses for this day
      const dayExpensesTotal = expenses
        .filter(e => e.date.slice(0, 10) === dateKey)
        .reduce((acc, e) => acc + (e.amount || 0), 0);

      // Filter spoilage loss for this day
      const daySpoilageLoss = spoilages
        .filter(sp => sp.date.slice(0, 10) === dateKey)
        .reduce((acc, sp) => acc + (sp.lossAmount || 0), 0);

      const totalOutflow = dayExpensesTotal + daySpoilageLoss;
      const netProfit = daySalesTotal - totalOutflow;

      result.push({
        dateKey,
        displayDate,
        shortDate,
        sales: daySalesTotal,
        expenses: totalOutflow,
        profit: netProfit,
        cashCollected: dayCashCollected,
        orderCount: daySales.length
      });
    }

    return result;
  }, [sales, expenses, spoilages, timeRange]);

  // Aggregate stats for the selected period
  const totals = useMemo(() => {
    const totalSales = chartData.reduce((acc, d) => acc + d.sales, 0);
    const totalExpenses = chartData.reduce((acc, d) => acc + d.expenses, 0);
    const totalProfit = totalSales - totalExpenses;
    const avgDailySales = Math.round(totalSales / chartData.length);
    const totalOrders = chartData.reduce((acc, d) => acc + d.orderCount, 0);

    return {
      totalSales,
      totalExpenses,
      totalProfit,
      avgDailySales,
      totalOrders
    };
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyDataPoint = payload[0].payload;
      return (
        <div className="bg-stone-900/95 dark:bg-stone-950/95 text-white p-3 rounded-xl shadow-xl border border-stone-700/60 backdrop-blur-xs text-xs space-y-2 min-w-[190px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
            <span className="font-bold text-stone-200">{data.displayDate}</span>
            <span className="text-[10px] text-stone-400">
              {toBengaliNumber(data.orderCount)} টি মেমো
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                মোট বিক্রি:
              </span>
              <span className="font-bold">{formatTaka(data.sales)}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                খরচ ও পচন:
              </span>
              <span className="font-bold">{formatTaka(data.expenses)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-sky-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                নিট উদ্বৃত্ত/লাভ:
              </span>
              <span className="font-bold">
                {data.profit >= 0 ? '+' : ''}{formatTaka(data.profit)}
              </span>
            </div>
            {data.cashCollected > 0 && (
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                <span>নগদ আদায়:</span>
                <span>{formatTaka(data.cashCollected)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>দৈনিক বিক্রি বনাম খরচ পর্যবেক্ষণ (Sales vs. Expenses)</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            দৈনিক মোট বিক্রি, পরিচালন ব্যয় ও পচন ক্ষতির তুলনামূলক গ্রাফ
          </p>
        </div>

        {/* Range & View Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Chart Style Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setChartStyle('composed')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                chartStyle === 'composed'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="বার চার্ট ও ট্রেন্ড লাইন"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">বার গ্রাফ</span>
            </button>
            <button
              onClick={() => setChartStyle('area')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                chartStyle === 'area'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="স্মুথ এরিয়া চার্ট"
            >
              <LineChartIcon className="w-3 h-3" />
              <span className="hidden sm:inline">এরিয়া চার্ট</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
            {(['7', '14', '30'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md transition-all text-xs font-semibold ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {range === '7' ? '৭ দিন' : range === '14' ? '১৪ দিন' : '১ মাস'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Period Summary Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-1">
        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
            নির্বাচিত মোট বিক্রি ({toBengaliNumber(chartData.length)} দিন)
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
            {formatTaka(totals.totalSales)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40">
          <span className="text-[11px] text-rose-800 dark:text-rose-300 font-medium block">
            মোট খরচ ও ক্ষতি
          </span>
          <span className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5 block">
            {formatTaka(totals.totalExpenses)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40">
          <span className="text-[11px] text-sky-800 dark:text-sky-300 font-medium block">
            নিট উদ্বৃত্ত
          </span>
          <span className={`text-base sm:text-lg font-bold mt-0.5 block ${
            totals.totalProfit >= 0 ? 'text-sky-700 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {totals.totalProfit >= 0 ? '+' : ''}{formatTaka(totals.totalProfit)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium block">
            দৈনিক গড় বিক্রি
          </span>
          <span className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200 mt-0.5 block">
            {formatTaka(totals.avgDailySales)}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 md:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartStyle === 'composed' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
                className="stroke-stone-200 dark:stroke-stone-800"
              />

              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${toBengaliNumber(Math.round(val / 1000))}k`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                formatter={(val) => {
                  if (val === 'sales') return <span className="text-stone-700 dark:text-stone-300 font-medium">বিক্রি</span>;
                  if (val === 'expenses') return <span className="text-stone-700 dark:text-stone-300 font-medium">খরচ ও পচন</span>;
                  if (val === 'profit') return <span className="text-stone-700 dark:text-stone-300 font-medium">নিট লাভ</span>;
                  return val;
                }}
              />

              <Bar
                dataKey="sales"
                name="sales"
                fill="url(#salesBarGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="expenses"
                name="expenses"
                fill="url(#expenseBarGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />

              <Line
                type="monotone"
                dataKey="profit"
                name="profit"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, fill: '#0284c7' }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
                className="stroke-stone-200 dark:stroke-stone-800"
              />

              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${toBengaliNumber(Math.round(val / 1000))}k`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                formatter={(val) => {
                  if (val === 'sales') return <span className="text-stone-700 dark:text-stone-300 font-medium">বিক্রি</span>;
                  if (val === 'expenses') return <span className="text-stone-700 dark:text-stone-300 font-medium">খরচ ও পচন</span>;
                  return val;
                }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                name="sales"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesAreaGrad)"
              />

              <Area
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseAreaGrad)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          রিয়েল-টাইমে দৈনিক বিক্রি ও খরচের নতুন এন্ট্রি অনুযায়ী গ্রাফ স্বয়ংক্রিয় আপডেট হয়।
        </span>
        <span className="hidden sm:inline text-stone-400">
          সর্বশেষ আপডেট: আজ
        </span>
      </div>

    </div>
  );
};
