import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Printer, 
  Calendar, 
  PieChart, 
  DollarSign, 
  Receipt,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  SaleRecord, 
  BusinessExpense, 
  SpoilageRecord, 
  VegetableItem,
  BusinessProfile 
} from '../types';
import { formatTaka, formatBanglaDate, toBengaliNumber } from '../utils/formatters';
import { DailyNetProfitChart } from './DailyNetProfitChart';
import { ItemProfitBarChart } from './ItemProfitBarChart';

export { ItemProfitBarChart } from './ItemProfitBarChart';

const BANGLA_MONTH_NAMES = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BANGLA_SHORT_MONTHS = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export interface MonthFinancialSummary {
  monthKey: string;
  year: number;
  monthIndex: number;
  monthNameBn: string;
  shortNameBn: string;
  salesRevenue: number;
  cogs: number;
  operatingExpenses: number;
  spoilageLoss: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMarginPercent: number;
  salesCount: number;
  expensesCount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface SixMonthProfitLossChartProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages?: SpoilageRecord[];
  onNavigate?: (tab: string) => void;
  isCompact?: boolean;
  title?: string;
}

// Sub-component: 6-Month Profit & Loss Bar Chart using Recharts
export const SixMonthProfitLossChart: React.FC<SixMonthProfitLossChartProps> = ({
  sales,
  expenses,
  spoilages = [],
  onNavigate,
  isCompact = false,
  title
}) => {
  const [chartMode, setChartMode] = useState<'netProfit' | 'comparison' | 'breakdown'>('netProfit');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  // Calculate 6-month aggregated dataset
  const sixMonthsData = useMemo<MonthFinancialSummary[]>(() => {
    const now = new Date();
    let refYear = now.getFullYear();
    let refMonth = now.getMonth();

    // Check if there are transactions in newer months
    const allDates = [
      ...sales.map(s => s.date),
      ...expenses.map(e => e.date),
      ...spoilages.map(sp => sp.date)
    ].filter(Boolean);

    if (allDates.length > 0) {
      const sorted = [...allDates].sort().reverse();
      const latestDate = new Date(sorted[0]);
      if (
        latestDate.getFullYear() > refYear ||
        (latestDate.getFullYear() === refYear && latestDate.getMonth() > refMonth)
      ) {
        refYear = latestDate.getFullYear();
        refMonth = latestDate.getMonth();
      }
    }

    const months: MonthFinancialSummary[] = [];

    // Loop past 6 months (5 months ago to current/reference month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;

      // Filter data for this month
      const mSales = sales.filter(s => s.date && s.date.startsWith(monthPrefix));
      const mExpenses = expenses.filter(e => e.date && e.date.startsWith(monthPrefix));
      const mSpoilages = spoilages.filter(sp => sp.date && sp.date.startsWith(monthPrefix));

      const salesRevenue = mSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const paidAmount = mSales.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
      const dueAmount = mSales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);

      const cogs = mSales.reduce((acc, s) => {
        const cost = (s.items || []).reduce((sub, item) => {
          return sub + ((item.costPricePerKg || 0) * (item.quantityInKg || 0));
        }, 0);
        return acc + cost;
      }, 0);

      const operatingExpenses = mExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const spoilageLoss = mSpoilages.reduce((acc, sp) => acc + (sp.lossAmount || 0), 0);

      const totalCosts = cogs + operatingExpenses + spoilageLoss;
      const grossProfit = salesRevenue - cogs;
      const netProfit = salesRevenue - totalCosts;
      const profitMarginPercent = salesRevenue > 0 ? (netProfit / salesRevenue) * 100 : 0;

      const monthNameBn = `${BANGLA_MONTH_NAMES[m]} ${toBengaliNumber(y)}`;
      const shortNameBn = `${BANGLA_SHORT_MONTHS[m]} '${toBengaliNumber(String(y).slice(2))}`;

      months.push({
        monthKey: monthPrefix,
        year: y,
        monthIndex: m,
        monthNameBn,
        shortNameBn,
        salesRevenue,
        cogs,
        operatingExpenses,
        spoilageLoss,
        totalCosts,
        grossProfit,
        netProfit,
        profitMarginPercent,
        salesCount: mSales.length,
        expensesCount: mExpenses.length,
        paidAmount,
        dueAmount
      });
    }

    return months;
  }, [sales, expenses, spoilages]);

  // Aggregate statistics across the 6-month period
  interface OverallStats {
    totalSales: number;
    totalCosts: number;
    totalCOGS: number;
    totalOperatingExpenses: number;
    totalSpoilage: number;
    totalNetProfit: number;
    overallMargin: number;
    bestMonth: MonthFinancialSummary | null;
    profitableMonthsCount: number;
  }

  const overallStats = useMemo<OverallStats>(() => {
    const totalSales = sixMonthsData.reduce((acc, m) => acc + m.salesRevenue, 0);
    const totalCosts = sixMonthsData.reduce((acc, m) => acc + m.totalCosts, 0);
    const totalCOGS = sixMonthsData.reduce((acc, m) => acc + m.cogs, 0);
    const totalOperatingExpenses = sixMonthsData.reduce((acc, m) => acc + m.operatingExpenses, 0);
    const totalSpoilage = sixMonthsData.reduce((acc, m) => acc + m.spoilageLoss, 0);
    const totalNetProfit = totalSales - totalCosts;
    const overallMargin = totalSales > 0 ? (totalNetProfit / totalSales) * 100 : 0;

    // Find best profit month
    let bestMonth: MonthFinancialSummary | null = null;
    let maxProfit = -Infinity;
    sixMonthsData.forEach(m => {
      if (m.netProfit > maxProfit) {
        maxProfit = m.netProfit;
        bestMonth = m;
      }
    });

    const profitableMonthsCount = sixMonthsData.filter(m => m.netProfit > 0).length;

    return {
      totalSales,
      totalCosts,
      totalCOGS,
      totalOperatingExpenses,
      totalSpoilage,
      totalNetProfit,
      overallMargin,
      bestMonth,
      profitableMonthsCount
    };
  }, [sixMonthsData]);

  // Currently active selected month for drilldown
  const activeMonth = useMemo(() => {
    if (!selectedMonthKey) {
      // Default to latest month (last item)
      return sixMonthsData[sixMonthsData.length - 1] || null;
    }
    return sixMonthsData.find(m => m.monthKey === selectedMonthKey) || sixMonthsData[sixMonthsData.length - 1] || null;
  }, [sixMonthsData, selectedMonthKey]);

  // Custom Tooltip component for Recharts
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthFinancialSummary;
      if (!data) return null;

      const isProfit = data.netProfit >= 0;

      return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 p-3 sm:p-4 rounded-xl shadow-xl text-xs space-y-2.5 min-w-[220px] z-50">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{data.monthNameBn}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isProfit 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
            }`}>
              {isProfit ? 'লাভজনক মাস' : 'লোকসান'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
              <span>মোট বিক্রি (আয়):</span>
              <strong className="text-stone-900 dark:text-stone-100">{formatTaka(data.salesRevenue)}</strong>
            </div>

            <div className="flex justify-between items-center text-stone-500">
              <span>ক্রয় ব্যয় (COGS):</span>
              <span>- {formatTaka(data.cogs)}</span>
            </div>

            <div className="flex justify-between items-center text-stone-500">
              <span>পরিচালন খরচ:</span>
              <span>- {formatTaka(data.operatingExpenses)}</span>
            </div>

            {data.spoilageLoss > 0 && (
              <div className="flex justify-between items-center text-stone-500">
                <span>পচন ক্ষতি:</span>
                <span className="text-rose-600">- {formatTaka(data.spoilageLoss)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center font-bold text-sm">
              <span className={isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}>
                নিট {isProfit ? 'লাভ' : 'ক্ষতি'}:
              </span>
              <span className={isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'}>
                {isProfit ? '+' : '-'} {formatTaka(Math.abs(data.netProfit))}
              </span>
            </div>

            <div className="text-[11px] text-stone-400 text-right">
              মার্জিন হার: <strong>{toBengaliNumber(data.profitMarginPercent.toFixed(1))}%</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {title || 'বিগত ৬ মাসের লাভ ও ক্ষতির বার চার্ট'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                প্রতি মাসের মোট বিক্রি, ক্রয় ব্যয় ও পরিচালন খরচ সমন্বয়ে বাস্তব নিট ফলাফল
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setChartMode('netProfit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'netProfit'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            নিট লাভ-ক্ষতি
          </button>

          <button
            type="button"
            onClick={() => setChartMode('comparison')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'comparison'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            আয় বনাম মোট ব্যয়
          </button>

          <button
            type="button"
            onClick={() => setChartMode('breakdown')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'breakdown'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            ব্যয়ের খাতসমূহ
          </button>
        </div>
      </div>

      {/* KPI Cards Row (6 Months Summary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Net Profit 6-Months */}
        <div className={`p-3.5 sm:p-4 rounded-xl border ${
          overallStats.totalNetProfit >= 0
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-850'
            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-850'
        }`}>
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>৬ মাসের নিট লাভ</span>
            <TrendingUp className={`w-4 h-4 ${overallStats.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <div className={`text-base sm:text-xl font-extrabold mt-1.5 ${
            overallStats.totalNetProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {overallStats.totalNetProfit >= 0 ? '+' : '-'} {formatTaka(Math.abs(overallStats.totalNetProfit))}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            লাভের অনুপাত: <strong className="text-stone-800 dark:text-stone-200">{toBengaliNumber(overallStats.overallMargin.toFixed(1))}%</strong>
          </div>
        </div>

        {/* Total Sales 6-Months */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>৬ মাসের মোট বিক্রি</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">
            {formatTaka(overallStats.totalSales)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            মোট মেমো: <strong className="text-stone-800 dark:text-stone-200">{toBengaliNumber(sixMonthsData.reduce((acc, m) => acc + m.salesCount, 0))} টি</strong>
          </div>
        </div>

        {/* Total Expenses 6-Months */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>৬ মাসের মোট ব্যয়</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">
            {formatTaka(overallStats.totalCosts)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            ক্রয় + দোকান পরিচালন খরচ
          </div>
        </div>

        {/* Best Month */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>সেরা লাভের মাস</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1.5 truncate">
            {overallStats.bestMonth ? overallStats.bestMonth.monthNameBn : '–'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {overallStats.bestMonth ? `+${formatTaka(overallStats.bestMonth.netProfit)}` : 'তথ্য নেই'}
          </div>
        </div>

      </div>

      {/* Main Recharts Bar Chart Area */}
      <div className="w-full pt-2">
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sixMonthsData}
              margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload[0]) {
                  const clicked = state.activePayload[0].payload as MonthFinancialSummary;
                  if (clicked && clicked.monthKey) {
                    setSelectedMonthKey(clicked.monthKey);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-stone-800" />
              <XAxis
                dataKey="shortNameBn"
                stroke="#78716c"
                tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis
                stroke="#78716c"
                tick={{ fill: '#78716c', fontSize: 11 }}
                tickFormatter={(val: number) => {
                  const abs = Math.abs(val);
                  const sign = val < 0 ? '-' : '';
                  if (abs >= 1000) {
                    return `${sign}৳${toBengaliNumber(Math.round(abs / 1000))}হাজ`;
                  }
                  return `${sign}৳${toBengaliNumber(abs)}`;
                }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

              {/* Mode 1: Net Profit / Loss Bars */}
              {chartMode === 'netProfit' && (
                <Bar
                  dataKey="netProfit"
                  name="নিট লাভ/ক্ষতি"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                >
                  {sixMonthsData.map((entry) => (
                    <Cell
                      key={`cell-${entry.monthKey}`}
                      fill={entry.netProfit >= 0 ? '#10b981' : '#f43f5e'}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              )}

              {/* Mode 2: Revenue vs Total Cost Comparison */}
              {chartMode === 'comparison' && (
                <>
                  <Bar
                    dataKey="salesRevenue"
                    name="মোট বিক্রি (আয়)"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="totalCosts"
                    name="মোট ব্যয় ও খরচ"
                    fill="#e11d48"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="netProfit"
                    name="নিট মুনাফা"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    className="cursor-pointer"
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
                  />
                </>
              )}

              {/* Mode 3: Cost Breakdown Breakdown */}
              {chartMode === 'breakdown' && (
                <>
                  <Bar
                    dataKey="cogs"
                    name="কাঁচামাল ক্রয় ব্যয় (COGS)"
                    stackId="costs"
                    fill="#64748b"
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="operatingExpenses"
                    name="দোকান পরিচালন খরচ"
                    stackId="costs"
                    fill="#f97316"
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="spoilageLoss"
                    name="পচন ও ঘাটতি ক্ষতি"
                    stackId="costs"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Color Legend Bar for Net Profit */}
        {chartMode === 'netProfit' && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>সবুজ বার: নিট মুনাফা (Profit)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>লাল বার: নিট ক্ষতি বা ঘাটতি (Loss)</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="w-2.5 h-0.5 bg-stone-400"></span>
              <span>০ অক্ষ রেখা</span>
            </div>
          </div>
        )}
      </div>

      {/* Month Selection Buttons / Chips for Quick Drilldown */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            মাসের ওপর ক্লিক করে বিস্তারিত দেখুন:
          </span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>পূর্ণাঙ্গ রিপোর্ট দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {sixMonthsData.map((m) => {
            const isSelected = activeMonth?.monthKey === m.monthKey;
            const isProfit = m.netProfit >= 0;

            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => setSelectedMonthKey(m.monthKey)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-850/50'
                }`}
              >
                <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                  {m.monthNameBn.split(' ')[0]}
                </div>
                <div className={`text-xs font-extrabold mt-0.5 ${
                  isProfit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isProfit ? '+' : '-'} {formatTaka(Math.abs(m.netProfit))}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  বিক্রি: {formatTaka(m.salesRevenue)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Details Drawer/Card */}
      {activeMonth && (
        <div className="bg-stone-50 dark:bg-stone-850 p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-750 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-750 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {activeMonth.monthNameBn} এর আর্থিক খতিয়ান
              </h4>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
              activeMonth.netProfit >= 0
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
            }`}>
              {activeMonth.netProfit >= 0 ? '✓ নিট মুনাফা' : '⚠ নিট লোকসান'}: {formatTaka(Math.abs(activeMonth.netProfit))}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block">মোট বিক্রি (Revenue)</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {formatTaka(activeMonth.salesRevenue)}
              </span>
              <span className="text-[11px] text-stone-500 block">
                {toBengaliNumber(activeMonth.salesCount)} টি মেমো
              </span>
            </div>

            <div>
              <span className="text-stone-400 block">কাঁচামাল ক্রয় ব্যয় (COGS)</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                - {formatTaka(activeMonth.cogs)}
              </span>
              <span className="text-[11px] text-stone-500 block">
                গ্রস প্রফিট: {formatTaka(activeMonth.grossProfit)}
              </span>
            </div>

            <div>
              <span className="text-stone-400 block">দোকান খরচ ও মজুরি</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                - {formatTaka(activeMonth.operatingExpenses)}
              </span>
              <span className="text-[11px] text-stone-500 block">
                {toBengaliNumber(activeMonth.expensesCount)} টি খরচ এন্ট্রি
              </span>
            </div>

            <div>
              <span className="text-stone-400 block">পচন ও বিনষ্ট ক্ষতি</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                - {formatTaka(activeMonth.spoilageLoss)}
              </span>
              <span className="text-[11px] text-stone-500 block">
                মার্জিন: {toBengaliNumber(activeMonth.profitMarginPercent.toFixed(1))}%
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export interface ProfitLossReportProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages: SpoilageRecord[];
  items: VegetableItem[];
  profile: BusinessProfile;
  onAddExpense?: (expense: BusinessExpense) => void;
  viewMode?: 'full' | 'chartOnly';
  onNavigate?: (tab: string) => void;
}

