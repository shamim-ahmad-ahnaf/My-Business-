import React, { useState, useMemo } from 'react';
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
  Layers,
  List,
  ChevronDown,
  ChevronUp,
  Tag,
  FolderPlus,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { VoiceSearchButton } from './VoiceSearchButton';
import { VegetableItem, SpoilageRecord, UnitType, ProduceCategory } from '../types';
import { formatTaka, formatWeight, toBengaliNumber, formatBanglaDate } from '../utils/formatters';
import { exportStockToCsv } from '../utils/storage';

export type CategoryFilterKey = 'all' | 'শাকসবজি' | 'ফলমূল' | 'মসলাপাতি' | 'নিত্যপ্রয়োজনীয়' | 'অন্যান্য';

export interface CategoryDefinition {
  key: ProduceCategory;
  nameBn: string;
  shortLabel: string;
  emoji: string;
  englishTitle: string;
  description: string;
  badgeClass: string;
  headerBg: string;
  borderClass: string;
  activePillClass: string;
  textAccent: string;
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  'শাকসবজি': {
    key: 'শাকসবজি',
    nameBn: 'শাকসবজি',
    shortLabel: 'শাকসবজি',
    emoji: '🥬',
    englishTitle: 'Fresh Vegetables & Greens',
    description: 'তাজা শাকপাতা, ফুলকপি, বেগুন, টমেটো, পটল, লাউ ও কাঁচামাল',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    headerBg: 'from-emerald-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:to-emerald-950/10',
    borderClass: 'border-emerald-200 dark:border-emerald-800/80',
    activePillClass: 'bg-emerald-600 text-white shadow-xs',
    textAccent: 'text-emerald-600 dark:text-emerald-400'
  },
  'ফলমূল': {
    key: 'ফলমূল',
    nameBn: 'ফলমূল',
    shortLabel: 'ফলমূল',
    emoji: '🍎',
    englishTitle: 'Fresh Fruits',
    description: 'তরমুজ, পেঁপে, কলা, লেবু, পেয়ারা, জাম্বুরা ও অন্যান্য মৌসুমি ফল',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    headerBg: 'from-amber-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-amber-950/10',
    borderClass: 'border-amber-200 dark:border-amber-800/80',
    activePillClass: 'bg-amber-600 text-white shadow-xs',
    textAccent: 'text-amber-600 dark:text-amber-400'
  },
  'মসলাপাতি': {
    key: 'মসলাপাতি',
    nameBn: 'মশলা ও মসলাপাতি',
    shortLabel: 'মশলাপাতি',
    emoji: '🌶️',
    englishTitle: 'Spices & Seasonings',
    description: 'রসুন, আদা, কাঁচামরিচ, শুকনা মরিচ, জিরা ও রান্নার মসলা সামগ্রী',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    headerBg: 'from-rose-500/10 to-rose-500/5 dark:from-rose-950/40 dark:to-rose-950/10',
    borderClass: 'border-rose-200 dark:border-rose-800/80',
    activePillClass: 'bg-rose-600 text-white shadow-xs',
    textAccent: 'text-rose-600 dark:text-rose-400'
  },
  'নিত্যপ্রয়োজনীয়': {
    key: 'নিত্যপ্রয়োজনীয়',
    nameBn: 'নিত্যপ্রয়োজনীয় কাঁচামাল',
    shortLabel: 'নিত্যপ্রয়োজনীয়',
    emoji: '🥔',
    englishTitle: 'Daily Essentials & Staples',
    description: 'আলু (ডায়মন্ড/লাল), পাবনা পেঁয়াজ, মিষ্টি কুমড়া ইত্যাদি আড়তের প্রধান পণ্য',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    headerBg: 'from-sky-500/10 to-sky-500/5 dark:from-sky-950/40 dark:to-sky-950/10',
    borderClass: 'border-sky-200 dark:border-sky-800/80',
    activePillClass: 'bg-sky-600 text-white shadow-xs',
    textAccent: 'text-sky-600 dark:text-sky-400'
  },
  'অন্যান্য': {
    key: 'অন্যান্য',
    nameBn: 'অন্যান্য পণ্য',
    shortLabel: 'অন্যান্য',
    emoji: '📦',
    englishTitle: 'Other Miscellaneous Produce',
    description: 'অনাবৃত ও বিশেষ মালামাল',
    badgeClass: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
    headerBg: 'from-stone-500/10 to-stone-500/5 dark:from-stone-800/40 dark:to-stone-800/10',
    borderClass: 'border-stone-200 dark:border-stone-700/80',
    activePillClass: 'bg-stone-700 text-white shadow-xs',
    textAccent: 'text-stone-600 dark:text-stone-400'
  }
};

