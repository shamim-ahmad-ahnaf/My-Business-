import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  Boxes, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Plus, 
  Clock, 
  Truck, 
  Sparkles,
  Users,
  QrCode
} from 'lucide-react';
import { 
  VegetableItem, 
  SaleRecord, 
  PurchaseRecord, 
  Customer, 
  Supplier, 
  BusinessExpense, 
  SpoilageRecord, 
  MarketRate,
  BusinessProfile
} from '../types';
import { formatTaka, formatBanglaDate, formatWeight, toBengaliNumber } from '../utils/formatters';
import { SalesExpensesChart } from './SalesExpensesChart';
import { BackupAlertBanner } from './BackupAlertBanner';
import { BackupAlertStatus } from '../utils/backupAlertService';

interface DashboardProps {
  items: VegetableItem[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: BusinessExpense[];
  spoilages: SpoilageRecord[];
  marketRates: MarketRate[];
  onOpenSale?: () => void;
  onOpenPurchase?: () => void;
  onOpenSpoilage?: () => void;
  onViewInvoice: (sale: SaleRecord) => void;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenQrScanner?: () => void;
  backupAlertStatus?: BackupAlertStatus;
  onDownloadBackup?: () => void;
  onSnoozeBackupAlert?: (days?: number) => void;
  onManualSync?: () => void;
  profile?: BusinessProfile;
  onOpenSettings?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  sales,
  purchases,
  customers,
  suppliers,
  expenses,
  spoilages,
  marketRates,
  onOpenSale,
  onOpenPurchase,
  onOpenSpoilage,
  onViewInvoice,
  setActiveTab,
  onNavigate,
  onOpenQrScanner,
  backupAlertStatus,
  onDownloadBackup,
  onSnoozeBackupAlert,
  onManualSync,
  profile,
  onOpenSettings,
}) => {
  const navigate = (tab: string) => {
    let target = tab;
    if (tab === 'stock') target = 'inventory';
    else if (tab === 'khata') target = 'parties';
    else if (tab === 'profit-loss') target = 'reports';
    else if (tab === 'market-rates') target = 'rates';

    if (onNavigate) {
      onNavigate(target);
    } else if (setActiveTab) {
      setActiveTab(target);
    }
  };

  // Today's Date String ISO (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's sales
  const todaySales = sales.filter(s => s.date.slice(0, 10) === todayStr);
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayCashCollected = todaySales.reduce((acc, s) => acc + s.paidAmount, 0);

  // Today's COGS (Cost of goods sold)
  const todayCOGS = todaySales.reduce((acc, s) => {
    const saleCost = s.items.reduce((subAcc, i) => subAcc + (i.costPricePerKg * i.quantityInKg), 0);
    return acc + saleCost;
  }, 0);

  // Today's Expenses
  const todayExpenses = expenses
    .filter(e => e.date.slice(0, 10) === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  // Today's Spoilage loss
  const todaySpoilageLoss = spoilages
    .filter(sp => sp.date.slice(0, 10) === todayStr)
    .reduce((acc, sp) => acc + sp.lossAmount, 0);

  // Today's estimated net profit
  const todayGrossProfit = todaySalesTotal - todayCOGS;
  const todayNetProfit = todayGrossProfit - todayExpenses - todaySpoilageLoss;

  // Overall Receivables (Customers Due) & Payables (Suppliers)
  const totalCustomerDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

  // Total Stock Valuation
  const totalStockKg = items.reduce((acc, item) => acc + item.currentStockKg, 0);
  const totalStockValue = items.reduce((acc, item) => acc + (item.currentStockKg * item.avgPurchasePricePerKg), 0);

  // Low Stock Items (< minStockAlertKg)
  const lowStockItems = items.filter(item => item.currentStockKg <= item.minStockAlertKg);

  return (
    <div className="space-y-6">
      
      {/* Backup Alert System Periodic Reminder */}
      {backupAlertStatus && backupAlertStatus.isAlertActive && onDownloadBackup && (
        <BackupAlertBanner
          status={backupAlertStatus}
          onDownloadBackup={onDownloadBackup}
          onSyncNow={onManualSync}
          onSnooze={onSnoozeBackupAlert || (() => {})}
        />
      )}

      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-4 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            {profile?.logo && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {profile.logo.startsWith('data:') || profile.logo.startsWith('http') ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover bg-white" />
                ) : (
                  <span className="text-2xl sm:text-3xl">{profile.logo}</span>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>আজকের আড়ত ও কাঁচাবাজার সারসংক্ষেপ</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                স্বাগতম, {profile?.proprietorName || profile?.proprietor || 'ব্যবসায়ী ভাই'}! শুভ ব্যবসা হোক।
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-emerald-100/80">
                <span>{profile?.businessName || 'কাঁচামাল আড়ত ও সবজি ভাণ্ডার'}</span>
                {onOpenSettings && (profile?.proprietorName === 'মো: রফিকুল ইসলাম' || !profile?.logo) && (
                  <button
                    onClick={onOpenSettings}
                    className="text-amber-300 hover:text-amber-200 underline text-xs font-medium transition-colors"
                  >
                    ✏️ নিজের নাম ও লোগো সেট করুন
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action quick buttons (Desktop) */}
          <div className="hidden sm:flex flex-wrap gap-2.5">
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                title="ক্যামেরা দিয়ে মেমো কিউআর স্ক্যান করুন"
              >
                <QrCode className="w-4 h-4 text-emerald-950" />
                <span>মেমো স্ক্যান</span>
              </button>
            )}
            <button
              onClick={() => onOpenSale ? onOpenSale() : navigate('sales')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>বিক্রি মেমো</span>
            </button>
            <button
              onClick={() => onOpenPurchase ? onOpenPurchase() : navigate('purchases')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm border border-emerald-500/40 transition-all active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>নতুন চালান</span>
            </button>
            <button
              onClick={() => onOpenSpoilage ? onOpenSpoilage() : navigate('inventory')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-rose-200 font-medium text-xs sm:text-sm border border-rose-500/30 transition-all active:scale-95"
              title="সবজি নষ্ট বা পচনের হিসাব রেকর্ড করুন"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>পচন এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Quick Actions Grid (Touch-First) */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-emerald-700/50 sm:hidden relative z-10">
          <button
            onClick={() => onOpenSale ? onOpenSale() : navigate('sales')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-600/90 text-white active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-xs mb-1">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold">বিক্রি মেমো</span>
          </button>

          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-700/80 text-white active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-stone-900 flex items-center justify-center shadow-xs mb-1">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold">কিউআর স্ক্যান</span>
            </button>
          )}

          <button
            onClick={() => onOpenPurchase ? onOpenPurchase() : navigate('purchases')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-700/80 text-white active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs mb-1">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">নতুন চালান</span>
          </button>

          <button
            onClick={() => navigate('parties')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-700/80 text-white active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">বাকি খাতা</span>
          </button>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Low Stock Warning Alert if any item is low */}
      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block sm:inline">সতর্কবার্তা: </strong>
            <span>{toBengaliNumber(lowStockItems.length)} টি পণ্যের মজুত প্রায় শেষ পর্যায়ে! </span>
            <span className="font-medium text-amber-800 dark:text-amber-300">
              ({lowStockItems.map(i => `${i.nameBn} বাকি ${formatWeight(i.currentStockKg)}`).join(', ')})
            </span>
          </div>
          <button
            onClick={() => navigate('stock')}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline underline-offset-2 shrink-0 hover:text-amber-900"
          >
            মজুত দেখুন
          </button>
        </div>
      )}

      {/* Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Today's Sales */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">আজকের মোট বিক্রি</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {formatTaka(todaySalesTotal)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>নগদ জমা: {formatTaka(todayCashCollected)}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {toBengaliNumber(todaySales.length)} টি মেমো
            </span>
          </div>
        </div>

        {/* Card 2: Today's Net Profit */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">আজকের আনুমানিক নিট লাভ</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-bold ${todayNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatTaka(todayNetProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>মোট লাভ: {formatTaka(todayGrossProfit)}</span>
            <button 
              onClick={() => navigate('profit-loss')}
              className="text-stone-600 dark:text-stone-300 font-medium hover:underline"
            >
              রিপোর্ট
            </button>
          </div>
        </div>

        {/* Card 3: Total Customer Receivables (বাকি) */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">বাজারে মোট বাকি পাওনা</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatTaka(totalCustomerDue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>মহাজন দেনা: {formatTaka(totalSupplierPayable)}</span>
            <button 
              onClick={() => navigate('khata')}
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
            >
              বাকি খাতা
            </button>
          </div>
        </div>

        {/* Card 4: Total Stock Valuation */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">বর্তমান মোট মজুদ মূল্য</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {formatTaka(totalStockValue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>মোট ওজন: {formatWeight(totalStockKg)}</span>
            <button 
              onClick={() => navigate('stock')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              মজুদ তালিকা
            </button>
          </div>
        </div>

      </div>

      {/* Daily Sales vs Expenses Visual Performance Chart (Recharts) */}
      <SalesExpensesChart
        sales={sales}
        expenses={expenses}
        spoilages={spoilages}
      />

      {/* Middle Grid: Live Market Ticker & Recent Sales Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Recent Sales & Fast Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>সাম্প্রতিক বিক্রয় মেমো</span>
            </h3>
            <button
              onClick={() => navigate('sales')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>সকল বিক্রি দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">মেমো নং</th>
                    <th className="py-2.5 px-3">ক্রেতা</th>
                    <th className="py-2.5 px-3">পণ্যসমূহ</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                    <th className="py-2.5 px-3 text-center">পরিশোধ</th>
                    <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs font-medium text-stone-700 dark:text-stone-300">
                        {sale.invoiceNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-900 dark:text-stone-100">{sale.customerName}</div>
                        <div className="text-[11px] text-stone-400">{formatBanglaDate(sale.date)}</div>
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300 text-xs max-w-[180px] truncate">
                        {sale.items.map(i => `${i.itemName} (${toBengaliNumber(i.quantity)} ${i.unit})`).join(', ')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                        {formatTaka(sale.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sale.dueAmount === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            পরিশোধ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            বাকি {formatTaka(sale.dueAmount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-300 hover:text-emerald-700 transition-colors"
                        >
                          ইনভয়েস
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        এখনও কোনো বিক্রয় রেকর্ড করা হয়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View (Layout B: Interactive Tap Rows) */}
            <div className="sm:hidden divide-y divide-stone-100 dark:divide-stone-800">
              {sales.slice(0, 5).map((sale) => (
                <div 
                  key={sale.id}
                  onClick={() => onViewInvoice(sale)}
                  className="p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/50 active:bg-stone-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      #{sale.invoiceNo}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {formatBanglaDate(sale.date)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {sale.customerName}
                    </h4>
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {formatTaka(sale.grandTotal)}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 truncate">
                    {sale.items.map(i => `${i.itemName} (${toBengaliNumber(i.quantity)} ${i.unit})`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                    <div>
                      {sale.dueAmount === 0 ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ সম্পূর্ণ পরিশোধ
                        </span>
                      ) : (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                          বাকি: {formatTaka(sale.dueAmount)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      মেমো দেখুন →
                    </span>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="py-8 text-center text-xs text-stone-400">
                  এখনও কোনো বিক্রয় রেকর্ড করা হয়নি
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Daily Market Price Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>🏷️ আজকের পাইকারি বাজার দর</span>
            </h3>
            <button
              onClick={() => navigate('market-rates')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              সকল দর
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs space-y-3">
            <p className="text-xs text-stone-500">
              দৈনিক আড়তের যাচাইকৃত পাইকারি ও খুচরা দর তালিকা:
            </p>
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {marketRates.slice(0, 6).map((rate) => (
                <div key={rate.itemId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                      {rate.itemName}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      খুচরা: ৳{toBengaliNumber(rate.todayRetailKg)}/{rate.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      ৳{toBengaliNumber(rate.todayWholesaleKg)}/{rate.unit}
                    </span>
                    <span className={`inline-flex items-center text-[10px] font-semibold ${
                      rate.trend === 'up' 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : rate.trend === 'down' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-stone-400'
                    }`}>
                      {rate.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {rate.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                      {rate.changePercent !== 0 ? `${toBengaliNumber(Math.abs(rate.changePercent))}%` : 'স্থির'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => navigate('market-rates')}
                className="w-full py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
              >
                বাজার দর আপডেট করুন
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
