import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Receipt,
  FileText,
  X,
  AlertCircle,
  Eye,
  Filter,
  Layers,
  List,
  Sparkles,
  Award,
  Wallet
} from 'lucide-react';
import { SaleRecord, BusinessExpense, SpoilageRecord } from '../types';
import { formatTaka, toBengaliNumber, formatBanglaDate } from '../utils/formatters';

interface MonthlyFinancialCalendarProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages?: SpoilageRecord[];
  onViewInvoice?: (sale: SaleRecord) => void;
  onNavigate?: (tab: string) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const WEEKDAY_NAMES_BN = [
  { short: 'শনি', full: 'শনিবার' },
  { short: 'রবি', full: 'রবিবার' },
  { short: 'সোম', full: 'সোমবার' },
  { short: 'মঙ্গল', full: 'মঙ্গলবার' },
  { short: 'বুধ', full: 'বুধবার' },
  { short: 'বৃহঃ', full: 'বৃহস্পতিবার' },
  { short: 'শুক্র', full: 'শুক্রবার' }
];

interface DaySummary {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  monthNumber: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFriday: boolean;
  sales: SaleRecord[];
  salesTotal: number;
  paidTotal: number;
  dueTotal: number;
  expenses: BusinessExpense[];
  expensesTotal: number;
  spoilages: SpoilageRecord[];
  spoilageLoss: number;
  netBalance: number;
  hasActivity: boolean;
}

interface MonthlyMetrics {
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  totalExpenses: number;
  totalSpoilage: number;
  netProfit: number;
  totalOrders: number;
  bestDay: DaySummary | null;
  activeDaysCount: number;
  avgDailySales: number;
}

