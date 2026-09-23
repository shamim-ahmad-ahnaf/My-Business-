import React, { useState } from 'react';
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
  Calculator
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { MarketRate, VegetableItem } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

interface MarketRateTabProps {
  marketRates: MarketRate[];
  onUpdateMarketRate: (updatedRate: MarketRate) => void;
}

export const MarketRateTab: React.FC<MarketRateTabProps> = ({
  marketRates,
  onUpdateMarketRate
}) => {
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);
  const [newWholesale, setNewWholesale] = useState<number>(0);
  const [newRetail, setNewRetail] = useState<number>(0);
  const [newNote, setNewNote] = useState('');

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

  // Up and Down price items
  const priceHikeItems = marketRates.filter(r => r.trend === 'up');
  const priceDropItems = marketRates.filter(r => r.trend === 'down');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>🏷️ দৈনিক কাঁচাবাজার দর ও মূল্য পরিবর্তনের আপডেট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            প্রতিদিন মোকাম ও আড়তের পাইকারি ও খুচরা দর নির্ধারণ করুন। বিক্রয় মেমোতে এটি স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে।
          </p>
        </div>
      </div>

      {/* Market Movement Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Price Drop Alert (সস্তায় আমদানি) */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm mb-2">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            <span>আজকের বাজারে যাদের দাম কমেছে (আমদানি বেশি)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {priceDropItems.map(item => (
              <span key={item.itemId} className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span>{item.itemName}</span>
                <span className="text-[10px] text-emerald-500 font-bold">({toBengaliNumber(Math.abs(item.changePercent))}%)</span>
              </span>
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
              <span key={item.itemId} className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                <span>{item.itemName}</span>
                <span className="text-[10px] text-rose-500 font-bold">(+{toBengaliNumber(item.changePercent)}%)</span>
              </span>
            ))}
            {priceHikeItems.length === 0 && (
              <span className="text-xs text-stone-500">আজ কোনো পণ্যের দর বাড়েনি</span>
            )}
          </div>
        </div>

      </div>

      {/* Main Market Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketRates.map((rate) => {
          const isUp = rate.trend === 'up';
          const isDown = rate.trend === 'down';

          return (
            <div 
              key={rate.itemId} 
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    {rate.itemName}
                  </h3>
                  <button
                    onClick={() => handleEditClick(rate)}
                    className="p-1.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    title="দর আপডেট করুন"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
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

                {/* Trend Badge */}
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

              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800 mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>আপডেট: {rate.lastUpdated}</span>
                </span>
                <button
                  onClick={() => handleEditClick(rate)}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  পরিবর্তন
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Edit Market Rate */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {editingRate.itemName} - আজকের দর আপডেট
              </h3>
              <button onClick={() => setEditingRate(null)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
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
