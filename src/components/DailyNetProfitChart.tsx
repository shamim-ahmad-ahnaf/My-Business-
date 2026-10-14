import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Info,
  Maximize2,
  Minimize2,
  HelpCircle,
  ShoppingBag,
  Receipt,
  PackageCheck
} from 'lucide-react';
import { SaleRecord, BusinessExpense, SpoilageRecord } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

interface DailyNetProfitChartProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages?: SpoilageRecord[];
  onNavigate?: (tab: string) => void;
  title?: string;
}

export interface DailyProfitPoint {
  dateKey: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 30
  displayDate: string; // e.g. "১২ অক্টো (সোম)"
  shortDate: string; // e.g. "১২ অক্টো"
  fullDateBn: string; // e.g. "১২ অক্টোবর, ২০২৬"
  totalSales: number; // মোট বিক্রয়
  cogs: number; // পণ্যের ক্রয়মূল্য (Cost of Goods Sold)
  operatingExpenses: number; // খরচ (দোকান খরচ, লেবার, ইত্যাদি)
  spoilageLoss: number; // নষ্ট/পচন ক্ষতি
  totalCosts: number; // মোট খরচ + পণ্যের ক্রয়মূল্য
  netProfit: number; // মোট বিক্রয় - খরচ - পণ্যের ক্রয়মূল্য
  grossProfit: number; // মোট বিক্রয় - পণ্যের ক্রয়মূল্য
  marginPercent: number; // নিট লাভের হার %
  orderCount: number; // বিক্রয় মেমো সংখ্যা
}

const BANGLA_SHORT_MONTHS = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ', 'অক্টো', 'নভে', 'ডিসে'
];