export const MonthlyFinancialCalendar: React.FC<MonthlyFinancialCalendarProps> = ({
  sales,
  expenses,
  spoilages = [],
  onViewInvoice,
  onNavigate
}) => {
  // Determine initial month & year:
  // If there are sales, prioritize the latest sale's month, or fall back to current real date
  const initialDate = useMemo(() => {
    if (sales.length > 0) {
      const dates = sales.map(s => new Date(s.date).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
        const latestTime = Math.max(...dates);
        return new Date(latestTime);
      }
    }
    return new Date();
  }, [sales]);

  const [currentYear, setCurrentYear] = useState<number>(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => initialDate.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [activityFilter, setActivityFilter] = useState<'all' | 'sales' | 'expenses'>('all');

  const realTodayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Jump to today's month & year
  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  // Pre-calculate daily data map for the selected month to ensure instant rendering
  const daysInCalendar = useMemo(() => {
    const days: DaySummary[] = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInCurrentMonth = lastDayOfMonth.getDate();

    // In Bangladesh, the traditional business week begins on Saturday
    // getDay(): 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    // Convert to Saturday-first offset: Sat=0, Sun=1, ..., Fri=6
    const firstDayOffset = (firstDayOfMonth.getDay() + 1) % 7;

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;

      const daySales = sales.filter(s => s.date.slice(0, 10) === dateStr);
      const dayExpenses = expenses.filter(e => e.date.slice(0, 10) === dateStr);
      const daySpoilages = spoilages.filter(sp => sp.date.slice(0, 10) === dateStr);

      const salesTotal = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      const paidTotal = daySales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      const dueTotal = daySales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const spoilageLoss = daySpoilages.reduce((sum, sp) => sum + (sp.lossAmount || 0), 0);
      const netBalance = salesTotal - (expensesTotal + spoilageLoss);

      days.push({
        dateStr,
        dayNumber: dayNum,
        monthNumber: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isToday: dateStr === realTodayStr,
        isFriday: new Date(prevYear, prevMonth, dayNum).getDay() === 5,
        sales: daySales,
        salesTotal,
        paidTotal,
        dueTotal,
        expenses: dayExpenses,
        expensesTotal,
        spoilages: daySpoilages,
        spoilageLoss,
        netBalance,
        hasActivity: salesTotal > 0 || expensesTotal > 0 || spoilageLoss > 0
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;

      const daySales = sales.filter(s => s.date.slice(0, 10) === dateStr);
      const dayExpenses = expenses.filter(e => e.date.slice(0, 10) === dateStr);
      const daySpoilages = spoilages.filter(sp => sp.date.slice(0, 10) === dateStr);

      const salesTotal = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      const paidTotal = daySales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      const dueTotal = daySales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const spoilageLoss = daySpoilages.reduce((sum, sp) => sum + (sp.lossAmount || 0), 0);
      const netBalance = salesTotal - (expensesTotal + spoilageLoss);

      days.push({
        dateStr,
        dayNumber: dayNum,
        monthNumber: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        isToday: dateStr === realTodayStr,
        isFriday: new Date(currentYear, currentMonth, dayNum).getDay() === 5,
        sales: daySales,
        salesTotal,
        paidTotal,
        dueTotal,
        expenses: dayExpenses,
        expensesTotal,
        spoilages: daySpoilages,
        spoilageLoss,
        netBalance,
        hasActivity: salesTotal > 0 || expensesTotal > 0 || spoilageLoss > 0
      });
    }

    // Next month padding to reach full weeks (multiples of 7)
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remainingDays = (7 - (days.length % 7)) % 7;

    for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;

      const daySales = sales.filter(s => s.date.slice(0, 10) === dateStr);
      const dayExpenses = expenses.filter(e => e.date.slice(0, 10) === dateStr);
      const daySpoilages = spoilages.filter(sp => sp.date.slice(0, 10) === dateStr);

      const salesTotal = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      const paidTotal = daySales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      const dueTotal = daySales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
      const expensesTotal = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const spoilageLoss = daySpoilages.reduce((sum, sp) => sum + (sp.lossAmount || 0), 0);
      const netBalance = salesTotal - (expensesTotal + spoilageLoss);

      days.push({
        dateStr,
        dayNumber: dayNum,
        monthNumber: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: dateStr === realTodayStr,
        isFriday: new Date(nextYear, nextMonth, dayNum).getDay() === 5,
        sales: daySales,
        salesTotal,
        paidTotal,
        dueTotal,
        expenses: dayExpenses,
        expensesTotal,
        spoilages: daySpoilages,
        spoilageLoss,
        netBalance,
        hasActivity: salesTotal > 0 || expensesTotal > 0 || spoilageLoss > 0
      });
    }

    return days;
  }, [currentYear, currentMonth, sales, expenses, spoilages, realTodayStr]);

  // Monthly KPI aggregation for the selected month
  const monthlyMetrics = useMemo<MonthlyMetrics>(() => {
    const currentMonthDays = daysInCalendar.filter(d => d.isCurrentMonth);
    const totalSales = currentMonthDays.reduce((acc, d) => acc + d.salesTotal, 0);
    const totalPaid = currentMonthDays.reduce((acc, d) => acc + d.paidTotal, 0);
    const totalDue = currentMonthDays.reduce((acc, d) => acc + d.dueTotal, 0);
    const totalExpenses = currentMonthDays.reduce((acc, d) => acc + d.expensesTotal, 0);
    const totalSpoilage = currentMonthDays.reduce((acc, d) => acc + d.spoilageLoss, 0);
    const totalOutflow = totalExpenses + totalSpoilage;
    const netProfit = totalSales - totalOutflow;
    const totalOrders = currentMonthDays.reduce((acc, d) => acc + d.sales.length, 0);

    // Find best sales day
    let bestDay: DaySummary | null = null;
    let maxSales = 0;
    currentMonthDays.forEach(d => {
      if (d.salesTotal > maxSales) {
        maxSales = d.salesTotal;
        bestDay = d;
      }
    });

    // Active trading days count
    const activeDaysCount = currentMonthDays.filter(d => d.salesTotal > 0).length;
    const avgDailySales = activeDaysCount > 0 ? Math.round(totalSales / activeDaysCount) : 0;

    return {
      totalSales,
      totalPaid,
      totalDue,
      totalExpenses,
      totalSpoilage,
      netProfit,
      totalOrders,
      bestDay,
      activeDaysCount,
      avgDailySales
    };
  }, [daysInCalendar]);

  // Selected Day Details for the modal/drawer
  const activeDayDetails = useMemo(() => {
    if (!selectedDate) return null;
    return daysInCalendar.find(d => d.dateStr === selectedDate) || null;
  }, [selectedDate, daysInCalendar]);

  // Filtered days for agenda view
  const agendaDays = useMemo(() => {
    return daysInCalendar
      .filter(d => d.isCurrentMonth)
      .filter(d => {
        if (activityFilter === 'sales') return d.salesTotal > 0;
        if (activityFilter === 'expenses') return d.expensesTotal > 0 || d.spoilageLoss > 0;
        return d.hasActivity;
      })
      .sort((a, b) => b.dayNumber - a.dayNumber); // Most recent days first
  }, [daysInCalendar, activityFilter]);

  const bestDay = monthlyMetrics.bestDay;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-colors">
      
      {/* Calendar Header with Controls */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-r from-stone-50 via-white to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Month Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  মাসিক আয়-ব্যয় ক্যালেন্ডার
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  দৈনিক খতিয়ান
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                প্রতিদিনের মোট বিক্রয়, নগদ আদায় ও খরচের হিসাব একনজরে
              </p>
            </div>
          </div>

          {/* Month / Year Navigator Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="ক্যালেন্ডার গ্রিড ভিউ"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">গ্রিড</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="দৈনিক তালিকা ভিউ"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">তালিকা</span>
              </button>
            </div>

            {/* Previous Month */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              title="পূর্ববর্তী মাস"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current Month & Year Display Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-xs sm:text-sm tracking-wide min-w-[130px] text-center">
              {MONTH_NAMES_BN[currentMonth]} {toBengaliNumber(currentYear)}
            </div>

            {/* Next Month */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              title="পরবর্তী মাস"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* "আজ" Quick Button */}
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 transition-colors"
            >
              আজ
            </button>

          </div>
        </div>

        {/* Monthly Summary KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-3.5 border-t border-stone-200/80 dark:border-stone-800">
          
          {/* Total Sales in Month */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>মাসের মোট বিক্রি</span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {formatTaka(monthlyMetrics.totalSales)}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex justify-between">
              <span>মেমো: {toBengaliNumber(monthlyMetrics.totalOrders)} টি</span>
              <span>আদায়: {formatTaka(monthlyMetrics.totalPaid)}</span>
            </div>
          </div>

          {/* Total Expenses in Month */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400 mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>মাসের মোট খরচ ও ক্ষতি</span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatTaka(monthlyMetrics.totalExpenses + monthlyMetrics.totalSpoilage)}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex justify-between">
              <span>খরচ: {formatTaka(monthlyMetrics.totalExpenses)}</span>
              {monthlyMetrics.totalSpoilage > 0 && (
                <span className="text-amber-600 dark:text-amber-400">নষ্ট: {formatTaka(monthlyMetrics.totalSpoilage)}</span>
              )}
            </div>
          </div>

          {/* Monthly Net Margin */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal-700 dark:text-teal-400 mb-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>নিট ক্যাশ উদ্বৃত্ত/ব্যালেন্স</span>
            </div>
            <div className={`text-sm sm:text-lg font-bold ${
              monthlyMetrics.netProfit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatTaka(monthlyMetrics.netProfit)}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              <span>বাজারে বাকি বিক্রয়: {formatTaka(monthlyMetrics.totalDue)}</span>
            </div>
          </div>

          {/* Peak Sales Day */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>সর্বোচ্চ বিক্রির দিন</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
              {bestDay ? (
                <>
                  {toBengaliNumber(bestDay.dayNumber)} {MONTH_NAMES_BN[currentMonth]}
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 ml-1.5">
                    ({formatTaka(bestDay.salesTotal)})
                  </span>
                </>
              ) : (
                <span className="text-xs font-normal text-stone-400">তথ্য নেই</span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              গড় দৈনিক বিক্রি: {formatTaka(monthlyMetrics.avgDailySales)}
            </div>
          </div>

        </div>

      </div>

      {/* Main View: Grid vs Agenda */}
      {viewMode === 'grid' ? (
        <div className="p-3 sm:p-5">
          
          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {WEEKDAY_NAMES_BN.map((day, idx) => {
              const isFriday = idx === 6; // Last column is Friday (Juma day)
              return (
                <div
                  key={day.short}
                  className={`text-center py-1.5 text-xs font-bold rounded-lg ${
                    isFriday
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                      : 'bg-stone-100 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span className="hidden sm:inline">{day.full}</span>
                  <span className="sm:hidden">{day.short}</span>
                </div>
              );
            })}
          </div>

          {/* Calendar 7-column Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysInCalendar.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              const hasSales = day.salesTotal > 0;
              const hasExpenses = day.expensesTotal > 0 || day.spoilageLoss > 0;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedDate(day.dateStr);
                    }
                  }}
                  className={`relative min-h-[75px] sm:min-h-[105px] p-1.5 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group select-none ${
                    !day.isCurrentMonth
                      ? 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-100 dark:border-stone-800/50 opacity-40 hover:opacity-80'
                      : isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : day.isToday
                      ? 'bg-white dark:bg-stone-800/90 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/40 shadow-xs'
                      : day.hasActivity
                      ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs hover:shadow-xs'
                      : 'bg-white/60 dark:bg-stone-900/60 border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {/* Date Number and Today Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-colors ${
                        day.isToday
                          ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                          : day.isFriday && day.isCurrentMonth
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : day.isCurrentMonth
                          ? 'text-stone-800 dark:text-stone-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                          : 'text-stone-400 dark:text-stone-600'
                      }`}
                    >
                      {toBengaliNumber(day.dayNumber)}
                    </span>

                    {/* Today indicator text (desktop) */}
                    {day.isToday && (
                      <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        আজ
                      </span>
                    )}

                    {/* Order count badge */}
                    {day.sales.length > 0 && !day.isToday && (
                      <span className="hidden sm:inline-block text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                        {toBengaliNumber(day.sales.length)} মেমো
                      </span>
                    )}
                  </div>

                  {/* Daily Figures Summary (Sales & Expenses) */}
                  <div className="mt-1 space-y-0.5 sm:space-y-1">
                    {/* Sales Tag */}
                    {hasSales ? (
                      <div className="px-1 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] sm:text-[11px] truncate flex items-center justify-between">
                        <span className="truncate">+{formatTaka(day.salesTotal)}</span>
                        <span className="hidden sm:inline text-[9px] opacity-75">বিক্রি</span>
                      </div>
                    ) : null}

                    {/* Expense Tag */}
                    {hasExpenses ? (
                      <div className="px-1 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium text-[10px] sm:text-[11px] truncate flex items-center justify-between">
                        <span className="truncate">-{formatTaka(day.expensesTotal + day.spoilageLoss)}</span>
                        <span className="hidden sm:inline text-[9px] opacity-75">খরচ</span>
                      </div>
                    ) : null}

                    {/* Inactive Day Placeholder */}
                    {!hasSales && !hasExpenses && day.isCurrentMonth && (
                      <div className="h-4 flex items-center justify-center">
                        <span className="text-[11px] text-stone-300 dark:text-stone-700 font-mono">-</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Activity Dot indicator */}
                  {day.hasActivity && (
                    <div className="mt-1 flex items-center gap-1 justify-end sm:justify-start">
                      {hasSales && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="বিক্রয় লেনদেন" />
                      )}
                      {hasExpenses && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="খরচের রেকর্ড" />
                      )}
                      {day.dueTotal > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="বাকি বিক্রয় আছে" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color Legend Note */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>দৈনিক বিক্রি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>দৈনিক খরচ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>বাকি বিক্রয়</span>
              </div>
            </div>
            <div className="text-[11px] italic text-stone-400">
              * যে কোনো দিনে ক্লিক করে বিস্তারিত মেমো ও খরচের রসিদ দেখুন
            </div>
          </div>

        </div>
      ) : (
        /* Agenda / List View: Chronological stream for the selected month */
        <div className="p-4 sm:p-5 space-y-3">
          
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <span className="text-xs font-medium text-stone-500">
              {MONTH_NAMES_BN[currentMonth]} মাসের সক্রিয় দিনের তালিকা ({toBengaliNumber(agendaDays.length)} দিন):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActivityFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activityFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                সব দিন
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('sales')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activityFilter === 'sales'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                শুধু বিক্রি
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('expenses')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activityFilter === 'expenses'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                শুধু খরচ
              </button>
            </div>
          </div>

          {agendaDays.length > 0 ? (
            <div className="space-y-2.5">
              {agendaDays.map(day => (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-stone-900 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center shrink-0">
                      <span className="text-base font-bold text-stone-800 dark:text-stone-100 leading-tight">
                        {toBengaliNumber(day.dayNumber)}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {MONTH_NAMES_BN[day.monthNumber]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {formatBanglaDate(day.dateStr)}
                        </span>
                        {day.isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            আজ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-3">
                        <span>বিক্রয় মেমো: {toBengaliNumber(day.sales.length)} টি</span>
                        {day.expenses.length > 0 && (
                          <span>খরচ খাত: {toBengaliNumber(day.expenses.length)} টি</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-stone-800">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-stone-500 dark:text-stone-400">মোট বিক্রি</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatTaka(day.salesTotal)}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-stone-500 dark:text-stone-400">মোট খরচ</div>
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatTaka(day.expensesTotal + day.spoilageLoss)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500 dark:text-stone-400">নিট উদ্বৃত্ত</div>
                      <div className={`text-sm font-bold ${
                        day.netBalance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatTaka(day.netBalance)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 transition-colors shrink-0"
                    >
                      বিস্তারিত →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400 text-sm">
              এই মাসে কোনো লেনদেনের রেকর্ড পাওয়া যায়নি
            </div>
          )}

        </div>
      )}

      {/* Daily Detail Modal / Drawer Popup */}
      {selectedDate && activeDayDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {toBengaliNumber(activeDayDetails.dayNumber)}
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>{formatBanglaDate(activeDayDetails.dateStr)} এর বিস্তারিত হিসাব</span>
                    {activeDayDetails.isToday && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        আজ
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-stone-500">
                    দৈনিক বিক্রয় মেমো, আদায়কৃত ক্যাশ ও খরচের পূর্ণাঙ্গ বিবরণ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-lg bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600 flex items-center justify-center transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
              
              {/* Day's Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">
                    মোট বিক্রি
                  </span>
                  <span className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-300 block">
                    {formatTaka(activeDayDetails.salesTotal)}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {toBengaliNumber(activeDayDetails.sales.length)} টি মেমো
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 block mb-0.5">
                    নগদ আদায়
                  </span>
                  <span className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-300 block">
                    {formatTaka(activeDayDetails.paidTotal)}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    বাকি: {formatTaka(activeDayDetails.dueTotal)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
                  <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 block mb-0.5">
                    মোট খরচ
                  </span>
                  <span className="text-base sm:text-lg font-bold text-rose-800 dark:text-rose-300 block">
                    {formatTaka(activeDayDetails.expensesTotal + activeDayDetails.spoilageLoss)}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {toBengaliNumber(activeDayDetails.expenses.length)} টি খাত
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60">
                  <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400 block mb-0.5">
                    নিট উদ্বৃত্ত
                  </span>
                  <span className={`text-base sm:text-lg font-bold block ${
                    activeDayDetails.netBalance >= 0 ? 'text-teal-800 dark:text-teal-300' : 'text-rose-700 dark:text-rose-400'
                  }`}>
                    {formatTaka(activeDayDetails.netBalance)}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {activeDayDetails.netBalance >= 0 ? 'উদ্বৃত্ত/লাভ' : 'ঘাটতি'}
                  </span>
                </div>
              </div>

              {/* Sales Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>বিক্রয় মেমোসমূহ ({toBengaliNumber(activeDayDetails.sales.length)} টি)</span>
                  </h5>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(null);
                        onNavigate('sales');
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      বিক্রয় ম্যানেজারে যান →
                    </button>
                  )}
                </div>

                {activeDayDetails.sales.length > 0 ? (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50/50 dark:bg-stone-800/30">
                    {activeDayDetails.sales.map((sale) => (
                      <div key={sale.id} className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                              #{sale.invoiceNo}
                            </span>
                            <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                              {sale.customerName}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              ({sale.paymentMethod})
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {sale.items.map(i => `${i.itemName} (${toBengaliNumber(i.quantity)} ${i.unit})`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                          <div className="text-right">
                            <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                              {formatTaka(sale.grandTotal)}
                            </div>
                            <div className="text-[10px]">
                              {sale.dueAmount === 0 ? (
                                <span className="text-emerald-600 font-medium">পরিশোধ</span>
                              ) : (
                                <span className="text-rose-600 font-medium">বাকি {formatTaka(sale.dueAmount)}</span>
                              )}
                            </div>
                          </div>

                          {onViewInvoice && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(null);
                                onViewInvoice(sale);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-emerald-600 hover:border-emerald-300 flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>মেমো</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                    এই দিনে কোনো বিক্রয় রেকর্ড পাওয়া যায়নি
                  </div>
                )}
              </div>

              {/* Expenses Section */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>দৈনিক দোকান খরচসমূহ ({toBengaliNumber(activeDayDetails.expenses.length)} টি)</span>
                </h5>

                {activeDayDetails.expenses.length > 0 ? (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-stone-50/50 dark:bg-stone-800/30">
                    {activeDayDetails.expenses.map((exp) => (
                      <div key={exp.id} className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                              {exp.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              {exp.category}
                            </span>
                          </div>
                          {exp.paidTo && (
                            <div className="text-xs text-stone-500 mt-0.5">
                              প্রাপক: {exp.paidTo} ({exp.paymentMethod})
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
                          -{formatTaka(exp.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                    এই দিনে কোনো খরচের এন্ট্রি নেই
                  </div>
                )}
              </div>

              {/* Spoilages Section (if any on this day) */}
              {activeDayDetails.spoilages.length > 0 && (
                <div className="space-y-2.5">
                  <h5 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>নষ্ট মালের ক্ষতি ({toBengaliNumber(activeDayDetails.spoilages.length)} টি)</span>
                  </h5>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden bg-amber-50/30 dark:bg-amber-950/20">
                    {activeDayDetails.spoilages.map((sp) => (
                      <div key={sp.id} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                            {sp.itemName} ({toBengaliNumber(sp.quantityKg)} কেজি)
                          </span>
                          <div className="text-xs text-stone-500">
                            কারণ: {sp.reason} {sp.notes ? `• ${sp.notes}` : ''}
                          </div>
                        </div>
                        <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
                          ক্ষতি: {formatTaka(sp.lossAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                তারিখ: {formatBanglaDate(activeDayDetails.dateStr)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
              >
                ঠিক আছে
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
