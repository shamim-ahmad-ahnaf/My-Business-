import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Plus, 
  Download, 
  Search, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles,
  Edit2,
  Calculator,
  X,
  Mic
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { VoiceSearchButton } from './VoiceSearchButton';
import { VegetableItem, SpoilageRecord, UnitType } from '../types';
import { formatTaka, formatWeight, toBengaliNumber, formatBanglaDate } from '../utils/formatters';
import { exportStockToCsv } from '../utils/storage';

interface InventoryManagerProps {
  items: VegetableItem[];
  spoilages: SpoilageRecord[];
  onAddItem: (item: VegetableItem) => void;
  onUpdateStock: (itemId: string, newStockKg: number) => void;
  onAddSpoilage: (spoilage: SpoilageRecord) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  items,
  spoilages,
  onAddItem,
  onUpdateStock,
  onAddSpoilage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showSpoilageModal, setShowSpoilageModal] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<VegetableItem | null>(null);
  const [adjustedStockKg, setAdjustedStockKg] = useState<number>(0);

  // Spoilage Form State
  const [spoilItemId, setSpoilItemId] = useState<string>(items[0]?.id || '');
  const [spoilQtyKg, setSpoilQtyKg] = useState<number>(0);
  const [spoilReason, setSpoilReason] = useState<'পচে গেছে' | 'শুকিয়ে ওজন হ্রাস' | 'পরিবহনে ক্ষতিগ্রস্ত' | 'মান নষ্ট'>('পচে গেছে');
  const [spoilNotes, setSpoilNotes] = useState<string>('');

  // New Item Form State
  const [newItemNameBn, setNewItemNameBn] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'নিত্যপ্রয়োজনীয়' | 'শাকসবজি' | 'মসলাপাতি' | 'অন্যান্য'>('শাকসবজি');
  const [newItemStock, setNewItemStock] = useState<number>(0);
  const [newItemUnit, setNewItemUnit] = useState<UnitType>('কেজি');
  const [newItemPurchasePrice, setNewItemPurchasePrice] = useState<number>(0);
  const [newItemWholesalePrice, setNewItemWholesalePrice] = useState<number>(0);
  const [newItemRetailPrice, setNewItemRetailPrice] = useState<number>(0);
  const [newItemMinAlert, setNewItemMinAlert] = useState<number>(50);

  // Totals
  const totalStockKg = items.reduce((acc, i) => acc + i.currentStockKg, 0);
  const totalStockValue = items.reduce((acc, i) => acc + (i.currentStockKg * i.avgPurchasePricePerKg), 0);
  const lowStockCount = items.filter(i => i.currentStockKg <= i.minStockAlertKg).length;
  const totalSpoilageLoss = spoilages.reduce((acc, s) => acc + s.lossAmount, 0);

  const filteredItems = items.filter(item => {
    const rawSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = !rawSearch || 
                          item.nameBn.toLowerCase().includes(rawSearch) ||
                          item.nameEn.toLowerCase().includes(rawSearch);
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLowStock = !showOnlyLowStock || (item.currentStockKg <= item.minStockAlertKg);
    return matchesSearch && matchesCat && matchesLowStock;
  });

  const handleSpoilageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === spoilItemId);
    if (!item || spoilQtyKg <= 0) return;

    const lossAmount = Math.round(spoilQtyKg * item.avgPurchasePricePerKg);
    const newSpoilage: SpoilageRecord = {
      id: `spoil-${Date.now()}`,
      itemId: item.id,
      itemName: item.nameBn,
      quantityKg: spoilQtyKg,
      costPricePerKg: item.avgPurchasePricePerKg,
      lossAmount,
      reason: spoilReason,
      date: new Date().toISOString(),
      notes: spoilNotes
    };

    onAddSpoilage(newSpoilage);
    setShowSpoilageModal(false);
    setSpoilQtyKg(0);
    setSpoilNotes('');
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameBn.trim()) return;

    const newItem: VegetableItem = {
      id: `item-${Date.now()}`,
      nameBn: newItemNameBn.trim(),
      nameEn: newItemNameEn.trim() || newItemNameBn.trim(),
      category: newItemCategory,
      currentStockKg: newItemStock,
      defaultUnit: newItemUnit,
      avgPurchasePricePerKg: newItemPurchasePrice,
      currentWholesalePricePerKg: newItemWholesalePrice,
      currentRetailPricePerKg: newItemRetailPrice,
      minStockAlertKg: newItemMinAlert
    };

    onAddItem(newItem);
    setShowAddItemModal(false);
    // Reset
    setNewItemNameBn('');
    setNewItemNameEn('');
    setNewItemStock(0);
    setNewItemPurchasePrice(0);
    setNewItemWholesalePrice(0);
    setNewItemRetailPrice(0);
  };

  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockItem) return;
    onUpdateStock(editingStockItem.id, adjustedStockKg);
    setEditingStockItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <span>মজুত সবজি ও গুদাম ইনভেন্টরি</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            গোডাউনের তাজা কাঁচামালের সঠিক হিসাব, ঘাটতি ও পচনজনিত ক্ষতি পর্যবেক্ষণ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportStockToCsv(items)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>স্টক CSV</span>
          </button>
          <button
            onClick={() => setShowSpoilageModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            <span>পচন বা ক্ষতি এন্ট্রি</span>
          </button>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সবজি যোগ</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">মোট মজুদ সবজি</span>
          <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {formatWeight(totalStockKg)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {toBengaliNumber(items.length)} টি আইটেম অন্তর্ভুক্ত
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">মজুত সবজির মোট মূল্য</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatTaka(totalStockValue)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            বর্তমান গড় ক্রয়মূল্য ভিত্তিতে
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">মজুত সংকট (সতর্কতা)</span>
          <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {toBengaliNumber(lowStockCount)} টি সবজি
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            ন্যূনতম সীমার নিচে আছে
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">পচন ও ঘাটতি ক্ষতি</span>
          <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatTaka(totalSpoilageLoss)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {toBengaliNumber(spoilages.length)} বার নষ্ট মাল এন্ট্রি
          </span>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="সবজির নাম দিয়ে খুঁজুন বা মুখে বলুন (যেমন: আলু, পেঁয়াজ, টমেটো)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-16 py-1.5 text-xs sm:text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden dark:text-stone-100"
          />
          <div className="absolute right-1.5 top-1 flex items-center gap-0.5">
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                title="সার্চ মুছুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <VoiceSearchButton
              onTranscript={(text) => setSearchTerm(text)}
              placeholderHint="সবজির নাম মুখে বলুন (যেমন: আলু, পেঁয়াজ)..."
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          {['all', 'নিত্যপ্রয়োজনীয়', 'শাকসবজি', 'মসলাপাতি'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat && !showOnlyLowStock
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'সকল সবজি' : cat}
            </button>
          ))}

          {/* Low Stock Filter Button */}
          <button
            type="button"
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              showOnlyLowStock
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : lowStockCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
            }`}
            title="কম স্টক হওয়া পণ্যগুলো দেখুন"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 && !showOnlyLowStock ? 'animate-bounce text-amber-600' : ''}`} />
            <span>কম স্টক</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              showOnlyLowStock ? 'bg-white/30 text-white' : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
            }`}>
              {toBengaliNumber(lowStockCount)}
            </span>
          </button>
        </div>
      </div>

      {/* Stock Items Grid / Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-3">সবজির নাম</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3 text-right">বর্তমান মজুত</th>
                <th className="py-3 px-3 text-right">গড় ক্রয়দর</th>
                <th className="py-3 px-3 text-right">পাইকারি দর</th>
                <th className="py-3 px-3 text-right">খুচরা দর</th>
                <th className="py-3 px-3 text-right">মোট মজুদ মূল্য</th>
                <th className="py-3 px-3 text-center">স্টক অবস্থা</th>
                <th className="py-3 px-3 text-center">সংশোধন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredItems.map((item) => {
                const isLow = item.currentStockKg <= item.minStockAlertKg;
                const itemTotalVal = Math.round(item.currentStockKg * item.avgPurchasePricePerKg);
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors border-l-4 ${
                      isLow 
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-amber-500 hover:bg-amber-100/60 dark:hover:bg-amber-900/40' 
                        : 'hover:bg-stone-50/70 dark:hover:bg-stone-800/30 border-l-transparent'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{item.nameBn}</span>
                        {isLow && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" title="কম স্টক সতর্কতা" />
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400">{item.nameEn}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                      <div className={isLow ? 'text-amber-700 dark:text-amber-300 font-extrabold' : ''}>
                        {formatWeight(item.currentStockKg)}
                      </div>
                      {isLow && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          ন্যূনতম: {formatWeight(item.minStockAlertKg)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-stone-600 dark:text-stone-400">
                      ৳{toBengaliNumber(item.avgPurchasePricePerKg)}/কেজি
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                      ৳{toBengaliNumber(item.currentWholesalePricePerKg)}/কেজি
                    </td>
                    <td className="py-3 px-3 text-right text-stone-800 dark:text-stone-200">
                      ৳{toBengaliNumber(item.currentRetailPricePerKg)}/কেজি
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                      {formatTaka(itemTotalVal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/50 shadow-2xs animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>মজুত কম!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          পর্যাপ্ত
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setEditingStockItem(item);
                          setAdjustedStockKg(item.currentStockKg);
                        }}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
                        title="স্টক সংখ্যা সংশোধন করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards View */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {filteredItems.map((item) => {
            const isLow = item.currentStockKg <= item.minStockAlertKg;
            const itemTotalVal = Math.round(item.currentStockKg * item.avgPurchasePricePerKg);
            return (
              <div 
                key={item.id} 
                className={`p-4 transition-colors border-l-4 ${
                  isLow 
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-l-amber-500 hover:bg-amber-50/60' 
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{item.nameBn}</span>
                        {isLow && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                        )}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 block">{item.nameEn}</span>
                  </div>

                  {isLow ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/60 shrink-0 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>মজুত কম!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0">
                      পর্যাপ্ত স্টক
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl my-2">
                  <div>
                    <span className="text-[10px] text-stone-400 block">বর্তমান মজুত</span>
                    <span className={`text-sm font-bold block ${isLow ? 'text-amber-700 dark:text-amber-300 font-extrabold' : 'text-stone-900 dark:text-stone-100'}`}>
                      {formatWeight(item.currentStockKg)}
                    </span>
                    {isLow && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        সতর্কতা সীমা: {formatWeight(item.minStockAlertKg)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">মোট মজুদ মূল্য</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatTaka(itemTotalVal)}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
                    <span className="text-[10px] text-stone-400 block">পাইকারি দর</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ৳{toBengaliNumber(item.currentWholesalePricePerKg)}/কেজি
                    </span>
                  </div>
                  <div className="pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
                    <span className="text-[10px] text-stone-400 block">খুচরা / ক্রয়দর</span>
                    <span className="text-stone-600 dark:text-stone-300">
                      খুচরা: ৳{toBengaliNumber(item.currentRetailPricePerKg)} • ক্রয়: ৳{toBengaliNumber(item.avgPurchasePricePerKg)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={() => {
                      setEditingStockItem(item);
                      setAdjustedStockKg(item.currentStockKg);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>মজুত সংখ্যা পরিবর্তন</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-10 text-center text-xs text-stone-400">
              কোনো সবজি বা পণ্যের তথ্য পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>

      {/* Spoilage / Wastage Log Section */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>সাম্প্রতিক পচন ও ঘাটতি লগ</span>
          </h3>
          <span className="text-xs text-stone-400">
            সর্বমোট ক্ষতি: <strong className="text-rose-600">{formatTaka(totalSpoilageLoss)}</strong>
          </span>
        </div>

        {/* Desktop Spoilage Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-2 px-3">তারিখ</th>
                <th className="py-2 px-3">সবজির নাম</th>
                <th className="py-2 px-3">নষ্টের পরিমাণ</th>
                <th className="py-2 px-3">কারণ</th>
                <th className="py-2 px-3 text-right">আর্থিক ক্ষতি</th>
                <th className="py-2 px-3">মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {spoilages.slice(0, 5).map((sp) => (
                <tr key={sp.id}>
                  <td className="py-2.5 px-3 text-stone-400">{formatBanglaDate(sp.date, true)}</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-800 dark:text-stone-200">{sp.itemName}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">{toBengaliNumber(sp.quantityKg)} কেজি</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                      {sp.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatTaka(sp.lossAmount)}</td>
                  <td className="py-2.5 px-3 text-stone-500 italic">{sp.notes || '-'}</td>
                </tr>
              ))}
              {spoilages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    কোনো পচন বা নষ্ট মালের রেকর্ড নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Spoilage Cards */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {spoilages.slice(0, 5).map((sp) => (
            <div key={sp.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{sp.itemName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                    {sp.reason}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {formatBanglaDate(sp.date, true)} {sp.notes ? `• ${sp.notes}` : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block font-bold text-rose-600">{formatTaka(sp.lossAmount)}</span>
                <span className="text-[11px] text-stone-500 font-medium">{toBengaliNumber(sp.quantityKg)} কেজি</span>
              </div>
            </div>
          ))}

          {spoilages.length === 0 && (
            <div className="py-6 text-center text-xs text-stone-400">
              কোনো পচন বা নষ্ট মালের রেকর্ড নেই
            </div>
          )}
        </div>
      </div>

      {/* Modal: Spoilage / Wastage Logger */}
      {showSpoilageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <span>পচন বা ক্ষতি এন্ট্রি করুন</span>
              </h3>
              <button onClick={() => setShowSpoilageModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleSpoilageSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">নষ্ট হওয়া সবজি</label>
                <select
                  value={spoilItemId}
                  onChange={(e) => setSpoilItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.nameBn} (বর্তমান মজুদ {i.currentStockKg} কেজি)</option>
                  ))}
                </select>
              </div>

              <div>
                <CalcInput
                  label="পরিমাণ (কেজি হিসেবে)"
                  value={spoilQtyKg || 0}
                  onChange={setSpoilQtyKg}
                  unitPresets="weight"
                  suffix="কেজি"
                  calcTitle="নষ্ট মালের পরিমাণ হিসাব"
                  align="center"
                  inputClassName="font-bold py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">নষ্ট হওয়ার কারণ</label>
                <select
                  value={spoilReason}
                  onChange={(e) => setSpoilReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                >
                  <option value="পচে গেছে">পচে গেছে (Rotten)</option>
                  <option value="শুকিয়ে ওজন হ্রাস">শুকিয়ে ওজন হ্রাস (Moisture Loss)</option>
                  <option value="পরিবহনে ক্ষতিগ্রস্ত">পরিবহনে ক্ষতিগ্রস্ত (Crushed)</option>
                  <option value="মান নষ্ট">মান নষ্ট / পোকায় ধরা</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={spoilNotes}
                  onChange={(e) => setSpoilNotes(e.target.value)}
                  placeholder="যেমন: অতিরিক্ত গরমে শসা নষ্ট হয়েছে..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowSpoilageModal(false)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  ক্ষতি সেভ ও স্টক হ্রাস করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Vegetable Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>নতুন সবজি / কাঁচামাল ক্যাটালগে যোগ করুন</span>
              </h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">সবজির নাম (বাংলা)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ফুলকপি..."
                    value={newItemNameBn}
                    onChange={(e) => setNewItemNameBn(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  >
                    <option value="শাকসবজি">শাকসবজি</option>
                    <option value="নিত্যপ্রয়োজনীয়">নিত্যপ্রয়োজনীয় (আলু-পেঁয়াজ)</option>
                    <option value="মসলাপাতি">মসলাপাতি (রসুন-আদা-মরিচ)</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <CalcInput
                    label="প্রাথমিক মজুত (কেজি)"
                    value={newItemStock || 0}
                    onChange={setNewItemStock}
                    unitPresets="weight"
                    suffix="কেজি"
                    calcTitle="প্রাথমিক মজুত হিসাব"
                    align="center"
                    inputClassName="font-bold py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">ডিফল্ট পাইকারি ইউনিট</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 h-[34px]"
                  >
                    <option value="কেজি">কেজি</option>
                    <option value="পাল্লা">পাল্লা (৫ কেজি)</option>
                    <option value="মণ">মণ (৪০ কেজি)</option>
                    <option value="বস্তা">বস্তা (~৫০ কেজি)</option>
                    <option value="খাঁচা">খাঁচা (~২৫ কেজি)</option>
                    <option value="পিস">পিস</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <CalcInput
                    label="গড় ক্রয়দর (কেজি)"
                    value={newItemPurchasePrice || 0}
                    onChange={setNewItemPurchasePrice}
                    unitPresets="money"
                    suffix="৳"
                    calcTitle="গড় ক্রয়দর হিসাব"
                    align="right"
                    inputClassName="font-semibold py-1.5"
                    required
                  />
                </div>
                <div>
                  <CalcInput
                    label="পাইকারি দর"
                    value={newItemWholesalePrice || 0}
                    onChange={setNewItemWholesalePrice}
                    unitPresets="money"
                    suffix="৳"
                    calcTitle="পাইকারি দর হিসাব"
                    align="right"
                    inputClassName="text-emerald-600 font-bold py-1.5"
                    required
                  />
                </div>
                <div>
                  <CalcInput
                    label="খুচরা দর"
                    value={newItemRetailPrice || 0}
                    onChange={setNewItemRetailPrice}
                    unitPresets="money"
                    suffix="৳"
                    calcTitle="খুচরা দর হিসাব"
                    align="right"
                    inputClassName="font-semibold py-1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <CalcInput
                  label="ন্যূনতম সতর্কবার্তা স্টক (কেজি)"
                  value={newItemMinAlert || 0}
                  onChange={setNewItemMinAlert}
                  unitPresets="weight"
                  suffix="কেজি"
                  calcTitle="ন্যূনতম স্টক সতর্কবার্তা"
                  align="center"
                  inputClassName="py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  ক্যাটালগে সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Stock Adjustment */}
      {editingStockItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {editingStockItem.nameBn} - মজুত সমন্বয়
            </h3>
            <p className="text-xs text-stone-500">
              দোকান বা গুদামে সরাসরি গণনা করা প্রকৃত ওজন (কেজি) ইনপুট দিন:
            </p>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3">
              <div>
                <CalcInput
                  label="সংশোধিত মজুদ (কেজি)"
                  value={adjustedStockKg || 0}
                  onChange={setAdjustedStockKg}
                  unitPresets="weight"
                  suffix="কেজি"
                  calcTitle={`${editingStockItem.nameBn} - মজুদ সমন্বয়`}
                  align="center"
                  inputClassName="text-lg font-bold py-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingStockItem(null)}
                  className="px-4 py-2.5 text-xs text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