export const normalizeItemCategory = (cat?: string): ProduceCategory => {
  if (!cat) return 'অন্যান্য';
  const trimmed = cat.trim();
  if (trimmed === 'মশলা' || trimmed === 'মসলা' || trimmed === 'মসলাপাতি') return 'মসলাপাতি';
  if (trimmed === 'ফলমূল' || trimmed === 'ফল' || trimmed === 'ফ্রুটস') return 'ফলমূল';
  if (trimmed === 'শাকসবজি' || trimmed === 'শাক' || trimmed === 'সবজি') return 'শাকসবজি';
  if (trimmed === 'নিত্যপ্রয়োজনীয়' || trimmed === 'আলু-পেঁয়াজ') return 'নিত্যপ্রয়োজনীয়';
  return 'অন্যান্য';
};

interface InventoryManagerProps {
  items: VegetableItem[];
  spoilages: SpoilageRecord[];
  onAddItem: (item: VegetableItem) => void;
  onUpdateStock: (itemId: string, newStockKg: number) => void;
  onAddSpoilage: (spoilage: SpoilageRecord) => void;
  onUpdateItem?: (updatedItem: VegetableItem) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  items,
  spoilages,
  onAddItem,
  onUpdateStock,
  onAddSpoilage,
  onUpdateItem
}) => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped'); // 'grouped' = Category Groups, 'flat' = Unified Table
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('all');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Collapse state for individual categories in Group View
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showSpoilageModal, setShowSpoilageModal] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<VegetableItem | null>(null);
  const [editingFullItem, setEditingFullItem] = useState<VegetableItem | null>(null);
  const [adjustedStockKg, setAdjustedStockKg] = useState<number>(0);

  // Spoilage Form State
  const [spoilItemId, setSpoilItemId] = useState<string>(items[0]?.id || '');
  const [spoilQtyKg, setSpoilQtyKg] = useState<number>(0);
  const [spoilReason, setSpoilReason] = useState<'পচে গেছে' | 'শুকিয়ে ওজন হ্রাস' | 'পরিবহনে ক্ষতিগ্রস্ত' | 'মান নষ্ট'>('পচে গেছে');
  const [spoilNotes, setSpoilNotes] = useState<string>('');

  // New Item Form State
  const [newItemNameBn, setNewItemNameBn] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ProduceCategory>('শাকসবজি');
  const [newItemStock, setNewItemStock] = useState<number>(0);
  const [newItemUnit, setNewItemUnit] = useState<UnitType>('কেজি');
  const [newItemPurchasePrice, setNewItemPurchasePrice] = useState<number>(0);
  const [newItemWholesalePrice, setNewItemWholesalePrice] = useState<number>(0);
  const [newItemRetailPrice, setNewItemRetailPrice] = useState<number>(0);
  const [newItemMinAlert, setNewItemMinAlert] = useState<number>(50);

  // Overall Totals
  const totalStockKg = useMemo(() => items.reduce((acc, i) => acc + i.currentStockKg, 0), [items]);
  const totalStockValue = useMemo(() => items.reduce((acc, i) => acc + (i.currentStockKg * i.avgPurchasePricePerKg), 0), [items]);
  const lowStockCount = useMemo(() => items.filter(i => i.currentStockKg <= i.minStockAlertKg).length, [items]);
  const totalSpoilageLoss = useMemo(() => spoilages.reduce((acc, s) => acc + s.lossAmount, 0), [spoilages]);

  // Category statistics breakdown
  const categoryStats = useMemo(() => {
    const categories: ProduceCategory[] = ['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'];
    const map: Record<string, { count: number; totalKg: number; totalValue: number; lowStock: number }> = {};
    
    categories.forEach(cat => {
      map[cat] = { count: 0, totalKg: 0, totalValue: 0, lowStock: 0 };
    });

    items.forEach(item => {
      const cat = normalizeItemCategory(item.category);
      if (!map[cat]) {
        map[cat] = { count: 0, totalKg: 0, totalValue: 0, lowStock: 0 };
      }
      map[cat].count += 1;
      map[cat].totalKg += item.currentStockKg;
      map[cat].totalValue += (item.currentStockKg * item.avgPurchasePricePerKg);
      if (item.currentStockKg <= item.minStockAlertKg) {
        map[cat].lowStock += 1;
      }
    });

    return map;
  }, [items]);

  // Filtered items based on search and category filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const rawSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = !rawSearch || 
                            item.nameBn.toLowerCase().includes(rawSearch) ||
                            item.nameEn.toLowerCase().includes(rawSearch);
      
      const itemCat = normalizeItemCategory(item.category);
      const matchesCat = selectedCategory === 'all' || itemCat === selectedCategory;
      const matchesLowStock = !showOnlyLowStock || (item.currentStockKg <= item.minStockAlertKg);

      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [items, searchTerm, selectedCategory, showOnlyLowStock]);

  // Grouped items by category for the Grouped View
  const groupedItems = useMemo(() => {
    const order: ProduceCategory[] = ['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'];
    const groups: { category: ProduceCategory; definition: CategoryDefinition; items: VegetableItem[] }[] = [];

    order.forEach(cat => {
      // If a specific category filter is active (not 'all'), only include that category
      if (selectedCategory !== 'all' && selectedCategory !== cat) {
        return;
      }

      const itemsInCat = filteredItems.filter(item => normalizeItemCategory(item.category) === cat);
      // In search/filter mode, only show category if it has items, or if selected directly
      if (itemsInCat.length > 0 || (selectedCategory === cat && !searchTerm)) {
        groups.push({
          category: cat,
          definition: CATEGORY_DEFINITIONS[cat],
          items: itemsInCat
        });
      }
    });

    return groups;
  }, [filteredItems, selectedCategory, searchTerm]);

  // Toggle single category collapse
  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Toggle all categories collapse
  const areAllCollapsed = useMemo(() => {
    if (groupedItems.length === 0) return false;
    return groupedItems.every(g => !!collapsedCategories[g.category]);
  }, [groupedItems, collapsedCategories]);

  const toggleAllCollapse = () => {
    if (areAllCollapsed) {
      setCollapsedCategories({});
    } else {
      const next: Record<string, boolean> = {};
      groupedItems.forEach(g => {
        next[g.category] = true;
      });
      setCollapsedCategories(next);
    }
  };

  // Open Add Item modal with specific category pre-selected
  const handleOpenAddModalForCategory = (cat?: ProduceCategory) => {
    if (cat) {
      setNewItemCategory(cat);
    }
    setShowAddItemModal(true);
  };

  // Handle Spoilage Form Submission
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

  // Handle Add Item Submission
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
    
    // Reset Form
    setNewItemNameBn('');
    setNewItemNameEn('');
    setNewItemStock(0);
    setNewItemPurchasePrice(0);
    setNewItemWholesalePrice(0);
    setNewItemRetailPrice(0);
  };

  // Handle Quick Stock Adjust Submission
  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockItem) return;
    onUpdateStock(editingStockItem.id, adjustedStockKg);
    setEditingStockItem(null);
  };

  // Handle Full Item Edit Submission
  const handleFullItemEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFullItem || !onUpdateItem) return;
    onUpdateItem(editingFullItem);
    setEditingFullItem(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>মজুত সবজি, ফলমূল ও মসলা ইনভেন্টরি</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {toBengaliNumber(items.length)} টি পণ্য
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                শাকসবজি, তাজা ফলমূল বা মশলা আলাদা গ্রুপে পর্যবেক্ষণ ও সঠিক হিসাব রাখুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <button
            type="button"
            onClick={() => exportStockToCsv(items)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
            title="সম্পূর্ণ স্টকের তালিকা ডাউনলোড করুন"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">স্টক</span> CSV
          </button>

          {/* Spoilage / Wastage Log Button */}
          <button
            type="button"
            onClick={() => setShowSpoilageModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-95"
          >
            <TrendingDown className="w-4 h-4" />
            <span>পচন / ক্ষতি এন্ট্রি</span>
          </button>

          {/* Add Produce Item Button */}
          <button
            type="button"
            onClick={() => handleOpenAddModalForCategory()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">মোট মজুদ পরিমাণ</span>
          <div className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {formatWeight(totalStockKg)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800">
            <span>ক্যাটালগ পণ্য:</span>
            <span className="font-bold text-stone-700 dark:text-stone-300">{toBengaliNumber(items.length)} টি</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">মজুত পণ্যের মোট মূল্য</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatTaka(totalStockValue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800">
            <span>মূল্য নির্ধারণ:</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-300">গড় ক্রয়দর ভিত্তিতে</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">মজুত সংকট (সতর্কবার্তা)</span>
          <div className={`text-lg sm:text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'}`}>
            {toBengaliNumber(lowStockCount)} টি পণ্য
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800">
            <span>স্টক অবস্থা:</span>
            <span className={lowStockCount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-medium'}>
              {lowStockCount > 0 ? 'অবিলম্বে ক্রয় প্রয়োজন' : 'পর্যাপ্ত মজুত রয়েছে'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">পচন ও ঘাটতি ক্ষতি</span>
          <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatTaka(totalSpoilageLoss)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800">
            <span>রেকর্ড সংখ্যা:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">{toBengaliNumber(spoilages.length)} বার এন্ট্রি</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Group Cards Strip (ক্যাটাগরি সারসংক্ষেপ) */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
              ক্যাটাগরি বা গ্রুপ অনুযায়ী মজুত বিশ্লেষণ
            </h3>
            <span className="text-[11px] text-stone-400 hidden md:inline">
              (কার্ডে ক্লিক করে যেকোনো গ্রুপে সরাসরি ফিল্টার করুন)
            </span>
          </div>

          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট (সকল ক্যাটাগরি)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {(['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'] as ProduceCategory[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const stats = categoryStats[catKey] || { count: 0, totalKg: 0, totalValue: 0, lowStock: 0 };
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : catKey)}
                className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                  isSelected 
                    ? `ring-2 ring-emerald-500 shadow-sm ${def.borderClass} bg-stone-50 dark:bg-stone-800/80`
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-base">{def.emoji}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${def.badgeClass}`}>
                      {toBengaliNumber(stats.count)} টি
                    </span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-tight">
                    {def.nameBn}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {def.englishTitle}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-xs font-black text-stone-900 dark:text-stone-100">
                    {formatWeight(stats.totalKg)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-0.5">
                    <span>মূল্য:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatTaka(stats.totalValue)}</span>
                  </div>
                  {stats.lowStock > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{toBengaliNumber(stats.lowStock)} টি সতর্কতায়</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter Toolbar & View Mode Switcher */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input with Voice & Clear */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="সবজির নাম দিয়ে খুঁজুন বা মুখে বলুন (যেমন: শাক, পেঁপে, তরমুজ, আলু, রসুন, আদা)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-18 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 dark:text-stone-100 placeholder:text-stone-400"
            />
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
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
                placeholderHint="সবজির নাম মুখে বলুন..."
                size="sm"
              />
            </div>
          </div>

          {/* View Mode Switcher: Group View vs Flat Table */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>গ্রুপ বা ক্যাটাগরি ভিউ</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-emerald-600" />
              <span>একক তালিকা ভিউ</span>
            </button>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {/* All Filter */}
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); setShowOnlyLowStock(false); }}
            className={`px-3 py-1.5 font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'all' && !showOnlyLowStock
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <span>সকল পণ্য</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {toBengaliNumber(items.length)}
            </span>
          </button>

          {/* Individual Categories */}
          {(['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'] as ProduceCategory[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const count = categoryStats[catKey]?.count || 0;
            const isCatActive = selectedCategory === catKey && !showOnlyLowStock;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  setSelectedCategory(catKey);
                  setShowOnlyLowStock(false);
                }}
                className={`px-3 py-1.5 font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isCatActive
                    ? def.activePillClass + ' font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <span>{def.emoji}</span>
                <span>{def.nameBn}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isCatActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                  {toBengaliNumber(count)}
                </span>
              </button>
            );
          })}

          {/* Low Stock Filter Button */}
          <button
            type="button"
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`px-3 py-1.5 font-medium rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ml-auto ${
              showOnlyLowStock
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : lowStockCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
            }`}
            title="কম স্টক হওয়া পণ্যগুলো আলাদা করে দেখুন"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 && !showOnlyLowStock ? 'animate-bounce text-amber-600' : ''}`} />
            <span>কম স্টক সতর্কতা</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              showOnlyLowStock ? 'bg-white/30 text-white' : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
            }`}>
              {toBengaliNumber(lowStockCount)}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Group View or Flat View */}
      {viewMode === 'grouped' ? (
        /* ================= GROUPED BY CATEGORY VIEW ================= */
        <div className="space-y-5">
          {/* Group view controls bar */}
          <div className="flex items-center justify-between px-1 text-xs text-stone-500">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              মোট {toBengaliNumber(groupedItems.length)} টি ক্যাটাগরি গ্রুপ দেখানো হচ্ছে
            </span>
            <button
              type="button"
              onClick={toggleAllCollapse}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              {areAllCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>সব ক্যাটাগরি একসাথে খুলুন</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>সব ক্যাটাগরি একসাথে বন্ধ করুন</span>
                </>
              )}
            </button>
          </div>

          {groupedItems.map((group) => {
            const isCollapsed = !!collapsedCategories[group.category];
            const groupStats = categoryStats[group.category] || { count: 0, totalKg: 0, totalValue: 0, lowStock: 0 };
            const def = group.definition;

            return (
              <div 
                key={group.category}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Category Group Header */}
                <div 
                  className={`px-4 sm:px-5 py-3.5 bg-gradient-to-r ${def.headerBg} border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer`}
                  onClick={() => toggleCategoryCollapse(group.category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white/80 dark:bg-stone-800/80 shadow-2xs">
                      {def.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>{def.nameBn}</span>
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${def.badgeClass}`}>
                          {toBengaliNumber(group.items.length)} টি আইটেম
                        </span>
                        {groupStats.lowStock > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{toBengaliNumber(groupStats.lowStock)} টি কম</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {def.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Header Stats & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                        {formatWeight(groupStats.totalKg)}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        মূল্য: {formatTaka(groupStats.totalValue)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddModalForCategory(group.category)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1 shadow-2xs"
                      title={`${def.nameBn} গ্রুপে নতুন আইটেম যোগ করুন`}
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden md:inline">এই গ্রুপে</span> পণ্য যোগ
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(group.category)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5"
                      title={isCollapsed ? 'গ্রুপ খুলুন' : 'গ্রুপ বন্ধ করুন'}
                    >
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Category Items Body (when expanded) */}
                {!isCollapsed && (
                  <div>
                    {group.items.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-400">
                        {searchTerm ? 'এই ক্যাটাগরিতে সার্চের সাথে মিল রয়েছে এমন কোনো পণ্য নেই' : 'এই ক্যাটাগরিতে এখনও কোনো পণ্য যোগ করা হয়নি'}
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View inside Group */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-stone-50/80 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                              <tr>
                                <th className="py-2.5 px-4 font-semibold">পণ্য ও সবজির নাম</th>
                                <th className="py-2.5 px-3 font-semibold text-right">বর্তমান মজুত</th>
                                <th className="py-2.5 px-3 font-semibold text-right">গড় ক্রয়দর</th>
                                <th className="py-2.5 px-3 font-semibold text-right">পাইকারি দর</th>
                                <th className="py-2.5 px-3 font-semibold text-right">খুচরা দর</th>
                                <th className="py-2.5 px-3 font-semibold text-right">মোট মজুদ মূল্য</th>
                                <th className="py-2.5 px-3 font-semibold text-center">স্টক অবস্থা</th>
                                <th className="py-2.5 px-4 font-semibold text-center">অ্যাকশন</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                              {group.items.map((item) => {
                                const isLow = item.currentStockKg <= item.minStockAlertKg;
                                const itemTotalVal = Math.round(item.currentStockKg * item.avgPurchasePricePerKg);
                                return (
                                  <tr 
                                    key={item.id} 
                                    className={`transition-colors border-l-4 ${
                                      isLow 
                                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-l-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/30' 
                                        : 'hover:bg-stone-50/70 dark:hover:bg-stone-800/30 border-l-transparent'
                                    }`}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                        <span>{item.nameBn}</span>
                                        {isLow && (
                                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" title="কম স্টক সতর্কতা" />
                                        )}
                                      </div>
                                      <div className="text-[11px] text-stone-400">{item.nameEn} • ডিফল্ট: {item.defaultUnit}</div>
                                    </td>
                                    
                                    <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                                      <div className={isLow ? 'text-amber-700 dark:text-amber-300 font-black' : ''}>
                                        {formatWeight(item.currentStockKg)}
                                      </div>
                                      {isLow && (
                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                          সীমা: {formatWeight(item.minStockAlertKg)}
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
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/50 shadow-2xs">
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                          <span>মজুত কম!</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                          পর্যাপ্ত
                                        </span>
                                      )}
                                    </td>

                                    <td className="py-3 px-4 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingStockItem(item);
                                            setAdjustedStockKg(item.currentStockKg);
                                          }}
                                          className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                                          title="মজুত সংখ্যা পরিবর্তন করুন"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        {onUpdateItem && (
                                          <button
                                            onClick={() => setEditingFullItem(item)}
                                            className="p-1.5 text-stone-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                                            title="ক্যাটাগরি বা সম্পূর্ণ তথ্য পরিবর্তন"
                                          >
                                            <Tag className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Touch Cards View inside Group */}
                        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
                          {group.items.map((item) => {
                            const isLow = item.currentStockKg <= item.minStockAlertKg;
                            const itemTotalVal = Math.round(item.currentStockKg * item.avgPurchasePricePerKg);
                            return (
                              <div 
                                key={item.id} 
                                className={`p-4 transition-colors border-l-4 ${
                                  isLow 
                                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-l-amber-500' 
                                    : 'border-l-transparent'
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
                                    </div>
                                    <span className="text-xs text-stone-400 block">{item.nameEn}</span>
                                  </div>

                                  {isLow ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/60 shrink-0">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>মজুত কম!</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                                      পর্যাপ্ত
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl my-2">
                                  <div>
                                    <span className="text-[10px] text-stone-400 block">বর্তমান মজুত</span>
                                    <span className={`text-sm font-bold block ${isLow ? 'text-amber-700 dark:text-amber-300 font-black' : 'text-stone-900 dark:text-stone-100'}`}>
                                      {formatWeight(item.currentStockKg)}
                                    </span>
                                    {isLow && (
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                        সতর্কতা: {formatWeight(item.minStockAlertKg)}
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

                                <div className="flex items-center justify-end gap-2 mt-2">
                                  {onUpdateItem && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingFullItem(item)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                                    >
                                      <Tag className="w-3.5 h-3.5 text-sky-600" />
                                      <span>ক্যাটাগরি পরিবর্তন</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStockItem(item);
                                      setAdjustedStockKg(item.currentStockKg);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>মজুত পরিবর্তন</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {groupedItems.length === 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-400 space-y-2">
              <Boxes className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
              <div className="font-bold text-sm text-stone-600 dark:text-stone-300">কোনো সবজি বা পণ্যের তথ্য পাওয়া যায়নি</div>
              <p className="text-xs">সার্চ কি-ওয়ার্ড পরিবর্তন করুন বা সকল ক্যাটাগরি ফিল্টার নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      ) : (
        /* ================= UNIFIED FLAT TABLE VIEW ================= */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">সবজির নাম</th>
                  <th className="py-3 px-3 font-semibold">ক্যাটাগরি / গ্রুপ</th>
                  <th className="py-3 px-3 font-semibold text-right">বর্তমান মজুত</th>
                  <th className="py-3 px-3 font-semibold text-right">গড় ক্রয়দর</th>
                  <th className="py-3 px-3 font-semibold text-right">পাইকারি দর</th>
                  <th className="py-3 px-3 font-semibold text-right">খুচরা দর</th>
                  <th className="py-3 px-3 font-semibold text-right">মোট মজুদ মূল্য</th>
                  <th className="py-3 px-3 font-semibold text-center">স্টক অবস্থা</th>
                  <th className="py-3 px-4 font-semibold text-center">সংশোধন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredItems.map((item) => {
                  const isLow = item.currentStockKg <= item.minStockAlertKg;
                  const itemTotalVal = Math.round(item.currentStockKg * item.avgPurchasePricePerKg);
                  const catNorm = normalizeItemCategory(item.category);
                  const def = CATEGORY_DEFINITIONS[catNorm] || CATEGORY_DEFINITIONS['অন্যান্য'];

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors border-l-4 ${
                        isLow 
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-amber-500 hover:bg-amber-100/60 dark:hover:bg-amber-900/40' 
                          : 'hover:bg-stone-50/70 dark:hover:bg-stone-800/30 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>{item.nameBn}</span>
                          {isLow && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" title="কম স্টক সতর্কতা" />
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">{item.nameEn}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${def.badgeClass}`}>
                          <span>{def.emoji}</span>
                          <span>{def.nameBn}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                        <div className={isLow ? 'text-amber-700 dark:text-amber-300 font-black' : ''}>
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/50 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>মজুত কম!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            পর্যাপ্ত
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingStockItem(item);
                              setAdjustedStockKg(item.currentStockKg);
                            }}
                            className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                            title="স্টক সংখ্যা সংশোধন করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {onUpdateItem && (
                            <button
                              onClick={() => setEditingFullItem(item)}
                              className="p-1.5 text-stone-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                              title="ক্যাটাগরি বা সম্পূর্ণ তথ্য পরিবর্তন"
                            >
                              <Tag className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
              const catNorm = normalizeItemCategory(item.category);
              const def = CATEGORY_DEFINITIONS[catNorm] || CATEGORY_DEFINITIONS['অন্যান্য'];

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
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${def.badgeClass}`}>
                          {def.emoji} {def.nameBn}
                        </span>
                        <span className="text-xs text-stone-400">{item.nameEn}</span>
                      </div>
                    </div>

                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/60 shrink-0">
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
                      <span className={`text-sm font-bold block ${isLow ? 'text-amber-700 dark:text-amber-300 font-black' : 'text-stone-900 dark:text-stone-100'}`}>
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

                  <div className="flex items-center justify-end gap-2 mt-2">
                    {onUpdateItem && (
                      <button
                        type="button"
                        onClick={() => setEditingFullItem(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        <Tag className="w-3.5 h-3.5 text-sky-600" />
                        <span>ক্যাটাগরি পরিবর্তন</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStockItem(item);
                        setAdjustedStockKg(item.currentStockKg);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>মজুত পরিবর্তন</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="py-12 text-center text-xs text-stone-400">
                কোনো সবজি বা পণ্যের তথ্য পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spoilage / Wastage Log Section */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-stone-100 dark:border-stone-800 pb-2.5">
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>সাম্প্রতিক পচন ও ঘাটতি রেকর্ড</span>
          </h3>
          <span className="text-xs text-stone-500">
            সর্বমোট ক্ষতি: <strong className="text-rose-600 font-bold">{formatTaka(totalSpoilageLoss)}</strong>
          </span>
        </div>

        {/* Desktop Spoilage Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3">সবজির নাম</th>
                <th className="py-2.5 px-3">নষ্টের পরিমাণ</th>
                <th className="py-2.5 px-3">কারণ</th>
                <th className="py-2.5 px-3 text-right">আর্থিক ক্ষতি</th>
                <th className="py-2.5 px-3">মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {spoilages.slice(0, 5).map((sp) => (
                <tr key={sp.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-2.5 px-3 text-stone-400">{formatBanglaDate(sp.date, true)}</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-800 dark:text-stone-200">{sp.itemName}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">{toBengaliNumber(sp.quantityKg)} কেজি</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-900">
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
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">নষ্ট হওয়া পণ্য</label>
                <select
                  value={spoilItemId}
                  onChange={(e) => setSpoilItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                >
                  {items.map(i => {
                    const def = CATEGORY_DEFINITIONS[normalizeItemCategory(i.category)];
                    return (
                      <option key={i.id} value={i.id}>
                        {def?.emoji} {i.nameBn} (বর্তমান মজুদ {i.currentStockKg} কেজি)
                      </option>
                    );
                  })}
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
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
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
                  placeholder="যেমন: গরমে পাকা পেঁপে বা টমেটো নরম হয়েছে..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
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

      {/* Modal: Add New Vegetable / Produce Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>নতুন পণ্য / সবজি ক্যাটালগে যোগ করুন</span>
              </h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3.5 text-xs sm:text-sm">
              {/* Category Selector */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  পণ্য ক্যাটাগরি বা গ্রুপ নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'] as ProduceCategory[]).map((catKey) => {
                    const def = CATEGORY_DEFINITIONS[catKey];
                    const isSelected = newItemCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setNewItemCategory(catKey)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? `border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold`
                            : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="text-xl">{def.emoji}</span>
                        <div>
                          <div className="text-xs leading-tight font-bold">{def.nameBn}</div>
                          <div className="text-[10px] text-stone-400">{def.shortLabel}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    পণ্যের নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: পাকা পেঁপে, ফুলকপি, শুকনা মরিচ..."
                    value={newItemNameBn}
                    onChange={(e) => setNewItemNameBn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-emerald-500/40"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    ইংরেজি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Papaya, Cauliflower..."
                    value={newItemNameEn}
                    onChange={(e) => setNewItemNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
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
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 h-[38px]"
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
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {editingStockItem.nameBn} - মজুত সমন্বয়
              </h3>
              <button onClick={() => setEditingStockItem(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <p className="text-xs text-stone-500">
              দোকান বা গুদামে সরাসরি গণনা করা প্রকৃত মোট ওজন (কেজি) ইনপুট দিন:
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

      {/* Modal: Full Item & Category Editor */}
      {editingFullItem && onUpdateItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-600" />
                <span>পণ্যের ক্যাটাগরি ও বিবরণ পরিবর্তন</span>
              </h3>
              <button onClick={() => setEditingFullItem(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleFullItemEditSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">পণ্যের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={editingFullItem.nameBn}
                  onChange={(e) => setEditingFullItem({ ...editingFullItem, nameBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">ক্যাটাগরি বা গ্রুপ পরিবর্তন করুন</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['শাকসবজি', 'ফলমূল', 'মসলাপাতি', 'নিত্যপ্রয়োজনীয়', 'অন্যান্য'] as ProduceCategory[]).map((catKey) => {
                    const def = CATEGORY_DEFINITIONS[catKey];
                    const isSelected = normalizeItemCategory(editingFullItem.category) === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setEditingFullItem({ ...editingFullItem, category: catKey })}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                            : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="text-lg">{def.emoji}</span>
                        <span className="text-xs">{def.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <CalcInput
                    label="পাইকারি দর (৳/কেজি)"
                    value={editingFullItem.currentWholesalePricePerKg || 0}
                    onChange={(val) => setEditingFullItem({ ...editingFullItem, currentWholesalePricePerKg: val })}
                    unitPresets="money"
                    suffix="৳"
                    calcTitle="পাইকারি দর"
                    align="right"
                    inputClassName="font-bold py-1.5 text-emerald-600"
                  />
                </div>
                <div>
                  <CalcInput
                    label="খুচরা দর (৳/কেজি)"
                    value={editingFullItem.currentRetailPricePerKg || 0}
                    onChange={(val) => setEditingFullItem({ ...editingFullItem, currentRetailPricePerKg: val })}
                    unitPresets="money"
                    suffix="৳"
                    calcTitle="খুচরা দর"
                    align="right"
                    inputClassName="font-bold py-1.5"
                  />
                </div>
              </div>

              <div>
                <CalcInput
                  label="ন্যূনতম স্টক সতর্কবার্তা (কেজি)"
                  value={editingFullItem.minStockAlertKg || 0}
                  onChange={(val) => setEditingFullItem({ ...editingFullItem, minStockAlertKg: val })}
                  unitPresets="weight"
                  suffix="কেজি"
                  calcTitle="ন্যূনতম স্টক সীমা"
                  align="center"
                  inputClassName="py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingFullItem(null)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  পরিবর্তন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
