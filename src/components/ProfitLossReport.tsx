import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Printer, 
  Calendar, 
  PieChart, 
  DollarSign, 
  Receipt,
  AlertCircle
} from 'lucide-react';
import { 
  SaleRecord, 
  BusinessExpense, 
  SpoilageRecord, 
  VegetableItem,
  BusinessProfile 
} from '../types';
import { formatTaka, formatBanglaDate, toBengaliNumber } from '../utils/formatters';

interface ProfitLossReportProps {
  sales: SaleRecord[];
  expenses: BusinessExpense[];
  spoilages: SpoilageRecord[];
  items: VegetableItem[];
  profile: BusinessProfile;
  onAddExpense: (expense: BusinessExpense) => void;
}

export const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  sales,
  expenses,
  spoilages,
  items,
  profile,
  onAddExpense
}) => {
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

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

  // Calculations
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

    onAddExpense(newExpense);
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
            <span>লাভ ও ক্ষতির পূর্ণাঙ্গ রিপোর্ট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            মোট বিক্রি, ক্রয়মূল্য, আড়ত পরিচালন খরচ এবং পচনজনিত ক্ষতি সমন্বয়ের পর সঠিক নিট মুনাফা।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>খরচ যোগ করুন</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>রিপোর্ট প্রিন্ট</span>
          </button>
        </div>
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