const BANGLA_FULL_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BANGLA_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export const DailyNetProfitChart: React.FC<DailyNetProfitChartProps> = ({
  sales,
  expenses,
  spoilages = [],
  onNavigate,
  title = 'গত ৩০ দিনে প্রতিদিনের নিট লাভ পর্যবেক্ষণ'
}) => {
  const [viewMode, setViewMode] = useState<'line' | 'area' | 'breakdown'>('line');
  const [selectedPoint, setSelectedPoint] = useState<DailyProfitPoint | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Calculate 30-day daily records
  const dailyData = useMemo<DailyProfitPoint[]>(() => {
    // Determine the anchor date: either today or the latest transaction date if future
    const now = new Date();
    let anchor = new Date(now);

    const allDates = [
      ...sales.map(s => s.date),
      ...expenses.map(e => e.date),
      ...spoilages.map(sp => sp.date)
    ].filter(Boolean);

    if (allDates.length > 0) {
      const sorted = [...allDates].sort().reverse();
      const latest = new Date(sorted[0]);
      if (latest > anchor) {
        anchor = latest;
      }
    }

    const points: DailyProfitPoint[] = [];

    // 30 days window: from 29 days ago up to anchor date
    for (let i = 29; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);

      const dayNum = d.getDate();
      const mIdx = d.getMonth();
      const yNum = d.getFullYear();
      const dayIdx = d.getDay();

      const shortDate = `${toBengaliNumber(dayNum)} ${BANGLA_SHORT_MONTHS[mIdx]}`;
      const displayDate = `${shortDate} (${BANGLA_DAYS[dayIdx]})`;
      const fullDateBn = `${toBengaliNumber(dayNum)} ${BANGLA_FULL_MONTHS[mIdx]}, ${toBengaliNumber(yNum)}`;

      // 1. Sales for this day
      const daySales = sales.filter(s => s.date && s.date.slice(0, 10) === dateKey);
      const dayTotalSales = daySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);

      // 2. Cost of Goods Sold (পণ্যের ক্রয়মূল্য)
      const dayCOGS = daySales.reduce((acc, s) => {
        const itemCost = (s.items || []).reduce((sub, item) => {
          return sub + ((item.costPricePerKg || 0) * (item.quantityInKg || 0));
        }, 0);
        return acc + itemCost;
      }, 0);

      // 3. Operating Expenses (দোকানের খরচ, লেবার, ইত্যাদি)
      const dayExpenses = expenses
        .filter(e => e.date && e.date.slice(0, 10) === dateKey)
        .reduce((acc, e) => acc + (e.amount || 0), 0);

      // 4. Spoilage loss (পচন ও নষ্টের ক্ষতি)
      const daySpoilageLoss = spoilages
        .filter(sp => sp.date && sp.date.slice(0, 10) === dateKey)
        .reduce((acc, sp) => acc + (sp.lossAmount || 0), 0);

      // Formulas:
      // মোট খরচ ও পণ্যের ক্রয়মূল্য = COGS + Operating Expenses + Spoilage Loss
      // নেট লাভ = মোট বিক্রয় - খরচ - পণ্যের ক্রয়মূল্য
      const totalCosts = dayCOGS + dayExpenses + daySpoilageLoss;
      const netProfit = dayTotalSales - totalCosts;
      const grossProfit = dayTotalSales - dayCOGS;
      const marginPercent = dayTotalSales > 0 ? (netProfit / dayTotalSales) * 100 : 0;

      points.push({
        dateKey,
        dayNumber: 30 - i,
        displayDate,
        shortDate,
        fullDateBn,
        totalSales: dayTotalSales,
        cogs: dayCOGS,
        operatingExpenses: dayExpenses + daySpoilageLoss,
        spoilageLoss: daySpoilageLoss,
        totalCosts,
        netProfit,
        grossProfit,
        marginPercent,
        orderCount: daySales.length
      });
    }

    return points;
  }, [sales, expenses, spoilages]);

  // Overall 30-day summary calculations
  const summary = useMemo(() => {
    const totalSales = dailyData.reduce((acc, d) => acc + d.totalSales, 0);
    const totalCOGS = dailyData.reduce((acc, d) => acc + d.cogs, 0);
    const totalExpenses = dailyData.reduce((acc, d) => acc + d.operatingExpenses, 0);
    const totalCosts = dailyData.reduce((acc, d) => acc + d.totalCosts, 0);
    const totalNetProfit = dailyData.reduce((acc, d) => acc + d.netProfit, 0);
    const totalGrossProfit = totalSales - totalCOGS;
    const avgDailyNetProfit = Math.round(totalNetProfit / 30);
    const profitableDays = dailyData.filter(d => d.netProfit > 0).length;
    const lossDays = dailyData.filter(d => d.netProfit < 0).length;
    const zeroDays = dailyData.filter(d => d.netProfit === 0 && d.totalSales === 0).length;

    // Highest and lowest profit day
    let highestDay = dailyData[0];
    let lowestDay = dailyData[0];
    dailyData.forEach(d => {
      if (d.netProfit > highestDay.netProfit) highestDay = d;
      if (d.netProfit < lowestDay.netProfit) lowestDay = d;
    });

    const overallMargin = totalSales > 0 ? (totalNetProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalCOGS,
      totalExpenses,
      totalCosts,
      totalNetProfit,
      totalGrossProfit,
      avgDailyNetProfit,
      profitableDays,
      lossDays,
      zeroDays,
      highestDay,
      lowestDay,
      overallMargin
    };
  }, [dailyData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyProfitPoint = payload[0].payload;
      const isPositive = data.netProfit >= 0;

      return (
        <div className="bg-stone-900/95 dark:bg-stone-950/95 text-white p-3.5 rounded-xl shadow-xl border border-stone-700/60 backdrop-blur-md text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
            <span className="font-bold text-stone-200">{data.fullDateBn}</span>
            <span className="text-[10px] text-stone-400">
              {toBengaliNumber(data.orderCount)} টি মেমো
            </span>
          </div>

          {/* Formula Breakdown inside Tooltip */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                মোট বিক্রয়:
              </span>
              <span className="font-semibold text-white">{formatTaka(data.totalSales)}</span>
            </div>

            <div className="flex items-center justify-between text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                পণ্যের ক্রয়মূল্য:
              </span>
              <span>- {formatTaka(data.cogs)}</span>
            </div>

            <div className="flex items-center justify-between text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                খরচ ও পচন:
              </span>
              <span>- {formatTaka(data.operatingExpenses)}</span>
            </div>

            <div className={`flex items-center justify-between pt-1.5 border-t border-stone-800 font-bold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                নেট লাভ:
              </span>
              <span className="text-sm">
                {isPositive ? '+' : ''}{formatTaka(data.netProfit)}
              </span>
            </div>

            {data.totalSales > 0 && (
              <div className="text-[10px] text-right text-stone-400 pt-0.5">
                মার্জিন: {toBengaliNumber(data.marginPercent.toFixed(1))}%
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
      {/* Header and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{title}</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  ৩০ দিন
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                সূত্র: <strong className="font-semibold text-stone-700 dark:text-stone-300">নেট লাভ = মোট বিক্রয় - খরচ - পণ্যের ক্রয়মূল্য</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Style Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Chart Style Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('line')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                viewMode === 'line'
                  ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="লাইন চার্ট (শুধুমাত্র নেট লাভ)"
            >
              <TrendingUp className="w-3 h-3" />
              <span>নেট লাইন</span>
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                viewMode === 'area'
                  ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="এরিয়া চার্ট"
            >
              <span>এরিয়া ভিউ</span>
            </button>
            <button
              onClick={() => setViewMode('breakdown')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-medium ${
                viewMode === 'breakdown'
                  ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="বিক্রি, ক্রয়মূল্য ও খরচের পূর্ণাঙ্গ সমন্বিত রেখাচিত্র"
            >
              <span>সকল উপাদান</span>
            </button>
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              showTable
                ? 'bg-stone-200 dark:bg-stone-700 border-stone-300 text-stone-900 dark:text-stone-100'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            {showTable ? 'তালিকা লুকান' : '৩০ দিনের টেবিল'}
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Metric Pills for the 30-day Window */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Total 30-day Net Profit */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200/70 dark:border-teal-800/40">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 text-xs font-medium">
            <span>বিগত ৩০ দিনের মোট নিট লাভ</span>
            <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className={`text-base sm:text-xl font-bold mt-1 ${
            summary.totalNetProfit >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {summary.totalNetProfit >= 0 ? '+' : ''}{formatTaka(summary.totalNetProfit)}
          </div>
          <div className="text-[10px] text-teal-700/80 dark:text-teal-400/80 mt-1 flex items-center justify-between">
            <span>গড়: {formatTaka(summary.avgDailyNetProfit)}/দিন</span>
            <span>মার্জিন: {toBengaliNumber(summary.overallMargin.toFixed(1))}%</span>
          </div>
        </div>

        {/* Metric 2: 30-day Sales vs Costs */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs font-medium">
            <span>মোট বিক্রয় (৩০ দিন)</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {formatTaka(summary.totalSales)}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            মোট খরচ ও ক্রয়মূল্য: {formatTaka(summary.totalCosts)}
          </div>
        </div>

        {/* Metric 3: Highest Profit Day */}
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span>সর্বোচ্চ লাভের দিন</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatTaka(summary.highestDay?.netProfit || 0)}
          </div>
          <div className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 mt-1 truncate">
            {summary.highestDay?.fullDateBn || '-'}
          </div>
        </div>

        {/* Metric 4: Profitable Days Ratio */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750">
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs font-medium">
            <span>লাভজনক কার্যদিবস</span>
            <PackageCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
            {toBengaliNumber(summary.profitableDays)} দিন <span className="text-xs font-normal text-stone-400">/ ৩০ দিন</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            লোকসান: {toBengaliNumber(summary.lossDays)} দিন, বাকি লেনদেনহীন
          </div>
        </div>
      </div>

      {/* Main Recharts Line / Area / Composed Chart Canvas */}
      <div className="w-full h-72 sm:h-80 md:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'line' ? (
            <LineChart
              data={dailyData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="netProfitLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#0284c7" />
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
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${toBengaliNumber(Math.round(val))}`}
              />

              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                formatter={(val) => {
                  if (val === 'netProfit') return <span className="text-teal-700 dark:text-teal-300 font-bold">প্রতিদিনের নিট লাভ (বিক্রয় - খরচ - ক্রয়মূল্য)</span>;
                  return val;
                }}
              />

              <Line
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="url(#netProfitLineGrad)"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0d9488', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </LineChart>
          ) : viewMode === 'area' ? (
            <ComposedChart
              data={dailyData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
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
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${toBengaliNumber(Math.round(val))}`}
              />

              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill="url(#profitAreaGrad)"
                activeDot={{ r: 6, fill: '#0d9488' }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={dailyData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${toBengaliNumber(Math.round(val / 1000))}k`}
              />

              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                formatter={(val) => {
                  if (val === 'totalSales') return <span className="text-emerald-600 font-semibold">মোট বিক্রয়</span>;
                  if (val === 'cogs') return <span className="text-amber-600 font-semibold">পণ্যের ক্রয়মূল্য</span>;
                  if (val === 'operatingExpenses') return <span className="text-rose-600 font-semibold">খরচ ও পচন</span>;
                  if (val === 'netProfit') return <span className="text-teal-700 font-bold">প্রতিদিনের নিট লাভ</span>;
                  return val;
                }}
              />

              <Area
                type="monotone"
                dataKey="totalSales"
                name="totalSales"
                stroke="#10b981"
                strokeWidth={1.5}
                fill="url(#salesGrad)"
              />

              <Line
                type="monotone"
                dataKey="cogs"
                name="cogs"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="operatingExpenses"
                name="operatingExpenses"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="netProfit"
                name="netProfit"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0d9488', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#0d9488' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Formula Explanation & Helper Note */}
      <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>হিসাব পদ্ধতি:</strong> প্রতিটি বিক্রয় মেমোর পণ্যের পাইকারি কেনা দর (COGS) ও সংশ্লিষ্ট দিনের মোট দোকান খরচ ও পচনের ক্ষতি বাদ দিয়ে চূড়ান্ত নিট লাভ নির্ধারিত হয়েছে।
          </span>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('reports')}
            className="text-teal-700 dark:text-teal-400 font-semibold hover:underline shrink-0 text-left sm:text-right"
          >
            বিস্তারিত লাভ-ক্ষতি রিপোর্ট দেখুন →
          </button>
        )}
      </div>

      {/* Optional: 30-day Tabular Breakdown */}
      {showTable && (
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
              গত ৩০ দিনের দৈনিক নিট লাভের হিসাব তালিকা:
            </h4>
            <span className="text-[11px] text-stone-400">
              সর্বমোট {toBengaliNumber(dailyData.length)} দিন
            </span>
          </div>

          <div className="overflow-x-auto max-h-64 rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 sticky top-0">
                <tr>
                  <th className="py-2 px-3 font-semibold">তারিখ</th>
                  <th className="py-2 px-3 text-right font-semibold">মোট বিক্রয়</th>
                  <th className="py-2 px-3 text-right font-semibold">পণ্যের ক্রয়মূল্য</th>
                  <th className="py-2 px-3 text-right font-semibold">খরচ ও ক্ষতি</th>
                  <th className="py-2 px-3 text-right font-semibold">নিট লাভ</th>
                  <th className="py-2 px-3 text-center font-semibold">মার্জিন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900">
                {dailyData.slice().reverse().map((d) => (
                  <tr key={d.dateKey} className="hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors">
                    <td className="py-2 px-3 font-medium text-stone-800 dark:text-stone-200">
                      {d.displayDate}
                    </td>
                    <td className="py-2 px-3 text-right text-stone-700 dark:text-stone-300">
                      {formatTaka(d.totalSales)}
                    </td>
                    <td className="py-2 px-3 text-right text-stone-500">
                      {formatTaka(d.cogs)}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-500">
                      {formatTaka(d.operatingExpenses)}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${
                      d.netProfit > 0 ? 'text-teal-600 dark:text-teal-400' : d.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400'
                    }`}>
                      {d.netProfit > 0 ? '+' : ''}{formatTaka(d.netProfit)}
                    </td>
                    <td className="py-2 px-3 text-center text-[11px] text-stone-500">
                      {d.totalSales > 0 ? `${toBengaliNumber(d.marginPercent.toFixed(1))}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
