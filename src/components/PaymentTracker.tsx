import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  Building, 
  Banknote, 
  Search,
  Filter
} from 'lucide-react';
import { PaymentTransaction, Customer, Supplier, SaleRecord, PurchaseRecord, BusinessExpense } from '../types';
import { formatTaka, formatBanglaDate, toBengaliNumber } from '../utils/formatters';

interface PaymentTrackerProps {
  transactions: PaymentTransaction[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: BusinessExpense[];
  customers: Customer[];
  suppliers: Supplier[];
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  transactions,
  sales,
  purchases,
  expenses,
  customers,
  suppliers
}) => {
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate totals by payment method from sales, expenses, and purchases
  // Cash In: Sales paid amount + Customer due collections
  const totalCashSales = sales.filter(s => s.paymentMethod === 'নগদ').reduce((acc, s) => acc + s.paidAmount, 0);
  const totalBkashSales = sales.filter(s => s.paymentMethod === 'বিকাশ').reduce((acc, s) => acc + s.paidAmount, 0);
  const totalNagadSales = sales.filter(s => s.paymentMethod === 'নগদ-মোবাইল').reduce((acc, s) => acc + s.paidAmount, 0);
  const totalBankSales = sales.filter(s => s.paymentMethod === 'ব্যাংক').reduce((acc, s) => acc + s.paidAmount, 0);

  // Extra customer direct due collections
  const extraCollections = transactions.filter(t => t.type === 'in');
  const extraCashIn = extraCollections.filter(t => t.method === 'নগদ').reduce((acc, t) => acc + t.amount, 0);
  const extraBkashIn = extraCollections.filter(t => t.method === 'বিকাশ').reduce((acc, t) => acc + t.amount, 0);
  const extraNagadIn = extraCollections.filter(t => t.method === 'নগদ-মোবাইল').reduce((acc, t) => acc + t.amount, 0);
  const extraBankIn = extraCollections.filter(t => t.method === 'ব্যাংক').reduce((acc, t) => acc + t.amount, 0);

  const totalCashIn = totalCashSales + extraCashIn;
  const totalBkashIn = totalBkashSales + extraBkashIn;
  const totalNagadIn = totalNagadSales + extraNagadIn;
  const totalBankIn = totalBankSales + extraBankIn;
  const grandTotalIn = totalCashIn + totalBkashIn + totalNagadIn + totalBankIn;

  // Payments Out (Purchases paid + Expenses + Supplier debt payouts)
  const purchasesPaid = purchases.reduce((acc, p) => acc + p.paidAmount, 0);
  const expensesPaid = expenses.reduce((acc, e) => acc + e.amount, 0);
  const supplierTxOut = transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  const grandTotalOut = purchasesPaid + expensesPaid + supplierTxOut;

  // Dues
  const totalCustomerDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

  // Consolidated transaction history
  const allLogs: {
    id: string;
    title: string;
    type: 'in' | 'out';
    amount: number;
    method: string;
    date: string;
    note?: string;
  }[] = [
    ...sales.map(s => ({
      id: s.id,
      title: `বিক্রি মেমো: ${s.customerName} (${s.invoiceNo})`,
      type: 'in' as const,
      amount: s.paidAmount,
      method: s.paymentMethod,
      date: s.date,
      note: s.dueAmount > 0 ? `বাকি রয়েছে ${formatTaka(s.dueAmount)}` : 'পরিশোধ'
    })),
    ...purchases.map(p => ({
      id: p.id,
      title: `চালান ক্রয়: ${p.supplierName} (${p.chalanNo})`,
      type: 'out' as const,
      amount: p.paidAmount,
      method: p.paymentMethod,
      date: p.date,
      note: `গাড়িভাড়া সহ মোট চালান ${formatTaka(p.grandTotal)}`
    })),
    ...expenses.map(e => ({
      id: e.id,
      title: `খরচ: ${e.title} (${e.category})`,
      type: 'out' as const,
      amount: e.amount,
      method: e.paymentMethod,
      date: e.date,
      note: e.paidTo ? `প্রাপক: ${e.paidTo}` : undefined
    })),
    ...transactions.map(t => ({
      id: t.id,
      title: `${t.type === 'in' ? 'বাকি আদায়' : 'দেনা পরিশোধ'}: ${t.partyName}`,
      type: t.type,
      amount: t.amount,
      method: t.method,
      date: t.date,
      note: t.note
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || log.method === filterMethod;
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesMethod && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>পেমেন্ট ও ক্যাশ ট্র্যাকিং ড্যাশবোর্ড</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          নগদ ক্যাশ, বিকাশ, ব্যাংক ও বাকি খাতার সমন্বিত অর্থপ্রবাহ পর্যবেক্ষণ করুন।
        </p>
      </div>

      {/* Main Payment Channel Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Cash in Hand */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">নগদ ক্যাশ (Cash)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
            {formatTaka(totalCashIn)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">দোকান কাউন্টার নগদ জমা</span>
        </div>

        {/* bKash */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">বিকাশ ওয়ালেট (bKash)</span>
            <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400 flex items-center justify-center font-bold text-xs">
              bK
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400">
            {formatTaka(totalBkashIn)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">ডিজিটাল পেমেন্ট জমা</span>
        </div>

        {/* Bank */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">ব্যাংক জমা (Bank)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatTaka(totalBankIn)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">অ্যাকাউন্টে স্থানান্তরিত</span>
        </div>

        {/* Total Inflow vs Outflow */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">সর্বমোট পেমেন্ট জমা</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatTaka(grandTotalIn)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">মোট খরচ/পরিশোধ: {formatTaka(grandTotalOut)}</span>
        </div>

      </div>

      {/* Dues Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              বাজারে মোট বাকি পাওনা (ক্রেতাদের কাছে)
            </span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatTaka(totalCustomerDue)}
            </div>
          </div>
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-3 py-1.5 rounded-lg">
            {toBengaliNumber(customers.filter(c => c.currentDue > 0).length)} জন বাকিদার
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              মহাজন ও মোকামের মোট বকেয়া দেনা
            </span>
            <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {formatTaka(totalSupplierPayable)}
            </div>
          </div>
          <div className="text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-700 px-3 py-1.5 rounded-lg">
            {toBengaliNumber(suppliers.filter(s => s.currentPayable > 0).length)} জন মহাজন
          </div>
        </div>
      </div>

      {/* Transaction Feed Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="পেমেন্ট বা লেনদেন দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden dark:text-stone-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          >
            <option value="all">সকল লেনদেন</option>
            <option value="in">শুধুমাত্র জমা (Inflow)</option>
            <option value="out">শুধুমাত্র প্রদান (Outflow)</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          >
            <option value="all">সকল মাধ্যম</option>
            <option value="নগদ">নগদ</option>
            <option value="বিকাশ">বিকাশ</option>
            <option value="ব্যাংক">ব্যাংক</option>
          </select>
        </div>
      </div>

      {/* Live Transaction Ledger Table & Mobile Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-3">তারিখ ও সময়</th>
                <th className="py-3 px-3">বিবরণ / পার্টি</th>
                <th className="py-3 px-3 text-center">লেনদেনের ধরণ</th>
                <th className="py-3 px-3 text-center">পেমেন্ট মাধ্যম</th>
                <th className="py-3 px-3 text-right">পরিমাণ (টাকা)</th>
                <th className="py-3 px-3">মন্তব্য / স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-3 text-stone-500 text-xs">
                    {formatBanglaDate(log.date, true)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                    {log.title}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {log.type === 'in' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>জমা (In)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>পরিশোধ (Out)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {log.method}
                    </span>
                  </td>
                  <td className={`py-3 px-3 text-right font-bold text-sm ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {log.type === 'in' ? '+' : '-'} {formatTaka(log.amount)}
                  </td>
                  <td className="py-3 px-3 text-stone-500 text-xs">
                    {log.note || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    কোনো লেনদেনের তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Transaction Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3.5 space-y-2 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                    {log.title}
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    {formatBanglaDate(log.date, true)}
                  </span>
                </div>
                <div className={`font-black text-sm shrink-0 ${log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {log.type === 'in' ? '+' : '-'} {formatTaka(log.amount)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  {log.type === 'in' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <ArrowDownLeft className="w-2.5 h-2.5" />
                      <span>জমা</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      <span>পরিশোধ</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {log.method}
                  </span>
                </div>
                {log.note && (
                  <span className="text-[10px] text-stone-400 truncate max-w-[140px]">
                    {log.note}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-10 text-center text-xs text-stone-400">
              কোনো লেনদেনের তথ্য পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
