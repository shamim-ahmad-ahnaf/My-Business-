export type UnitType = 'কেজি' | 'পাল্লা' | 'মণ' | 'বস্তা' | 'খাঁচা' | 'পিস';

export interface VegetableItem {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'নিত্যপ্রয়োজনীয়' | 'শাকসবজি' | 'মসলাপাতি' | 'অন্যান্য';
  currentStockKg: number; // standardized to KG for precise tracking
  defaultUnit: UnitType;
  avgPurchasePricePerKg: number;
  currentRetailPricePerKg: number;
  currentWholesalePricePerKg: number;
  minStockAlertKg: number;
  iconName?: string;
}

export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: UnitType;
  quantityInKg: number;
  unitPrice: number;
  totalPrice: number;
  costPricePerKg: number;
}

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  labourCost?: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক' | 'বাকি';
  date: string; // ISO string
  notes?: string;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: UnitType;
  quantityInKg: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseRecord {
  id: string;
  chalanNo: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  transportCost: number;
  labourCost: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'নগদ' | 'বিকাশ' | 'ব্যাংক' | 'বাকি';
  date: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  totalPaid: number;
  currentDue: number;
  createdAt: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  marketLocation: string; // e.g., বগুড়া, মেহেরপুর, কারওয়ান বাজার
  totalPurchases: number;
  totalPaid: number;
  currentPayable: number;
  createdAt: string;
}

export interface BusinessExpense {
  id: string;
  title: string;
  category: 'দোকান ভাড়া' | 'বিদ্যুৎ বিল' | 'কর্মচারী বেতন' | 'যাতায়াত ও গাড়িভাড়া' | 'লেবার/কুলি' | 'চা-নাস্তা' | 'অন্যান্য';
  amount: number;
  date: string;
  paidTo?: string;
  paymentMethod: 'নগদ' | 'বিকাশ' | 'ব্যাংক';
  notes?: string;
}

export interface SpoilageRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantityKg: number;
  costPricePerKg: number;
  lossAmount: number;
  reason: 'পচে গেছে' | 'শুকিয়ে ওজন হ্রাস' | 'পরিবহনে ক্ষতিগ্রস্ত' | 'মান নষ্ট';
  date: string;
  notes?: string;
}

export interface MarketRate {
  itemId: string;
  itemName: string;
  yesterdayWholesaleKg: number;
  todayWholesaleKg: number;
  todayRetailKg: number;
  unit: string;
  trend: 'up' | 'down' | 'same';
  changePercent: number;
  marketNote: string;
  lastUpdated: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'sale' | 'purchase' | 'stock' | 'due' | 'market' | 'backup' | 'system' | 'alert';
  timestamp?: string;
  date?: string;
  isRead?: boolean;
  read?: boolean;
  linkTab?: string;
}

export type BusinessNotification = AppNotification;

export interface PaymentTransaction {
  id: string;
  partyType: 'customer' | 'supplier' | 'expense';
  partyId: string;
  partyName: string;
  type: 'in' | 'out'; // 'in' = money received, 'out' = money paid
  amount: number;
  method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক';
  referenceNo?: string;
  date: string;
  note?: string;
}

export interface BusinessProfile {
  businessName: string;
  proprietorName: string;
  proprietor?: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  slogan: string;
  tagline?: string;
  invoiceFooterNote: string;
  cloudSyncEnabled: boolean;
  lastCloudBackup?: string;
  logo?: string; // Base64 data URL or image URL
}
