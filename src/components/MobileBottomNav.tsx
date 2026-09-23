import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Plus, 
  Boxes, 
  Users, 
  QrCode,
  Truck,
  TrendingUp,
  Tag,
  CreditCard,
  Settings,
  Calculator,
  X,
  AlertTriangle
} from 'lucide-react';
import { InputCalculatorModal } from './InputCalculatorModal';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickSale?: () => void;
  onOpenQrScanner?: () => void;
  onOpenSettings?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSale,
  onOpenQrScanner,
  onOpenSettings
}) => {
  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [showQuickCalc, setShowQuickCalc] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowQuickSheet(false);
  };

  return (
    <>
      {/* Mobile Quick Action Bottom Sheet */}
      {showQuickSheet && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowQuickSheet(false)} 
          />
          <div className="relative w-full bg-white dark:bg-stone-900 rounded-t-3xl p-5 border-t border-stone-200 dark:border-stone-800 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  দ্রুত অ্যাকশন ও হিসাব
                </h3>
                <p className="text-xs text-stone-500">
                  কাঁচাবাজারের প্রয়োজনীয় টুলস
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickSheet(false)}
                className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  if (onOpenQuickSale) onOpenQuickSale();
                  else setActiveTab('sales');
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">নতুন বিক্রি মেমো</h4>
                  <p className="text-[10px] text-stone-500">ক্যাশ/বাকি ইনভয়েস</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  setShowQuickCalc(true);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">আড়ত ক্যালকুলেটর</h4>
                  <p className="text-[10px] text-stone-500">পাল্লা, মণ ও কেজি হিসাব</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  setActiveTab('purchases');
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">মোকাম চালান ক্রয়</h4>
                  <p className="text-[10px] text-stone-500">আমদানি ও খরচ</p>
                </div>
              </button>

              {onOpenQrScanner && (
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickSheet(false);
                    onOpenQrScanner();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-left active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">কিউআর স্ক্যান</h4>
                    <p className="text-[10px] text-stone-500">মেমো ও পেমেন্ট যাচাই</p>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  setActiveTab('reports');
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">লাভ-ক্ষতি রিপোর্ট</h4>
                  <p className="text-[10px] text-stone-500">আয়, ব্যয় ও লাভ</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  setActiveTab('rates');
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">দৈনিক বাজার দর</h4>
                  <p className="text-[10px] text-stone-500">সবজির দর ও আপডেট</p>
                </div>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowQuickSheet(false);
                  setActiveTab('payments');
                }}
                className="text-stone-600 dark:text-stone-400 hover:text-emerald-600 flex items-center gap-1.5 font-medium"
              >
                <CreditCard className="w-4 h-4" />
                <span>পেমেন্ট ট্র্যাকার</span>
              </button>

              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickSheet(false);
                    onOpenSettings();
                  }}
                  className="text-stone-600 dark:text-stone-400 hover:text-emerald-600 flex items-center gap-1.5 font-medium"
                >
                  <Settings className="w-4 h-4" />
                  <span>দোকান সেটিংস</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav */}
      <nav 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-1 py-1 shadow-xl select-none"
        aria-label="মোবাইল ন্যাভিগেশন"
      >
        <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto">
          
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => handleTabChange('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">ড্যাশবোর্ড</span>
          </button>

          {/* Tab 2: Sales */}
          <button
            type="button"
            onClick={() => handleTabChange('sales')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'sales'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">বিক্রি খাতা</span>
          </button>

          {/* Center Action Button */}
          <div className="flex justify-center items-center">
            <button
              type="button"
              onClick={() => setShowQuickSheet(true)}
              className="w-12 h-12 -mt-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 active:scale-90 transition-all border-2 border-white dark:border-stone-900 focus:outline-hidden"
              title="দ্রুত মেনু ও হিসাব"
              aria-label="দ্রুত মেনু ও হিসাব"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Inventory / Stock */}
          <button
            type="button"
            onClick={() => handleTabChange('inventory')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'inventory'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">মজুদ সবজি</span>
          </button>

          {/* Tab 4: Parties / Khata */}
          <button
            type="button"
            onClick={() => handleTabChange('parties')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'parties'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">বাকি খাতা</span>
          </button>

        </div>
      </nav>

      {/* Quick standalone calculator from mobile bottom sheet */}
      <InputCalculatorModal
        isOpen={showQuickCalc}
        onClose={() => setShowQuickCalc(false)}
        title="আড়ত দ্রুত ক্যালকুলেটর"
        unitPresets="weight"
        suffix="৳/কেজি"
      />
    </>
  );
};
