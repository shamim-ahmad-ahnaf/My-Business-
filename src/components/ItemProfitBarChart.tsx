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
  Layers,
  ArrowUpDown,
  Filter,
  Package,
  Calendar,
  Sparkles,
  BarChart3,
  Award,
  Scale,
  DollarSign,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SaleRecord, VegetableItem, UnitType } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

export interface ItemProfitStat {
  itemId: string;
  itemName: string;
  nameEn?: string;
  category: string;
  totalSales: number; // বিক্রয়মূল্য (Total Revenue)
  totalCost: number; // ক্রয়মূল্য (COGS = costPricePerKg * quantityInKg)
  totalProfit: number; // মোট লাভ (বিক্রয় - ক্রয়মূল্য)
  totalQuantityKg: number; // বিক্রিত পরিমাণ (কেজি)
  salesCount: number; // মেমোর সংখ্যা
  profitMarginPercent: number; // মুনাফার হার (%)
  avgSellingPricePerKg: number; // গড় বিক্রয়মূল্য / কেজি
  avgCostPricePerKg: number; // গড় ক্রয়মূল্য / কেজি
  profitPerKg: number; // প্রতি কেজি লাভ
  currentStockKg?: number;
  defaultUnit?: UnitType;
}

export interface ItemProfitBarChartProps {
  sales: SaleRecord[];
  items?: VegetableItem[];
  selectedPeriod?: 'today' | 'yesterday' | 'week' | 'month' | 'all';
  onPeriodChange?: (period: 'today' | 'yesterday' | 'week' | 'month' | 'all') => void;
  title?: string;
  isCompact?: boolean;
  onNavigate?: (tab: string) => void;
}

const PRODUCE_CATEGORIES = ['সকল ক্যাটাগরি', 'শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'];

