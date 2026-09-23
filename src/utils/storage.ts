import {
  VegetableItem,
  SaleRecord,
  PurchaseRecord,
  Customer,
  Supplier,
  BusinessExpense,
  SpoilageRecord,
  MarketRate,
  BusinessProfile,
  AppNotification
} from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'kachamal_business_profile_v1',
  ITEMS: 'kachamal_vegetable_items_v1',
  SALES: 'kachamal_sales_records_v1',
  PURCHASES: 'kachamal_purchases_records_v1',
  CUSTOMERS: 'kachamal_customers_v1',
  SUPPLIERS: 'kachamal_suppliers_v1',
  EXPENSES: 'kachamal_business_expenses_v1',
  SPOILAGES: 'kachamal_spoilage_records_v1',
  MARKET_RATES: 'kachamal_market_rates_v1',
  NOTIFICATIONS: 'kachamal_app_notifications_v1',
  TRANSACTIONS: 'kachamal_transactions_v1',
  DARK_MODE: 'kachamal_dark_mode_v1'
} as const;

export interface AppStateData {
  items: VegetableItem[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: BusinessExpense[];
  spoilages: SpoilageRecord[];
  marketRates: MarketRate[];
  businessProfile: BusinessProfile;
  notifications: AppNotification[];
  darkMode?: boolean;
}

// Generic loader with safety fallback
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key "${key}" from localStorage:`, e);
    return defaultValue;
  }
}

// Generic saver
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key "${key}" to localStorage:`, e);
  }
}

// Legacy combined state loader
export function loadSavedState(defaults: AppStateData): AppStateData {
  try {
    const raw = localStorage.getItem('kachamal_business_state_v1');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items || defaults.items,
      sales: parsed.sales || defaults.sales,
      purchases: parsed.purchases || defaults.purchases,
      customers: parsed.customers || defaults.customers,
      suppliers: parsed.suppliers || defaults.suppliers,
      expenses: parsed.expenses || defaults.expenses,
      spoilages: parsed.spoilages || defaults.spoilages,
      marketRates: parsed.marketRates || defaults.marketRates,
      businessProfile: parsed.businessProfile || defaults.businessProfile,
      notifications: parsed.notifications || defaults.notifications,
      darkMode: parsed.darkMode !== undefined ? parsed.darkMode : defaults.darkMode
    };
  } catch (e) {
    console.error('Error loading saved state:', e);
    return defaults;
  }
}

export function saveStateToStorage(state: AppStateData): void {
  try {
    localStorage.setItem('kachamal_business_state_v1', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

// Full app backup object creator
export function createFullBackupData(appData: any) {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    businessName: appData?.profile?.businessName || 'কাঁচামাল আড়ত',
    data: appData
  };
}

// Download JSON Backup
export function downloadJsonBackup(data: any, fileName?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = fileName || `kachamal_hisab_backup_${dateStr}.json`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', name);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Alias for downloadJsonBackup
export function exportBackupToFile(state: any): void {
  downloadJsonBackup(state);
}

// Restore backup from uploaded JSON file
export function restoreBackupFromJson(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.data) {
          resolve(parsed.data);
        } else {
          resolve(parsed);
        }
      } catch (err) {
        reject(new Error('ফাইলটি সঠিক JSON ফরম্যাটে নেই অথবা ক্ষতিগ্রস্ত হয়েছে।'));
      }
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে।'));
    reader.readAsText(file);
  });
}

// Export CSV for Sales
export function exportSalesToCsv(sales: SaleRecord[]): void {
  const headers = ['চালান/ইনভয়েস নং', 'তারিখ', 'ক্রেতার নাম', 'মোবাইল', 'পণ্যের বিবরণ', 'মোট টাকা', 'ছাড়', 'পরিশোধ', 'বাকি', 'পেমেন্ট মাধ্যম'];
  const rows = sales.map(s => {
    const itemSummary = s.items.map(i => `${i.itemName} (${i.quantity} ${i.unit})`).join('; ');
    return [
      `"${s.invoiceNo}"`,
      `"${new Date(s.date).toLocaleDateString('bn-BD')}"`,
      `"${s.customerName}"`,
      `"${s.customerPhone || ''}"`,
      `"${itemSummary}"`,
      s.grandTotal,
      s.discount,
      s.paidAmount,
      s.dueAmount,
      `"${s.paymentMethod}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Export CSV for Stock
export function exportStockToCsv(items: VegetableItem[]): void {
  const headers = ['পণ্যের নাম', 'ক্যাটাগরি', 'বর্তমান মজুদ (কেজি)', 'ডিফল্ট ইউনিট', 'গড় ক্রয়দর (কেজি)', 'পাইকারি দর', 'খুচরা দর', 'মোট মজুদ মূল্য'];
  const rows = items.map(item => [
    `"${item.nameBn}"`,
    `"${item.category}"`,
    item.currentStockKg,
    `"${item.defaultUnit}"`,
    item.avgPurchasePricePerKg,
    item.currentWholesalePricePerKg,
    item.currentRetailPricePerKg,
    Math.round(item.currentStockKg * item.avgPurchasePricePerKg)
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `vegetable_stock_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Play pleasant chime using Web Audio API
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio error if user hasn't interacted
  }
}