export const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  sales,
  expenses,
  spoilages,
  items,
  profile,
  onAddExpense,
  viewMode = 'full',
  onNavigate
}) => {
  // If chart-only mode is requested (for dashboard embed)
  if (viewMode === 'chartOnly') {
    return (
      <SixMonthProfitLossChart
        sales={sales}
        expenses={expenses}
        spoilages={spoilages}
        onNavigate={onNavigate}
      />
    );
  }

  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeReportChart, setActiveReportChart] = useState<'itemProfit' | 'sixMonth' | 'daily30' | 'all' | 'both'>('itemProfit');

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<'দোকান ভাড়া' | 'বিদ্যুৎ বিল' | 'কর্মচারী বেতন' | 'যাতায়াত ও গাড়িভাড়া' | 'লেবার/কুলি' | 'চা-নাস্তা' | 'অন্যান্য'>('লেবার/কুলি');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'নগদ' | 'বিকাশ' | 'ব্যাংক'>('নগদ');
  const [expNotes, setExpNotes] = useState('');

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const pastWeek = new Date(now);
  pastWeek.setDate(pastWeek.getDate() - 7);

  const pastMonth = new Date(now);
  pastMonth.setDate(pastMonth.getDate() - 30);

  const isWithinPeriod = (dateIso: string) => {
    const dStr = dateIso.slice(0, 10);
    const dObj = new Date(dateIso);
    if (period === 'today') return dStr === todayStr;
    if (period === 'yesterday') return dStr === yesterdayStr;
    if (period === 'week') return dObj >= pastWeek;
    if (period === 'month') return dObj >= pastMonth;
    return true;
  };

  const periodSales = sales.filter(s => isWithinPeriod(s.date));
  const periodExpenses = expenses.filter(e => isWithinPeriod(e.date));
  const periodSpoilages = spoilages.filter(sp => isWithinPeriod(sp.date));

  // Calculations for chosen period
  const totalRevenue = periodSales.reduce((acc, s) => acc + s.grandTotal, 0);
  
  const totalCOGS = periodSales.reduce((acc, s) => {
    const saleCost = s.items.reduce((sub, item) => sub + (item.costPricePerKg * item.quantityInKg), 0);
    return acc + saleCost;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSpoilageLoss = periodSpoilages.reduce((acc, sp) => acc + sp.lossAmount, 0);
  const netProfit = grossProfit - totalOperatingExpenses - totalSpoilageLoss;

  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;

    const newExpense: BusinessExpense = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      category: expCategory,
      amount: expAmount,
      paidTo: expPaidTo.trim(),
      paymentMethod: expPaymentMethod,
      date: new Date().toISOString(),
      notes: expNotes.trim()
    };

    if (onAddExpense) {
      onAddExpense(newExpense);
    }
    setShowExpenseModal(false);
    setExpTitle('');
    setExpAmount(0);
    setExpPaidTo('');
    setExpNotes('');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>লাভ ও ক্ষতির পূর্ণাঙ্গ রিপোর্ট ও বিগত ৬ মাসের চার্ট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            মোট বিক্রি, ক্রয়মূল্য, আড়ত পরিচালন খরচ এবং পচনজনিত ক্ষতি সমন্বয়ের পর সঠিক নিট মুনাফা।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddExpense && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>খরচ যোগ করুন</span>
            </button>
          )}
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>রিপোর্ট প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Chart View Switcher */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/70 dark:bg-stone-850 p-2 sm:p-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveReportChart('itemProfit')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeReportChart === 'itemProfit'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>সবজিভিত্তিক লাভ (বার চার্ট)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportChart('sixMonth')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeReportChart === 'sixMonth'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>বিগত ৬ মাসের বার চার্ট</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportChart('daily30')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeReportChart === 'daily30'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>গত ৩০ দিনে প্রতিদিনের নেট লাভ (লাইন চার্ট)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportChart('all')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeReportChart === 'all' || activeReportChart === 'both'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span>সকল চার্ট একত্রে</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 px-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ভিজ্যুয়াল লাভ-ক্ষতি অ্যানালিটিক্স</span>
          </div>
        </div>

        {/* 1. Item-wise Vegetable Profit Bar Chart (Recharts) */}
        {(activeReportChart === 'itemProfit' || activeReportChart === 'all' || activeReportChart === 'both') && (
          <ItemProfitBarChart
            sales={sales}
            items={items}
            selectedPeriod={period}
            onPeriodChange={(p) => setPeriod(p)}
            onNavigate={onNavigate}
          />
        )}

        {/* 2. 6-Month Profit/Loss Bar Chart (Recharts) */}
        {(activeReportChart === 'sixMonth' || activeReportChart === 'all' || activeReportChart === 'both') && (
          <SixMonthProfitLossChart
            sales={sales}
            expenses={expenses}
            spoilages={spoilages}
            onNavigate={onNavigate}
          />
        )}

        {/* 3. 30-Day Daily Net Profit Line Chart (Recharts) */}
        {(activeReportChart === 'daily30' || activeReportChart === 'all' || activeReportChart === 'both') && (
          <DailyNetProfitChart
            sales={sales}
            expenses={expenses}
            spoilages={spoilages}
            onNavigate={onNavigate}
            title="গত ৩০ দিনে প্রতিদিনের নেট লাভ (মোট বিক্রয় - খরচ - পণ্যের ক্রয়মূল্য)"
          />
        )}
      </div>

      {/* Period Filter Buttons */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-x-auto no-print">
        {[
          { id: 'today', label: 'আজকের হিসাব' },
          { id: 'yesterday', label: 'গতকাল' },
          { id: 'week', label: 'বিগত ৭ দিন' },
          { id: 'month', label: 'এই মাস (৩০ দিন)' },
          { id: 'all', label: 'সর্বমোট' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as any)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              period === item.id
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Profit / Loss Banner */}
      <div className={`p-6 rounded-2xl border text-white shadow-lg relative overflow-hidden ${
        netProfit >= 0
          ? 'bg-gradient-to-r from-emerald-800 to-teal-900 border-emerald-600'
          : 'bg-gradient-to-r from-rose-800 to-rose-950 border-rose-600'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-200 dark:text-emerald-300">
              নির্বাচিত সময়ের প্রকৃত নিট ফলাফল
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold mt-1">
              {netProfit >= 0 ? `+ ${formatTaka(netProfit)} (লাভ)` : `- ${formatTaka(Math.abs(netProfit))} (ক্ষতি)`}
            </div>
            <p className="text-xs text-white/80 mt-1">
              মোট বিক্রির উপর নিট মুনাফার হার: <strong>{toBengaliNumber(profitMarginPercent)}%</strong>
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-white/20 sm:pl-6 text-xs space-y-1">
            <div className="text-white/80">মোট বিক্রি: <strong className="text-white">{formatTaka(totalRevenue)}</strong></div>
            <div className="text-white/80">ক্রয় ব্যয়: <strong className="text-white">{formatTaka(totalCOGS)}</strong></div>
            <div className="text-white/80">দোকান খরচ: <strong className="text-white">{formatTaka(totalOperatingExpenses)}</strong></div>
            <div className="text-white/80">পচন ক্ষতি: <strong className="text-rose-300">{formatTaka(totalSpoilageLoss)}</strong></div>
          </div>
        </div>
      </div>

      {/* Printable Sheet Breakdown */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6">
        
        {/* Printable Header */}
        <div className="text-center border-b border-stone-200 dark:border-stone-800 pb-4">
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{profile.businessName}</h3>
          <p className="text-xs text-stone-500">লাভ-ক্ষতি ও আয়-ব্যয় বিবরণী</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            রিপোর্টের সময়কাল: {period === 'today' ? 'আজকের দিন' : period === 'yesterday' ? 'গতকাল' : period === 'week' ? 'বিগত ৭ দিন' : period === 'month' ? 'বিগত ৩০ দিন' : 'সম্পূর্ণ সময়'}
          </p>
        </div>

        {/* Financial Flow Table */}
        <div className="space-y-3 text-xs sm:text-sm">
          
          {/* Revenue */}
          <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              (ক) সবজি ও কাঁচামাল বিক্রয় বাবদ মোট আয় (Sales Revenue)
            </span>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-base">
              {formatTaka(totalRevenue)}
            </span>
          </div>

          {/* COGS */}
          <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            <span>
              (খ) বিক্রিত পণ্যের প্রকৃত ক্রয়মূল্য (Cost of Goods Sold)
            </span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              - {formatTaka(totalCOGS)}
            </span>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between items-center py-2.5 bg-stone-50 dark:bg-stone-800/60 px-3 rounded-lg font-bold">
            <span className="text-stone-900 dark:text-stone-100">
              (গ) মোট বাণিজ্যিক মুনাফা / গ্রস প্রফিট (ক - খ)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-base">
              {formatTaka(grossProfit)}
            </span>
          </div>

          {/* Operating Expenses */}
          <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            <div>
              <span>(ঘ) আড়ত ও দোকান পরিচালন খরচ (Operating Expenses)</span>
              <span className="text-[11px] text-stone-400 block">
                ভাড়া, বিদ্যুৎ, লেবার ও মজুরি, নাস্তা ইত্যাদি ({toBengaliNumber(periodExpenses.length)} টি এন্ট্রি)
              </span>
            </div>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              - {formatTaka(totalOperatingExpenses)}
            </span>
          </div>

          {/* Spoilage Loss */}
          <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            <div>
              <span>(ঙ) কাঁচামাল পচন, শুকানো ও ঘাটতিজনিত ক্ষতি (Wastage / Spoilage)</span>
              <span className="text-[11px] text-stone-400 block">
                পচে নষ্ট হওয়া বা ওজনে কমে যাওয়া সবজির ক্ষতি
              </span>
            </div>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              - {formatTaka(totalSpoilageLoss)}
            </span>
          </div>

          {/* Net Profit Final */}
          <div className="flex justify-between items-center py-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 rounded-xl font-bold text-sm sm:text-base">
            <span className="text-emerald-950 dark:text-emerald-200">
              (চ) প্রকৃত নিট লাভ বা ক্ষতি [গ - (ঘ + ঙ)]
            </span>
            <span className={`text-lg sm:text-xl ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
              {formatTaka(netProfit)}
            </span>
          </div>

        </div>

        {/* Expenses List */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
              পরিচালন খরচের বিবরণী তালিকা
            </h4>
            <span className="text-xs text-stone-400">
              মোট: <strong>{formatTaka(totalOperatingExpenses)}</strong>
            </span>
          </div>

          {/* Desktop Expenses Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-2 px-3">তারিখ</th>
                  <th className="py-2 px-3">খরচের খাত</th>
                  <th className="py-2 px-3">বিবরণ / শিরোনাম</th>
                  <th className="py-2 px-3">প্রাপক</th>
                  <th className="py-2 px-3 text-right">পরিমাণ (টাকা)</th>
                  <th className="py-2 px-3 text-center">মাধ্যম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {periodExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="py-2.5 px-3 text-stone-400">{formatBanglaDate(exp.date, true)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800 dark:text-stone-200">{exp.title}</td>
                    <td className="py-2.5 px-3 text-stone-500">{exp.paidTo || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatTaka(exp.amount)}</td>
                    <td className="py-2.5 px-3 text-center text-stone-400">{exp.paymentMethod}</td>
                  </tr>
                ))}
                {periodExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">
                      এই সময়ে কোনো অতিরিক্ত খরচের এন্ট্রি নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Expenses Cards */}
          <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
            {periodExpenses.map((exp) => (
              <div key={exp.id} className="py-2.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">{exp.title}</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">{exp.category}</span>
                      <span>{formatBanglaDate(exp.date, true)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-rose-600">{formatTaka(exp.amount)}</span>
                    <span className="block text-[10px] text-stone-400">{exp.paymentMethod}</span>
                  </div>
                </div>
                {exp.paidTo && (
                  <div className="text-[11px] text-stone-500">
                    প্রাপক: <strong>{exp.paidTo}</strong>
                  </div>
                )}
              </div>
            ))}
            {periodExpenses.length === 0 && (
              <div className="py-6 text-center text-xs text-stone-400">
                এই সময়ে কোনো অতিরিক্ত খরচের এন্ট্রি নেই
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal: Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>দোকান ও আড়তের খরচ এন্ট্রি</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">খরচের শিরোনাম / বিবরণ</label>
                <input
                  type="text"
                  placeholder="যেমন: আজকের কুলি মজুরি / দোকান বিদ্যুৎ বিল..."
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">খরচের খাত</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  >
                    <option value="লেবার/কুলি">লেবার/কুলি মজুরি</option>
                    <option value="যাতায়াত ও গাড়িভাড়া">যাতায়াত ও গাড়িভাড়া</option>
                    <option value="দোকান ভাড়া">দোকান/আড়ত ভাড়া</option>
                    <option value="বিদ্যুৎ বিল">বিদ্যুৎ বিল</option>
                    <option value="কর্মচারী বেতন">কর্মচারী বেতন</option>
                    <option value="চা-নাস্তা">চা-নাস্তা ও আপ্যায়ন</option>
                    <option value="অন্যান্য">অন্যান্য খরচ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">টাকার পরিমাণ</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="৳"
                    value={expAmount || ''}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">যাকে প্রদান করা হয়েছে</label>
                  <input
                    type="text"
                    placeholder="নাম..."
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">পেমেন্ট মাধ্যম</label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  >
                    <option value="নগদ">নগদ ক্যাশ</option>
                    <option value="বিকাশ">বিকাশ</option>
                    <option value="ব্যাংক">ব্যাংক</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">নোট / মন্তব্য</label>
                <input
                  type="text"
                  placeholder="অতিরিক্ত কোনো তথ্য..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-xl bg-stone-800 hover:bg-stone-900 text-white shadow-xs"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