export const ItemProfitBarChart: React.FC<ItemProfitBarChartProps> = ({
  sales,
  items = [],
  selectedPeriod: externalPeriod,
  onPeriodChange,
  title,
  isCompact = false,
  onNavigate
}) => {
  // Internal period state if external is not managed
  const [internalPeriod, setInternalPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('month');
  const activePeriod = externalPeriod ?? internalPeriod;

  const handlePeriodSelect = (p: 'today' | 'yesterday' | 'week' | 'month' | 'all') => {
    if (onPeriodChange) {
      onPeriodChange(p);
    } else {
      setInternalPeriod(p);
    }
  };

  // View & Filter states
  const [metricMode, setMetricMode] = useState<'profitOnly' | 'salesVsCost' | 'margin'>('profitOnly');
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল ক্যাটাগরি');
  const [sortBy, setSortBy] = useState<'profitDesc' | 'profitAsc' | 'salesDesc' | 'quantityDesc' | 'marginDesc'>('profitDesc');
  const [showOnlySold, setShowOnlySold] = useState<boolean>(true);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [chartOrientation, setChartOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showTableDetails, setShowTableDetails] = useState<boolean>(false);

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
    if (!dateIso) return false;
    const dStr = dateIso.slice(0, 10);
    const dObj = new Date(dateIso);
    if (activePeriod === 'today') return dStr === todayStr;
    if (activePeriod === 'yesterday') return dStr === yesterdayStr;
    if (activePeriod === 'week') return dObj >= pastWeek;
    if (activePeriod === 'month') return dObj >= pastMonth;
    return true; // 'all'
  };

  // Map vegetable item metadata for quick lookup
  const itemLookup = useMemo(() => {
    const map = new Map<string, VegetableItem>();
    items.forEach(it => {
      map.set(it.id, it);
      map.set(it.nameBn.trim().toLowerCase(), it);
    });
    return map;
  }, [items]);

  // Aggregate item profit stats from sales
  const itemStats = useMemo<ItemProfitStat[]>(() => {
    const aggMap = new Map<string, {
      itemId: string;
      itemName: string;
      nameEn?: string;
      category: string;
      totalSales: number;
      totalCost: number;
      totalQuantityKg: number;
      salesCount: number;
      currentStockKg?: number;
      defaultUnit?: UnitType;
    }>();

    // 1. Initialize items from catalog if showOnlySold is false
    if (!showOnlySold && items.length > 0) {
      items.forEach(it => {
        aggMap.set(it.id, {
          itemId: it.id,
          itemName: it.nameBn,
          nameEn: it.nameEn,
          category: it.category || 'শাকসবজি',
          totalSales: 0,
          totalCost: 0,
          totalQuantityKg: 0,
          salesCount: 0,
          currentStockKg: it.currentStockKg,
          defaultUnit: it.defaultUnit
        });
      });
    }

    // 2. Iterate through filtered sales
    const filteredSales = sales.filter(s => isWithinPeriod(s.date));

    filteredSales.forEach(sale => {
      (sale.items || []).forEach(sItem => {
        const itemKey = sItem.itemId || sItem.itemName.trim();
        const existing = aggMap.get(itemKey) || aggMap.get(sItem.itemId);

        // Find metadata from items catalog if possible
        const meta = itemLookup.get(sItem.itemId) || itemLookup.get(sItem.itemName.trim().toLowerCase());

        const salesAmount = Number(sItem.totalPrice) || 0;
        const qtyKg = Number(sItem.quantityInKg) || 0;
        const costPricePerKg = Number(sItem.costPricePerKg) || (meta?.avgPurchasePricePerKg ?? 0);
        const itemCost = costPricePerKg * qtyKg;

        if (existing) {
          existing.totalSales += salesAmount;
          existing.totalCost += itemCost;
          existing.totalQuantityKg += qtyKg;
          existing.salesCount += 1;
        } else {
          aggMap.set(itemKey, {
            itemId: sItem.itemId || itemKey,
            itemName: sItem.itemName || meta?.nameBn || 'অজ্ঞাত সবজি',
            nameEn: meta?.nameEn,
            category: meta?.category || 'শাকসবজি',
            totalSales: salesAmount,
            totalCost: itemCost,
            totalQuantityKg: qtyKg,
            salesCount: 1,
            currentStockKg: meta?.currentStockKg,
            defaultUnit: meta?.defaultUnit || sItem.unit
          });
        }
      });
    });

    // 3. Compute final metrics
    const results: ItemProfitStat[] = [];
    aggMap.forEach(v => {
      const totalProfit = v.totalSales - v.totalCost;
      const profitMarginPercent = v.totalSales > 0 ? (totalProfit / v.totalSales) * 100 : 0;
      const avgSellingPricePerKg = v.totalQuantityKg > 0 ? v.totalSales / v.totalQuantityKg : 0;
      const avgCostPricePerKg = v.totalQuantityKg > 0 ? v.totalCost / v.totalQuantityKg : 0;
      const profitPerKg = v.totalQuantityKg > 0 ? totalProfit / v.totalQuantityKg : 0;

      results.push({
        ...v,
        totalProfit,
        profitMarginPercent,
        avgSellingPricePerKg,
        avgCostPricePerKg,
        profitPerKg
      });
    });

    return results;
  }, [sales, items, activePeriod, showOnlySold, itemLookup]);

  // Apply Category filter and Sorting
  const processedData = useMemo(() => {
    let filtered = itemStats;

    // Filter category
    if (selectedCategory !== 'সকল ক্যাটাগরি') {
      filtered = filtered.filter(item => {
        if (selectedCategory === 'মসলাপাতি') {
          return item.category === 'মসলাপাতি' || item.category === 'মশলা';
        }
        return item.category === selectedCategory;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'profitDesc') return b.totalProfit - a.totalProfit;
      if (sortBy === 'profitAsc') return a.totalProfit - b.totalProfit;
      if (sortBy === 'salesDesc') return b.totalSales - a.totalSales;
      if (sortBy === 'quantityDesc') return b.totalQuantityKg - a.totalQuantityKg;
      if (sortBy === 'marginDesc') return b.profitMarginPercent - a.profitMarginPercent;
      return b.totalProfit - a.totalProfit;
    });

    return sorted;
  }, [itemStats, selectedCategory, sortBy]);

  // Overall KPI statistics
  const kpiStats = useMemo(() => {
    const totalProfit = processedData.reduce((acc, it) => acc + it.totalProfit, 0);
    const totalSales = processedData.reduce((acc, it) => acc + it.totalSales, 0);
    const totalCost = processedData.reduce((acc, it) => acc + it.totalCost, 0);
    const totalQuantity = processedData.reduce((acc, it) => acc + it.totalQuantityKg, 0);
    const overallMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    // Most profitable vegetable
    const mostProfitable = [...processedData].sort((a, b) => b.totalProfit - a.totalProfit)[0] || null;
    // Highest volume vegetable
    const highestVolume = [...processedData].sort((a, b) => b.totalQuantityKg - a.totalQuantityKg)[0] || null;

    return {
      totalProfit,
      totalSales,
      totalCost,
      totalQuantity,
      overallMargin,
      mostProfitable,
      highestVolume
    };
  }, [processedData]);

  // Custom Tooltip for Recharts
  const CustomItemTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ItemProfitStat;
      if (!data) return null;

      const isProfit = data.totalProfit >= 0;

      return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 p-3 sm:p-4 rounded-2xl shadow-2xl text-xs space-y-2.5 min-w-[240px] z-50">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm block">
                {data.itemName}
              </span>
              <span className="text-[10px] text-stone-400">
                ক্যাটাগরি: {data.category}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isProfit
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
            }`}>
              {isProfit ? 'মুনাফা' : 'ক্ষতি'}
            </span>
          </div>

          {/* Core numbers */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/40 p-1.5 rounded-lg">
              <span>মোট লাভ (বিক্রয় - ক্রয়):</span>
              <span className="text-sm">
                {isProfit ? '+' : '-'} {formatTaka(Math.abs(data.totalProfit))}
              </span>
            </div>

            <div className="flex justify-between items-center text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                মোট বিক্রয়:
              </span>
              <span className="font-semibold">{formatTaka(data.totalSales)}</span>
            </div>

            <div className="flex justify-between items-center text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                মোট ক্রয়মূল্য:
              </span>
              <span className="font-semibold">{formatTaka(data.totalCost)}</span>
            </div>

            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
              <span>বিক্রিত পরিমাণ:</span>
              <span className="font-medium">{toBengaliNumber(data.totalQuantityKg.toFixed(1))} কেজি</span>
            </div>

            <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
              <span>মুনাফার হার:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliNumber(data.profitMarginPercent.toFixed(1))}%
              </span>
            </div>

            {data.totalQuantityKg > 0 && (
              <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[11px] flex justify-between text-stone-500">
                <span>প্রতি কেজিতে লাভ:</span>
                <span className="font-semibold text-stone-700 dark:text-stone-200">
                  {formatTaka(Math.round(data.profitPerKg))}/কেজি
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine chart height based on count of items for horizontal layout
  const dynamicChartHeight = Math.max(380, Math.min(750, processedData.length * 42 + 90));

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-5">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{title || 'প্রতিটি সবজি আইটেমের ভিত্তিতে মোট লাভ (বার চার্ট)'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  বিক্রয় - ক্রয়মূল্য
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                কোন সবজি থেকে কত টাকা প্রকৃত লাভ হয়েছে তার স্পষ্ট তুলনামূলক চিত্র
              </p>
            </div>
          </div>
        </div>

        {/* Time period filter pills */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs overflow-x-auto">
          {[
            { id: 'today', label: 'আজকে' },
            { id: 'yesterday', label: 'গতকাল' },
            { id: 'week', label: '৭ দিন' },
            { id: 'month', label: '৩০ দিন' },
            { id: 'all', label: 'সর্বমোট' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePeriodSelect(p.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePeriod === p.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 dark:bg-stone-850 p-3 sm:p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>সবজি বিক্রয় লাভ</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className={`text-base sm:text-xl font-extrabold ${kpiStats.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {kpiStats.totalProfit >= 0 ? `+ ${formatTaka(kpiStats.totalProfit)}` : `- ${formatTaka(Math.abs(kpiStats.totalProfit))}`}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            মোট বিক্রয়: {formatTaka(kpiStats.totalSales)}
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3 sm:p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>সর্বাধিক লাভজনক</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
            {kpiStats.mostProfitable ? kpiStats.mostProfitable.itemName : 'তথ্য নেই'}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate">
            {kpiStats.mostProfitable ? `+ ${formatTaka(kpiStats.mostProfitable.totalProfit)} লাভ` : '-'}
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3 sm:p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>বিক্রিত মোট পণ্য</span>
            <Scale className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-stone-900 dark:text-stone-100">
            {toBengaliNumber(kpiStats.totalQuantity.toFixed(0))} <span className="text-xs font-normal">কেজি</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5 truncate">
            {kpiStats.highestVolume ? `শীর্ষ: ${kpiStats.highestVolume.itemName}` : 'সকল আইটেম'}
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-850 p-3 sm:p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>গড় মুনাফার হার</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {toBengaliNumber(kpiStats.overallMargin.toFixed(1))}%
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            ক্রয় খরচ: {formatTaka(kpiStats.totalCost)}
          </div>
        </div>
      </div>

      {/* Chart Configuration Bar: Mode Switcher, Category Filter & Sorter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-stone-50/70 dark:bg-stone-850 p-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs">
        
        {/* Metric Modes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setMetricMode('profitOnly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              metricMode === 'profitOnly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            📊 শুধু মোট লাভ (টাকা)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('salesVsCost')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              metricMode === 'salesVsCost'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            ⚖️ বিক্রয় বনাম ক্রয়মূল্য
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('margin')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              metricMode === 'margin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            📈 মুনাফার হার (%)
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-stone-400 text-[11px] hidden sm:inline">গ্রুপ:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="সবজি ক্যাটাগরি ফিল্টার"
              className="bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-700 dark:text-stone-200 font-medium"
            >
              {PRODUCE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-stone-400 text-[11px] hidden sm:inline">ক্রমানুসার:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="সাজানোর ক্রমানুসার"
              className="bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-700 dark:text-stone-200 font-medium"
            >
              <option value="profitDesc">সর্বোচ্চ লাভ</option>
              <option value="profitAsc">সর্বনিম্ন লাভ / ক্ষতি</option>
              <option value="salesDesc">সর্বোচ্চ বিক্রি</option>
              <option value="quantityDesc">সর্বোচ্চ ওজন (কেজি)</option>
              <option value="marginDesc">মুনাফার শতকরা হার</option>
            </select>
          </div>

          {/* Orientation Toggle */}
          <button
            type="button"
            onClick={() => setChartOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
            title="চার্ট অক্ষ অদলবদল করুন"
            className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-[11px] text-stone-600 dark:text-stone-300 hover:bg-stone-100 font-medium"
          >
            {chartOrientation === 'horizontal' ? 'অনুভূমিক ভিউ' : 'উল্লম্ব ভিউ'}
          </button>
        </div>
      </div>

      {/* Main Recharts Bar Chart Area */}
      {processedData.length === 0 ? (
        <div className="py-16 text-center text-stone-400 bg-stone-50 dark:bg-stone-850/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <Package className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
          <p className="text-sm font-semibold">নির্বাচিত সময়ে কোনো সবজি বিক্রয় পাওয়া যায়নি</p>
          <p className="text-xs text-stone-400 mt-1">
            অন্য সময়কাল নির্বাচন করুন অথবা বিক্রয় এন্ট্রি করুন।
          </p>
        </div>
      ) : (
        <div className="w-full relative">
          
          {chartOrientation === 'horizontal' ? (
            /* Horizontal Bar Layout (Ideal for long Bengali item names) */
            <div style={{ height: `${dynamicChartHeight}px`, minHeight: '380px' }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} opacity={0.15} />
                  
                  {/* Amount / Value on XAxis */}
                  <XAxis
                    type="number"
                    tickFormatter={(val) => metricMode === 'margin' ? `${toBengaliNumber(val)}%` : `৳${toBengaliNumber(val >= 1000 ? Math.round(val / 1000) + 'k' : val)}`}
                    tick={{ fontSize: 11, fill: '#78716c' }}
                  />

                  {/* Vegetable Names on YAxis */}
                  <YAxis
                    dataKey="itemName"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: '#44403c', fontWeight: 600 }}
                  />

                  <Tooltip content={<CustomItemTooltip />} />
                  <ReferenceLine x={0} stroke="#a8a29e" strokeWidth={1.5} />

                  {metricMode === 'profitOnly' && (
                    <Bar
                      dataKey="totalProfit"
                      name="মোট লাভ (৳)"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.itemId || index}`}
                          fill={entry.totalProfit >= 0 ? '#059669' : '#e11d48'}
                        />
                      ))}
                    </Bar>
                  )}

                  {metricMode === 'salesVsCost' && (
                    <>
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar
                        dataKey="totalSales"
                        name="মোট বিক্রয় (৳)"
                        fill="#0d9488"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      />
                      <Bar
                        dataKey="totalCost"
                        name="মোট ক্রয়মূল্য (৳)"
                        fill="#f59e0b"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      />
                      <Bar
                        dataKey="totalProfit"
                        name="নিট লাভ (৳)"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      />
                    </>
                  )}

                  {metricMode === 'margin' && (
                    <Bar
                      dataKey="profitMarginPercent"
                      name="মুনাফার শতকরা হার (%)"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-m-${entry.itemId || index}`}
                          fill={entry.profitMarginPercent >= 20 ? '#059669' : entry.profitMarginPercent >= 10 ? '#10b981' : entry.profitMarginPercent >= 0 ? '#f59e0b' : '#e11d48'}
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Vertical Bar Layout */
            <div style={{ height: '420px' }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  layout="horizontal"
                  margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  
                  <XAxis
                    dataKey="itemName"
                    tick={{ fontSize: 10, fill: '#44403c', fontWeight: 600 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={55}
                  />

                  <YAxis
                    tickFormatter={(val) => metricMode === 'margin' ? `${toBengaliNumber(val)}%` : `৳${toBengaliNumber(val >= 1000 ? Math.round(val / 1000) + 'k' : val)}`}
                    tick={{ fontSize: 11, fill: '#78716c' }}
                  />

                  <Tooltip content={<CustomItemTooltip />} />
                  <ReferenceLine y={0} stroke="#a8a29e" strokeWidth={1.5} />

                  {metricMode === 'profitOnly' && (
                    <Bar
                      dataKey="totalProfit"
                      name="মোট লাভ (৳)"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-v-${entry.itemId || index}`}
                          fill={entry.totalProfit >= 0 ? '#059669' : '#e11d48'}
                        />
                      ))}
                    </Bar>
                  )}

                  {metricMode === 'salesVsCost' && (
                    <>
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar
                        dataKey="totalSales"
                        name="মোট বিক্রয় (৳)"
                        fill="#0d9488"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                      />
                      <Bar
                        dataKey="totalCost"
                        name="মোট ক্রয়মূল্য (৳)"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                      />
                      <Bar
                        dataKey="totalProfit"
                        name="নিট লাভ (৳)"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={14}
                      />
                    </>
                  )}

                  {metricMode === 'margin' && (
                    <Bar
                      dataKey="profitMarginPercent"
                      name="মুনাফার শতকরা হার (%)"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    >
                      {processedData.map((entry, index) => (
                        <Cell
                          key={`cell-vm-${entry.itemId || index}`}
                          fill={entry.profitMarginPercent >= 20 ? '#059669' : entry.profitMarginPercent >= 10 ? '#10b981' : entry.profitMarginPercent >= 0 ? '#f59e0b' : '#e11d48'}
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Legend Notice */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
                <span>লাভজনক আইটেম</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block"></span>
                <span>ক্ষতিগ্রস্ত আইটেম</span>
              </span>
            </div>
            <span>মোট {toBengaliNumber(processedData.length)} টি সবজি প্রদর্শিত</span>
          </div>
        </div>
      )}

      {/* Toggle Detailed Breakdown Table */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setShowTableDetails(prev => !prev)}
          className="flex items-center justify-between w-full py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>সবজিভিত্তিক লাভ-ক্ষতির পূর্ণাঙ্গ তালিকা ও হিসাব বিবরণী</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            {showTableDetails ? 'তালিকা লুকান ▲' : 'তালিকা দেখুন ▼'}
          </span>
        </button>

        {showTableDetails && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/70 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">সবজির নাম ও গ্রুপ</th>
                  <th className="py-2.5 px-3 text-right">বিক্রিত পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">মোট বিক্রয় (৳)</th>
                  <th className="py-2.5 px-3 text-right">মোট ক্রয়মূল্য (৳)</th>
                  <th className="py-2.5 px-3 text-right font-bold">মোট লাভ (৳)</th>
                  <th className="py-2.5 px-3 text-right">লাভের হার (%)</th>
                  <th className="py-2.5 px-3 text-right">কেজি প্রতি লাভ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {processedData.map((item, idx) => {
                  const isProfit = item.totalProfit >= 0;
                  return (
                    <tr
                      key={item.itemId || idx}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-850/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-stone-800 dark:text-stone-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] flex items-center justify-center font-bold text-stone-500">
                            {toBengaliNumber(idx + 1)}
                          </span>
                          <div>
                            <div>{item.itemName}</div>
                            <span className="text-[10px] text-stone-400 font-normal">{item.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-medium">
                        {toBengaliNumber(item.totalQuantityKg.toFixed(1))} কেজি
                      </td>

                      <td className="py-2.5 px-3 text-right text-teal-700 dark:text-teal-400 font-semibold">
                        {formatTaka(item.totalSales)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-400">
                        {formatTaka(item.totalCost)}
                      </td>

                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {isProfit ? `+ ${formatTaka(item.totalProfit)}` : `- ${formatTaka(Math.abs(item.totalProfit))}`}
                      </td>

                      <td className="py-2.5 px-3 text-right font-semibold text-stone-700 dark:text-stone-300">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                          item.profitMarginPercent >= 15
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : item.profitMarginPercent >= 0
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {toBengaliNumber(item.profitMarginPercent.toFixed(1))}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-stone-500 text-[11px]">
                        {formatTaka(Math.round(item.profitPerKg))}/কেজি
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
