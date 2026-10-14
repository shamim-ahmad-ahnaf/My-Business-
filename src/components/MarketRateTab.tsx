import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Sparkles, 
  Info,
  CheckCircle2,
  Calculator,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Table,
  LineChart as LineChartIcon,
  Maximize2,
  RefreshCw,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { CalcInput } from './CalcInput';
import { MarketRate, VegetableItem, PriceHistoryPoint } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';
import { generate30DayPriceHistory, calculatePriceHistoryStats, PriceHistoryStats } from '../utils/marketRateHistory';

interface MarketRateTabProps {
  marketRates: MarketRate[];
  items?: VegetableItem[];
  onUpdateMarketRate: (updatedRate: MarketRate) => void;
}

export const MarketRateTab: React.FC<MarketRateTabProps> = ({
  marketRates,
  items = [],
  onUpdateMarketRate
}) => {
  // Chart state
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return marketRates.length > 0 ? marketRates[0].itemId : 'item-1';
  });
  const [timeHorizon, setTimeHorizon] = useState<7 | 15 | 30>(30);
  const [visibleLines, setVisibleLines] = useState<'both' | 'wholesale' | 'retail'>('both');
  const [showDataTable, setShowDataTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('সব');

  // Edit Rate Modal State
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);
  const [newWholesale, setNewWholesale] = useState<number>(0);
  const [newRetail, setNewRetail] = useState<number>(0);
  const [newNote, setNewNote] = useState('');

  // Ref to smoothly scroll to chart when user clicks "চার্টে দেখুন" from card
  const chartSectionRef = useRef<HTMLDivElement>(null);

  // Map items for category or additional details
  const itemMap = useMemo(() => {
    const map = new Map<string, VegetableItem>();
    items.forEach(i => map.set(i.id, i));
    return map;
  }, [items]);

  // Selected item's rate object
  const currentSelectedRate = useMemo(() => {
    return marketRates.find(r => r.itemId === selectedItemId) || marketRates[0];
  }, [marketRates, selectedItemId]);

  // Full 30-day historical points for the selected vegetable
  const full30DayHistory = useMemo(() => {
    if (!currentSelectedRate) return [];
    return generate30DayPriceHistory(currentSelectedRate, 30);
  }, [currentSelectedRate]);

  // Sliced points based on time horizon (7, 15, 30 days)
  const chartDisplayData = useMemo(() => {
    if (full30DayHistory.length <= timeHorizon) return full30DayHistory;
    return full30DayHistory.slice(full30DayHistory.length - timeHorizon);
  }, [full30DayHistory, timeHorizon]);

  // Analytics for the selected time horizon
  const historyStats: PriceHistoryStats | null = useMemo(() => {
    return calculatePriceHistoryStats(chartDisplayData);
  }, [chartDisplayData]);

  // Edit modal actions
  const handleEditClick = (rate: MarketRate) => {
    setEditingRate(rate);
    setNewWholesale(rate.todayWholesaleKg);
    setNewRetail(rate.todayRetailKg);
    setNewNote(rate.marketNote);
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate || newWholesale <= 0) return;

    const diff = newWholesale - editingRate.yesterdayWholesaleKg;
    let trend: 'up' | 'down' | 'same' = 'same';
    let changePercent = 0;

    if (diff > 0) {
      trend = 'up';
      changePercent = parseFloat(((diff / editingRate.yesterdayWholesaleKg) * 100).toFixed(1));
    } else if (diff < 0) {
      trend = 'down';
      changePercent = parseFloat(((diff / editingRate.yesterdayWholesaleKg) * 100).toFixed(1));
    }

    const now = new Date();
    const timeStr = `${toBengaliNumber(now.getHours() % 12 || 12)}:${now.getMinutes() < 10 ? '০' : ''}${toBengaliNumber(now.getMinutes())}`;
    const ampm = now.getHours() >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';

    const updated: MarketRate = {
      ...editingRate,
      yesterdayWholesaleKg: editingRate.todayWholesaleKg,
      todayWholesaleKg: newWholesale,
      todayRetailKg: newRetail,
      trend,
      changePercent,
      marketNote: newNote.trim() || editingRate.marketNote,
      lastUpdated: `আজ (${ampm} ${timeStr})`
    };

    onUpdateMarketRate(updated);
    setEditingRate(null);
  };

  // Scroll to chart and select item
  const handleInspectInChart = (itemId: string) => {
    setSelectedItemId(itemId);
    if (chartSectionRef.current) {
      chartSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Up and Down price items
  const priceHikeItems = marketRates.filter(r => r.trend === 'up');
  const priceDropItems = marketRates.filter(r => r.trend === 'down');

  // Filtered market rates for search and category
  const filteredRates = useMemo(() => {
    return marketRates.filter(rate => {
      const itemInfo = itemMap.get(rate.itemId);
      const matchesSearch = searchTerm.trim() === '' || 
        rate.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.marketNote.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'সব' || 
        (itemInfo && itemInfo.category === categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [marketRates, searchTerm, categoryFilter, itemMap]);

  // Categories list
  const availableCategories = ['সব', 'নিত্যপ্রয়োজনীয়', 'শাকসবজি', 'ফলমূল', 'মসলাপাতি'];

  // Custom Chart Tooltip
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PriceHistoryPoint;
      return (
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xl text-xs space-y-2 min-w-[210px] z-50">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5 font-bold text-stone-800 dark:text-stone-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{data.formattedDateBn}</span>
            </span>
            <span className="text-[10px] text-stone-400 font-medium">দিন #{toBengaliNumber(data.dayNumber)}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                <span>পাইকারি দর:</span>
              </span>
              <span className="font-extrabold text-stone-900 dark:text-stone-100">
                ৳{toBengaliNumber(data.wholesalePrice)} /কেজি
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                <span>খুচরা বিক্রয় দর:</span>
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{toBengaliNumber(data.retailPrice)} /কেজি
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-dashed border-stone-200 dark:border-stone-800 text-[11px]">
              <span className="text-stone-500 dark:text-stone-400">মুনাফা ব্যবধান (Margin):</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                ৳{toBengaliNumber(data.margin)} ({toBengaliNumber(data.marginPercent)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>🏷️ দৈনিক কাঁচাবাজার দর ও মূল্য পরিবর্তনের আপডেট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            প্রতিদিন মোকাম ও আড়তের পাইকারি ও খুচরা দর নির্ধারণ করুন এবং বিগত ৩০ দিনের ঐতিহাসিক দর পরিবর্তন পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Quick Summary Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <LineChartIcon className="w-4 h-4 text-indigo-600" />
            <span>মোট {toBengaliNumber(marketRates.length)} টি পণ্যের দর ট্র্যাক হচ্ছে</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 30-DAY PRICE COMPARISON LINE CHART COMPONENT SECTION                      */}
      {/* ========================================================================= */}
      <div 
        ref={chartSectionRef}
        className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-indigo-200/80 dark:border-indigo-900/60 p-4 sm:p-6 shadow-sm space-y-6 relative overflow-hidden"
      >
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-indigo-500/5 via-emerald-500/5 to-transparent pointer-events-none -z-0" />

        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>বিগত ৩০ দিনের পাইকারি ও খুচরা মূল্যের তুলনামূলক লাইন চার্ট</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    দৈনিক ট্রেন্ড
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  প্রতিটি সবজির আড়ত পাইকারি এবং বাজারের খুচরা বিক্রয় দরের পরিবর্তন ও মুনাফা ব্যবধান
                </p>
              </div>
            </div>
          </div>

          {/* Right Top Controls: Time Horizon & Line Visibility */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end lg:self-auto">
            {/* Time Horizon Selector (7d, 15d, 30d) */}
            <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setTimeHorizon(7)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  timeHorizon === 7
                    ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                গত ৭ দিন
              </button>
              <button
                type="button"
                onClick={() => setTimeHorizon(15)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  timeHorizon === 15
                    ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                গত ১৫ দিন
              </button>
              <button
                type="button"
                onClick={() => setTimeHorizon(30)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  timeHorizon === 30
                    ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                গত ৩০ দিন
              </button>
            </div>

            {/* Line Filter Toggle */}
            <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setVisibleLines('both')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  visibleLines === 'both'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                উভয় দর
              </button>
              <button
                type="button"
                onClick={() => setVisibleLines('wholesale')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  visibleLines === 'wholesale'
                    ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                শুধু পাইকারি
              </button>
              <button
                type="button"
                onClick={() => setVisibleLines('retail')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  visibleLines === 'retail'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                শুধু খুচরা
              </button>
            </div>

            {/* Data table toggle */}
            <button
              type="button"
              onClick={() => setShowDataTable(!showDataTable)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                showDataTable
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
              }`}
              title="দৈনিক বিস্তারিত তালিকা"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showDataTable ? 'টেবিল বন্ধ' : 'বিস্তারিত তালিকা'}</span>
            </button>
          </div>
        </div>

        {/* Vegetable Selection Control Bar */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <span>সবজি / পণ্য নির্বাচন করুন:</span>
              <span className="text-[11px] font-normal text-stone-500">
                (যে কোনো পণ্যে ক্লিক করে ৩০ দিনের লাইন চার্ট ও হিসেব দেখুন)
              </span>
            </label>

            {/* Direct Select Dropdown for Mobile & Desktop */}
            <div className="relative sm:w-72">
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-white dark:bg-stone-800 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
              >
                {marketRates.map(r => (
                  <option key={r.itemId} value={r.itemId}>
                    {r.itemName} — পাইকারি: ৳{toBengaliNumber(r.todayWholesaleKg)} | খুচরা: ৳{toBengaliNumber(r.todayRetailKg)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Selection Chips/Pills for Fast Tap */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {marketRates.map(rate => {
              const isSelected = rate.itemId === selectedItemId;
              return (
                <button
                  key={rate.itemId}
                  type="button"
                  onClick={() => setSelectedItemId(rate.itemId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102 ring-2 ring-indigo-200 dark:ring-indigo-900'
                      : 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <span>{rate.itemName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected 
                      ? 'bg-indigo-700 text-indigo-100' 
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                  }`}>
                    ৳{toBengaliNumber(rate.todayWholesaleKg)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Vegetable 30-Day Key Analytics Cards */}
        {currentSelectedRate && historyStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Today's Spot Rates */}
            <div className="bg-stone-50 dark:bg-stone-800/70 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-semibold text-stone-500 block">
                আজকের স্পট বাজার দর
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  ৳{toBengaliNumber(currentSelectedRate.todayWholesaleKg)}
                </span>
                <span className="text-xs text-stone-400">পাইকারি</span>
                <span className="text-xs text-stone-300">|</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  ৳{toBengaliNumber(currentSelectedRate.todayRetailKg)}
                </span>
                <span className="text-xs text-stone-400">খুচরা</span>
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                আজকের লাভ মার্জিন: ৳{toBengaliNumber(currentSelectedRate.todayRetailKg - currentSelectedRate.todayWholesaleKg)} /কেজি
              </div>
            </div>

            {/* Card 2: 30-Day Net Price Change */}
            <div className="bg-stone-50 dark:bg-stone-800/70 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-semibold text-stone-500 block">
                {toBengaliNumber(timeHorizon)} দিনে পাইকারি দর পরিবর্তন
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {historyStats.wholesaleChange > 0 && (
                  <span className="flex items-center gap-1 font-extrabold text-rose-600 dark:text-rose-400 text-base sm:text-lg">
                    <ArrowUpRight className="w-5 h-5" />
                    <span>+৳{toBengaliNumber(historyStats.wholesaleChange)}</span>
                  </span>
                )}
                {historyStats.wholesaleChange < 0 && (
                  <span className="flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                    <ArrowDownRight className="w-5 h-5" />
                    <span>-৳{toBengaliNumber(Math.abs(historyStats.wholesaleChange))}</span>
                  </span>
                )}
                {historyStats.wholesaleChange === 0 && (
                  <span className="flex items-center gap-1 font-extrabold text-stone-600 dark:text-stone-300 text-base sm:text-lg">
                    <Minus className="w-5 h-5" />
                    <span>৳০</span>
                  </span>
                )}
                <span className="text-xs font-bold text-stone-500">
                  ({toBengaliNumber(historyStats.wholesaleChangePercent)}%)
                </span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {toBengaliNumber(timeHorizon)} দিন আগে ছিল: ৳{toBengaliNumber(historyStats.startWholesale)}/কেজি
              </div>
            </div>

            {/* Card 3: 30-Day Range (Min & Max) */}
            <div className="bg-stone-50 dark:bg-stone-800/70 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-semibold text-stone-500 block">
                {toBengaliNumber(timeHorizon)} দিনের সর্বোচ্চ ও সর্বনিম্ন পাইকারি
              </span>
              <div className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 mt-1 flex items-center justify-between">
                <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                  সর্বোচ্চ: ৳{toBengaliNumber(historyStats.maxWholesale)}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  সর্বনিম্ন: ৳{toBengaliNumber(historyStats.minWholesale)}
                </span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                <span>খুচরা পরিধি:</span>
                <span>৳{toBengaliNumber(historyStats.minRetail)} – ৳{toBengaliNumber(historyStats.maxRetail)}</span>
              </div>
            </div>

            {/* Card 4: 30-Day Average & Spread Margin */}
            <div className="bg-stone-50 dark:bg-stone-800/70 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-semibold text-stone-500 block">
                {toBengaliNumber(timeHorizon)} দিনের গড় লাভ মার্জিন
              </span>
              <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                ৳{toBengaliNumber(historyStats.avgMargin)} <span className="text-xs font-normal text-stone-500">/কেজি ({toBengaliNumber(historyStats.avgMarginPercent)}%)</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                গড় পাইকারি: ৳{toBengaliNumber(historyStats.avgWholesale)} | খুচরা: ৳{toBengaliNumber(historyStats.avgRetail)}
              </div>
            </div>

          </div>
        )}

        {/* Recharts Line Chart Container */}
        <div className="w-full bg-stone-50/60 dark:bg-stone-850/60 p-3 sm:p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800">
          
          {/* Chart Title and Legend Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                {currentSelectedRate.itemName} — গত {toBengaliNumber(timeHorizon)} দিনের মূল্য রেখাচিত্র
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {(visibleLines === 'both' || visibleLines === 'wholesale') && (
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-3.5 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full inline-block"></span>
                  <span>পাইকারি দর (Wholesale)</span>
                </div>
              )}
              {(visibleLines === 'both' || visibleLines === 'retail') && (
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-3.5 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full inline-block"></span>
                  <span>খুচরা দর (Retail)</span>
                </div>
              )}
            </div>
          </div>

          {/* LineChart Area */}
          <div className="h-72 sm:h-84 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartDisplayData}
                margin={{ top: 15, right: 15, left: 0, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#e2e8f0" 
                  className="dark:stroke-stone-800" 
                />
                
                <XAxis
                  dataKey="shortDateBn"
                  stroke="#78716c"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickMargin={8}
                  interval={timeHorizon === 30 ? 3 : timeHorizon === 15 ? 1 : 0}
                />
                
                <YAxis
                  stroke="#78716c"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickFormatter={(val: number) => `৳${toBengaliNumber(val)}`}
                  domain={['auto', 'auto']}
                  width={48}
                />
                
                <Tooltip content={<CustomLineTooltip />} />
                
                {/* Wholesale Reference Baseline */}
                {historyStats && (
                  <ReferenceLine 
                    y={historyStats.avgWholesale} 
                    stroke="#94a3b8" 
                    strokeDasharray="4 4"
                    label={{
                      value: `গড় পাইকারি ৳${toBengaliNumber(historyStats.avgWholesale)}`,
                      position: 'insideBottomRight',
                      fill: '#94a3b8',
                      fontSize: 10
                    }}
                  />
                )}

                {/* Line 1: Wholesale Price */}
                {(visibleLines === 'both' || visibleLines === 'wholesale') && (
                  <Line
                    type="monotone"
                    dataKey="wholesalePrice"
                    name="পাইকারি দর"
                    stroke="#4f46e5"
                    strokeWidth={2.75}
                    dot={{ r: timeHorizon <= 15 ? 3 : 2, fill: '#4f46e5', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#4338ca', stroke: '#c7d2fe', strokeWidth: 2 }}
                    animationDuration={600}
                  />
                )}

                {/* Line 2: Retail Price */}
                {(visibleLines === 'both' || visibleLines === 'retail') && (
                  <Line
                    type="monotone"
                    dataKey="retailPrice"
                    name="খুচরা দর"
                    stroke="#059669"
                    strokeWidth={2.75}
                    dot={{ r: timeHorizon <= 15 ? 3 : 2, fill: '#059669', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#047857', stroke: '#a7f3d0', strokeWidth: 2 }}
                    animationDuration={600}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Chart Footer Notes & Trend Commentary */}
          {historyStats && (
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">{historyStats.marketAnalysisBn}</span>
              </div>
              <button
                type="button"
                onClick={() => handleEditClick(currentSelectedRate)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto flex items-center gap-1 shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>আজকের দর পরিবর্তন করুন</span>
              </button>
            </div>
          )}

        </div>

        {/* Optional Expandable 30-Day Day-by-Day Table */}
        {showDataTable && (
          <div className="bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 p-4 space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-indigo-600" />
                <span>{currentSelectedRate.itemName} — বিগত ৩০ দিনের দৈনিক দর ও মার্জিন খতিয়ান</span>
              </h4>
              <span className="text-[11px] text-stone-500">
                সর্বমোট {toBengaliNumber(chartDisplayData.length)} টি এন্ট্রি
              </span>
            </div>

            <div className="overflow-x-auto max-h-64 scrollbar-thin">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-200/70 dark:bg-stone-700/70 text-stone-700 dark:text-stone-300 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3 text-right">পাইকারি দর (/কেজি)</th>
                    <th className="py-2 px-3 text-right">খুচরা দর (/কেজি)</th>
                    <th className="py-2 px-3 text-right">মুনাফা ব্যবধান (Margin)</th>
                    <th className="py-2 px-3 text-center">মার্জিন হার (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {[...chartDisplayData].reverse().map((point, idx) => (
                    <tr 
                      key={point.date}
                      className={idx === 0 ? 'bg-indigo-50/60 dark:bg-indigo-950/40 font-bold' : 'hover:bg-white dark:hover:bg-stone-800'}
                    >
                      <td className="py-1.5 px-3">
                        <span>{point.formattedDateBn}</span>
                        {idx === 0 && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-normal">আজ</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-right font-extrabold text-indigo-700 dark:text-indigo-400">
                        ৳{toBengaliNumber(point.wholesalePrice)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                        ৳{toBengaliNumber(point.retailPrice)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                        ৳{toBengaliNumber(point.margin)}
                      </td>
                      <td className="py-1.5 px-3 text-center font-semibold text-stone-600 dark:text-stone-300">
                        {toBengaliNumber(point.marginPercent)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MARKET MOVEMENT HIGHLIGHTS (TODAY'S HIKE & DROP)                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Price Drop Alert (সস্তায় আমদানি) */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm mb-2">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            <span>আজকের বাজারে যাদের দাম কমেছে (আমদানি বেশি)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {priceDropItems.map(item => (
              <button 
                key={item.itemId} 
                type="button"
                onClick={() => handleInspectInChart(item.itemId)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 hover:border-emerald-500 transition-colors shadow-xs"
                title="চার্টে দেখুন"
              >
                <span>{item.itemName}</span>
                <span className="text-[10px] text-emerald-500 font-bold">({toBengaliNumber(Math.abs(item.changePercent))}%)</span>
              </button>
            ))}
            {priceDropItems.length === 0 && (
              <span className="text-xs text-stone-500">আজ কোনো পণ্যের দর কমেনি</span>
            )}
          </div>
        </div>

        {/* Price Hike Alert (চড়া দর) */}
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs sm:text-sm mb-2">
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>আজকের বাজারে যাদের দাম বেড়েছে (চড়া সরবরাহ)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {priceHikeItems.map(item => (
              <button 
                key={item.itemId} 
                type="button"
                onClick={() => handleInspectInChart(item.itemId)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1 hover:border-rose-500 transition-colors shadow-xs"
                title="চার্টে দেখুন"
              >
                <span>{item.itemName}</span>
                <span className="text-[10px] text-rose-500 font-bold">(+{toBengaliNumber(item.changePercent)}%)</span>
              </button>
            ))}
            {priceHikeItems.length === 0 && (
              <span className="text-xs text-stone-500">আজ কোনো পণ্যের দর বাড়েনি</span>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH BAR FOR MARKET RATE CARDS                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>সকল সবজির বাজার দর কার্ড ও রেট বোর্ড ({toBengaliNumber(filteredRates.length)})</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            {availableCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="সবজি খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN MARKET RATE CARDS GRID                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRates.map((rate) => {
          const isUp = rate.trend === 'up';
          const isDown = rate.trend === 'down';
          const isSelected = rate.itemId === selectedItemId;

          return (
            <div 
              key={rate.itemId} 
              className={`bg-white dark:bg-stone-900 rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900/60' 
                  : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {rate.itemName}
                    </h3>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        চার্টে নির্বাচিত
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleInspectInChart(rate.itemId)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                      title="বিগত ৩০ দিনের লাইন চার্ট দেখুন"
                    >
                      <LineChartIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditClick(rate)}
                      className="p-1.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="আজকের দর আপডেট করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700 mb-3">
                  <div>
                    <span className="text-[11px] text-stone-500 block">আজকের পাইকারি দর</span>
                    <div className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                      ৳{toBengaliNumber(rate.todayWholesaleKg)} <span className="text-xs font-normal text-stone-500">/{rate.unit}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      পাল্লা (৫ কেজি): ৳{toBengaliNumber(rate.todayWholesaleKg * 5)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 block">খুচরা বিক্রয় দর</span>
                    <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ৳{toBengaliNumber(rate.todayRetailKg)} <span className="text-xs font-normal text-stone-500">/{rate.unit}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      গতকালের পাইকারি: ৳{toBengaliNumber(rate.yesterdayWholesaleKg)}
                    </div>
                  </div>
                </div>

                {/* Trend Badge & Spread Margin */}
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-stone-500">মূল্য পরিবর্তন:</span>
                  {isUp && (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{toBengaliNumber(rate.changePercent)}% বৃদ্ধি</span>
                    </span>
                  )}
                  {isDown && (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{toBengaliNumber(Math.abs(rate.changePercent))}% হ্রাস</span>
                    </span>
                  )}
                  {rate.trend === 'same' && (
                    <span className="inline-flex items-center gap-1 font-medium text-stone-400">
                      <Minus className="w-3.5 h-3.5" />
                      <span>অপরিবর্তিত</span>
                    </span>
                  )}
                </div>

                {/* Market note */}
                <p className="text-[11px] text-stone-600 dark:text-stone-400 bg-stone-100/70 dark:bg-stone-800/40 p-2 rounded border border-stone-200/60 dark:border-stone-700/60">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">মোকাম নোট: </span>
                  {rate.marketNote}
                </p>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2.5 border-t border-stone-100 dark:border-stone-800 mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{rate.lastUpdated}</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInspectInChart(rate.itemId)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <LineChartIcon className="w-3 h-3" />
                    <span>৩০ দিনের চার্ট</span>
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleEditClick(rate)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    দর পরিবর্তন
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT MARKET RATE                                                   */}
      {/* ========================================================================= */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {editingRate.itemName} - আজকের দর আপডেট
              </h3>
              <button 
                type="button"
                onClick={() => setEditingRate(null)} 
                className="text-stone-400 hover:text-stone-600 p-1 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-3 text-xs sm:text-sm">
              <div>
                <CalcInput
                  label="আজকের পাইকারি দর (টাকা/কেজি)"
                  value={newWholesale || 0}
                  onChange={setNewWholesale}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle={`${editingRate.itemName} - পাইকারি দর`}
                  align="right"
                  inputClassName="font-bold text-lg py-2"
                  required
                />
              </div>

              <div>
                <CalcInput
                  label="আজকের খুচরা দর (টাকা/কেজি)"
                  value={newRetail || 0}
                  onChange={setNewRetail}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle={`${editingRate.itemName} - খুচরা দর`}
                  align="right"
                  inputClassName="font-bold text-lg text-emerald-600 dark:text-emerald-400 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  বাজারের অবস্থা / মোকাম নোট
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="যেমন: সরবরাহ বৃদ্ধি পাওয়ায় দর কমেছে..."
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  দর সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
