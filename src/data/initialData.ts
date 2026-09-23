import { VegetableItem, Customer, Supplier, MarketRate, BusinessProfile, SaleRecord, PurchaseRecord, BusinessExpense, SpoilageRecord } from '../types';

export const INITIAL_ITEMS: VegetableItem[] = [
  {
    id: 'item-1',
    nameBn: 'আলু (ডায়মন্ড লাল)',
    nameEn: 'Potato (Red Diamond)',
    category: 'নিত্যপ্রয়োজনীয়',
    currentStockKg: 2400, // ~ 48 sacks
    defaultUnit: 'বস্তা',
    avgPurchasePricePerKg: 28,
    currentRetailPricePerKg: 35,
    currentWholesalePricePerKg: 31,
    minStockAlertKg: 500,
  },
  {
    id: 'item-2',
    nameBn: 'পেঁয়াজ (দেশি পাবনা)',
    nameEn: 'Onion (Local)',
    category: 'নিত্যপ্রয়োজনীয়',
    currentStockKg: 1650,
    defaultUnit: 'বস্তা',
    avgPurchasePricePerKg: 65,
    currentRetailPricePerKg: 80,
    currentWholesalePricePerKg: 72,
    minStockAlertKg: 400,
  },
  {
    id: 'item-3',
    nameBn: 'রসুন (দেশি)',
    nameEn: 'Garlic (Local)',
    category: 'মসলাপাতি',
    currentStockKg: 450,
    defaultUnit: 'কেজি',
    avgPurchasePricePerKg: 170,
    currentRetailPricePerKg: 210,
    currentWholesalePricePerKg: 185,
    minStockAlertKg: 100,
  },
  {
    id: 'item-4',
    nameBn: 'আদা (চায়না)',
    nameEn: 'Ginger (China)',
    category: 'মসলাপাতি',
    currentStockKg: 320,
    defaultUnit: 'কেজি',
    avgPurchasePricePerKg: 190,
    currentRetailPricePerKg: 240,
    currentWholesalePricePerKg: 210,
    minStockAlertKg: 80,
  },
  {
    id: 'item-5',
    nameBn: 'কাঁচামরিচ',
    nameEn: 'Green Chili',
    category: 'শাকসবজি',
    currentStockKg: 180,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 110,
    currentRetailPricePerKg: 160,
    currentWholesalePricePerKg: 130,
    minStockAlertKg: 50,
  },
  {
    id: 'item-6',
    nameBn: 'টমেটো (পাকা দেশি)',
    nameEn: 'Fresh Tomato',
    category: 'শাকসবজি',
    currentStockKg: 620,
    defaultUnit: 'খাঁচা',
    avgPurchasePricePerKg: 55,
    currentRetailPricePerKg: 80,
    currentWholesalePricePerKg: 65,
    minStockAlertKg: 150,
  },
  {
    id: 'item-7',
    nameBn: 'বেগুন (গোল তালবেগুন)',
    nameEn: 'Eggplant (Round)',
    category: 'শাকসবজি',
    currentStockKg: 380,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 45,
    currentRetailPricePerKg: 65,
    currentWholesalePricePerKg: 52,
    minStockAlertKg: 100,
  },
  {
    id: 'item-8',
    nameBn: 'শসা (কচি হাইব্রিড)',
    nameEn: 'Cucumber',
    category: 'শাকসবজি',
    currentStockKg: 290,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 35,
    currentRetailPricePerKg: 50,
    currentWholesalePricePerKg: 40,
    minStockAlertKg: 100,
  },
  {
    id: 'item-9',
    nameBn: 'পটল',
    nameEn: 'Pointed Gourd',
    category: 'শাকসবজি',
    currentStockKg: 210,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 40,
    currentRetailPricePerKg: 60,
    currentWholesalePricePerKg: 48,
    minStockAlertKg: 80,
  },
  {
    id: 'item-10',
    nameBn: 'মিষ্টি কুমড়া (গোটা)',
    nameEn: 'Sweet Pumpkin',
    category: 'নিত্যপ্রয়োজনীয়',
    currentStockKg: 850,
    defaultUnit: 'কেজি',
    avgPurchasePricePerKg: 24,
    currentRetailPricePerKg: 35,
    currentWholesalePricePerKg: 28,
    minStockAlertKg: 200,
  },
  {
    id: 'item-11',
    nameBn: 'লাউ (বড় পিস)',
    nameEn: 'Bottle Gourd',
    category: 'শাকসবজি',
    currentStockKg: 120, // 120 pieces treated as unit
    defaultUnit: 'পিস',
    avgPurchasePricePerKg: 35,
    currentRetailPricePerKg: 60,
    currentWholesalePricePerKg: 45,
    minStockAlertKg: 30,
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    phone: '01712-345678',
    address: 'স্টেশন রোড, বাজার মোড়',
    totalPurchases: 48500,
    totalPaid: 42000,
    currentDue: 6500,
    createdAt: '2026-08-10',
    notes: 'নিয়মিত হোটেল কাস্টমার, প্রতি সপ্তাহে বাকি পরিশোধ করেন।'
  },
  {
    id: 'cust-2',
    name: 'আব্দুর রহিম (খুচরা বিক্রেতা)',
    phone: '01823-456789',
    address: 'সদর বাজার শেড নং ৪',
    totalPurchases: 32400,
    totalPaid: 30000,
    currentDue: 2400,
    createdAt: '2026-08-15',
    notes: 'প্রতিদিন সকালে পাইকারি কাঁচামাল নেন।'
  },
  {
    id: 'cust-3',
    name: 'হাজী বিরিয়ানি হাউস',
    phone: '01911-223344',
    address: 'কলেজ রোড মোড়',
    totalPurchases: 65200,
    totalPaid: 65200,
    currentDue: 0,
    createdAt: '2026-08-20',
    notes: 'নগদ ক্রেতা, আলু ও পেঁয়াজ বেশি নেন।'
  },
  {
    id: 'cust-4',
    name: 'মেসার্স রুবেল ভ্যারাইটিজ',
    phone: '01678-998877',
    address: 'গ্রামের বাজার, শিবপুর',
    totalPurchases: 27800,
    totalPaid: 21000,
    currentDue: 6800,
    createdAt: '2026-09-01',
    notes: 'পটল, বেগুন ও কাঁচামরিচ পাইকারি নেন।'
  },
  {
    id: 'cust-5',
    name: 'সাধারণ খুচরা ক্রেতাগণ (ক্যাশ সেল)',
    phone: '01700-000000',
    address: 'দোকান কাউন্টার',
    totalPurchases: 94000,
    totalPaid: 94000,
    currentDue: 0,
    createdAt: '2026-08-01',
    notes: 'দৈনিক নগদ ক্যাশ বিক্রয়'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'মেসার্স মকবুল আড়তদার ও মহাজন',
    phone: '01715-112233',
    marketLocation: 'বগুড়া মহাস্থানগড় আড়ত',
    totalPurchases: 145000,
    totalPaid: 125000,
    currentPayable: 20000,
    createdAt: '2026-07-15'
  },
  {
    id: 'supp-2',
    name: 'হাজী কাশেম বেপারি (পেঁয়াজ-রসুন আমদানিকারক)',
    phone: '01819-334455',
    marketLocation: 'পাবনা সাঁথিয়া হাট',
    totalPurchases: 210000,
    totalPaid: 195000,
    currentPayable: 15000,
    createdAt: '2026-07-20'
  },
  {
    id: 'supp-3',
    name: 'সবুজ কৃষক সমবায় কাঁচাবাজার',
    phone: '01912-778899',
    marketLocation: 'যশোর চুয়াডাঙ্গা রোড',
    totalPurchases: 88000,
    totalPaid: 88000,
    currentPayable: 0,
    createdAt: '2026-08-01'
  }
];

export const INITIAL_MARKET_RATES: MarketRate[] = [
  {
    itemId: 'item-1',
    itemName: 'আলু (ডায়মন্ড লাল)',
    yesterdayWholesaleKg: 30,
    todayWholesaleKg: 31,
    todayRetailKg: 35,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 3.3,
    marketNote: 'উত্তরবঙ্গে কোল্ড স্টোরেজ গেট থেকে সরবরাহ সামান্য কমেছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৭:৩০'
  },
  {
    itemId: 'item-2',
    itemName: 'পেঁয়াজ (দেশি পাবনা)',
    yesterdayWholesaleKg: 75,
    todayWholesaleKg: 72,
    todayRetailKg: 80,
    unit: 'কেজি',
    trend: 'down',
    changePercent: -4.0,
    marketNote: 'ভারতীয় পেঁয়াজের আমদানি ও দেশি নতুন চালান পৌঁছানোয় দাম কিছুটা কমেছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৭:৩০'
  },
  {
    itemId: 'item-3',
    itemName: 'রসুন (দেশি)',
    yesterdayWholesaleKg: 185,
    todayWholesaleKg: 185,
    todayRetailKg: 210,
    unit: 'কেজি',
    trend: 'same',
    changePercent: 0,
    marketNote: 'বাজার দর স্থিতিশীল',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৭:১৫'
  },
  {
    itemId: 'item-4',
    itemName: 'আদা (চায়না)',
    yesterdayWholesaleKg: 200,
    todayWholesaleKg: 210,
    todayRetailKg: 240,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 5.0,
    marketNote: 'চট্টগ্রাম বন্দর থেকে পরিবহন ব্যয় বৃদ্ধি পেয়েছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৭:১৫'
  },
  {
    itemId: 'item-5',
    itemName: 'কাঁচামরিচ',
    yesterdayWholesaleKg: 145,
    todayWholesaleKg: 130,
    todayRetailKg: 160,
    unit: 'কেজি',
    trend: 'down',
    changePercent: -10.3,
    marketNote: 'দক্ষিণাঞ্চলের চরে ভালো ফলন ও প্রচুর সরবরাহে দাম দ্রুত কমছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:৪৫'
  },
  {
    itemId: 'item-6',
    itemName: 'টমেটো (পাকা দেশি)',
    yesterdayWholesaleKg: 62,
    todayWholesaleKg: 65,
    todayRetailKg: 80,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 4.8,
    marketNote: 'বৃষ্টির কারণে তুলতে কিছুটা বিলম্ব হওয়ায় আমদানি কম',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:৪৫'
  },
  {
    itemId: 'item-7',
    itemName: 'বেগুন (গোল তালবেগুন)',
    yesterdayWholesaleKg: 52,
    todayWholesaleKg: 52,
    todayRetailKg: 65,
    unit: 'কেজি',
    trend: 'same',
    changePercent: 0,
    marketNote: 'সরবরাহ ও চাহিদা সমপর্যায়ে রয়েছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:৩০'
  },
  {
    itemId: 'item-8',
    itemName: 'শসা (কচি হাইব্রিড)',
    yesterdayWholesaleKg: 44,
    todayWholesaleKg: 40,
    todayRetailKg: 50,
    unit: 'কেজি',
    trend: 'down',
    changePercent: -9.1,
    marketNote: 'স্থানীয় কৃষকদের প্রচুর শসার গাড়ি হাটে এসেছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:৩০'
  }
];

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'মেসার্স ভাই ভাই কাঁচামাল আড়ত ও সবজি ভাণ্ডার',
  proprietorName: 'মো: রফিকুল ইসলাম',
  proprietor: 'মো: রফিকুল ইসলাম',
  phone: '০১৭১২-৯৮৭৬৫৪',
  secondaryPhone: '০১৯৮৭-১২৩৪৫৬',
  address: 'দোকান নং ১২, কাঁচাবাজার আড়ত পট্টি, কারওয়ান বাজার, ঢাকা',
  slogan: 'তাজা ও সতেজ সবজির বিশ্বস্ত পাইকারি ও খুচরা প্রতিষ্ঠান',
  tagline: 'তাজা ও সতেজ সবজির বিশ্বস্ত পাইকারি ও খুচরা প্রতিষ্ঠান',
  invoiceFooterNote: 'ধন্যবাদ, আবার আসবেন! বিক্রি হওয়া কাঁচামাল ২৪ ঘণ্টার মধ্যে বাছাই করে নিতে হবে।',
  cloudSyncEnabled: true,
  lastCloudBackup: '২০২৬-০৯-২২ ০৯:১৫'
};

export const INITIAL_SALES: SaleRecord[] = [
  {
    id: 'sale-104',
    invoiceNo: 'ইনভ-২০২৬-১০০৪',
    customerId: 'cust-1',
    customerName: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    customerPhone: '01712-345678',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 3, unit: 'বস্তা', quantityInKg: 150, unitPrice: 32, totalPrice: 4800, costPricePerKg: 28 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 72, totalPrice: 7200, costPricePerKg: 65 },
      { itemId: 'item-5', itemName: 'কাঁচামরিচ', quantity: 4, unit: 'পাল্লা', quantityInKg: 20, unitPrice: 130, totalPrice: 2600, costPricePerKg: 110 }
    ],
    subtotal: 14600,
    discount: 100,
    labourCost: 80,
    grandTotal: 14580,
    paidAmount: 10000,
    dueAmount: 4580,
    paymentMethod: 'নগদ',
    date: '2026-09-23T07:30:00.000Z',
    notes: 'সকালের প্রথম ডেলিভারি'
  },
  {
    id: 'sale-105',
    invoiceNo: 'ইনভ-২০২৬-১০০৫',
    customerId: 'cust-3',
    customerName: 'হাজী কাশেম স্টোর (পাইকারি)',
    customerPhone: '01934-567890',
    items: [
      { itemId: 'item-6', itemName: 'টমেটো (পাকা দেশি)', quantity: 2, unit: 'খাঁচা', quantityInKg: 50, unitPrice: 65, totalPrice: 3250, costPricePerKg: 55 },
      { itemId: 'item-8', itemName: 'শসা (কচি হাইব্রিড)', quantity: 5, unit: 'পাল্লা', quantityInKg: 25, unitPrice: 40, totalPrice: 1000, costPricePerKg: 32 }
    ],
    subtotal: 4250,
    discount: 50,
    grandTotal: 4200,
    paidAmount: 4200,
    dueAmount: 0,
    paymentMethod: 'বিকাশ',
    date: '2026-09-23T08:45:00.000Z'
  },
  {
    id: 'sale-101',
    invoiceNo: 'ইনভ-২০২৬-১০০১',
    customerId: 'cust-1',
    customerName: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    customerPhone: '01712-345678',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 32, totalPrice: 3200, costPricePerKg: 28 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 1, unit: 'বস্তা', quantityInKg: 50, unitPrice: 75, totalPrice: 3750, costPricePerKg: 65 },
      { itemId: 'item-6', itemName: 'টমেটো (পাকা দেশি)', quantity: 1, unit: 'খাঁচা', quantityInKg: 25, unitPrice: 70, totalPrice: 1750, costPricePerKg: 55 }
    ],
    subtotal: 8700,
    discount: 100,
    labourCost: 50,
    grandTotal: 8650,
    paidAmount: 5000,
    dueAmount: 3650,
    paymentMethod: 'বিকাশ',
    date: '2026-09-22T08:30:00.000Z',
    notes: 'সকালে ডেলিভারি সম্পন্ন হয়েছে'
  },
  {
    id: 'sale-102',
    invoiceNo: 'ইনভ-২০২৬-১০০২',
    customerId: 'cust-2',
    customerName: 'আব্দুর রহিম (খুচরা বিক্রেতা)',
    customerPhone: '01823-456789',
    items: [
      { itemId: 'item-5', itemName: 'কাঁচামরিচ', quantity: 3, unit: 'পাল্লা', quantityInKg: 15, unitPrice: 140, totalPrice: 2100, costPricePerKg: 110 },
      { itemId: 'item-7', itemName: 'বেগুন (গোল তালবেগুন)', quantity: 4, unit: 'পাল্লা', quantityInKg: 20, unitPrice: 55, totalPrice: 1100, costPricePerKg: 45 },
      { itemId: 'item-8', itemName: 'শসা (কচি হাইব্রিড)', quantity: 4, unit: 'পাল্লা', quantityInKg: 20, unitPrice: 42, totalPrice: 840, costPricePerKg: 35 }
    ],
    subtotal: 4040,
    discount: 40,
    grandTotal: 4000,
    paidAmount: 4000,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-09-22T09:15:00.000Z'
  },
  {
    id: 'sale-103',
    invoiceNo: 'ইনভ-২০২৬-১০০৩',
    customerId: 'cust-5',
    customerName: 'সাধারণ খুচরা ক্রেতাগণ (ক্যাশ সেল)',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 20, unit: 'কেজি', quantityInKg: 20, unitPrice: 35, totalPrice: 700, costPricePerKg: 28 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 15, unit: 'কেজি', quantityInKg: 15, unitPrice: 80, totalPrice: 1200, costPricePerKg: 65 },
      { itemId: 'item-3', itemName: 'রসুন (দেশি)', quantity: 5, unit: 'কেজি', quantityInKg: 5, unitPrice: 210, totalPrice: 1050, costPricePerKg: 170 }
    ],
    subtotal: 2950,
    discount: 0,
    grandTotal: 2950,
    paidAmount: 2950,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-09-22T10:00:00.000Z'
  },
  {
    id: 'sale-100',
    invoiceNo: 'ইনভ-২০২৬-১০০০',
    customerId: 'cust-2',
    customerName: 'আব্দুর রহিম (খুচরা বিক্রেতা)',
    customerPhone: '01823-456789',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 1, unit: 'বস্তা', quantityInKg: 50, unitPrice: 32, totalPrice: 1600, costPricePerKg: 28 },
      { itemId: 'item-4', itemName: 'আদা (চায়না)', quantity: 2, unit: 'পাল্লা', quantityInKg: 10, unitPrice: 210, totalPrice: 2100, costPricePerKg: 180 }
    ],
    subtotal: 3700,
    discount: 0,
    grandTotal: 3700,
    paidAmount: 3700,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-09-21T09:30:00.000Z'
  },
  {
    id: 'sale-099',
    invoiceNo: 'ইনভ-২০২৬-০৯৯৯',
    customerId: 'cust-4',
    customerName: 'মায়ের দোয়া ভেজিটেবল কর্নার',
    customerPhone: '01612-998877',
    items: [
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 75, totalPrice: 7500, costPricePerKg: 65 }
    ],
    subtotal: 7500,
    discount: 100,
    grandTotal: 7400,
    paidAmount: 5000,
    dueAmount: 2400,
    paymentMethod: 'নগদ',
    date: '2026-09-20T11:00:00.000Z'
  }
];

export const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: 'purch-201',
    chalanNo: 'চালান-বগুড়া-৮৯',
    supplierId: 'supp-1',
    supplierName: 'মেসার্স মকবুল আড়তদার ও মহাজন',
    supplierPhone: '01715-112233',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 50, unit: 'বস্তা', quantityInKg: 2500, unitPrice: 28, totalPrice: 70000 },
      { itemId: 'item-6', itemName: 'টমেটো (পাকা দেশি)', quantity: 20, unit: 'খাঁচা', quantityInKg: 500, unitPrice: 55, totalPrice: 27500 }
    ],
    transportCost: 3500,
    labourCost: 1000,
    grandTotal: 102000,
    paidAmount: 85000,
    dueAmount: 17000,
    paymentMethod: 'ব্যাংক',
    date: '2026-09-21T18:00:00.000Z',
    notes: 'ট্রাক নং ঢাকা মেট্রো-ট-১২-৩৪৫৬ যোগে মাল এসেছে'
  }
];

export const INITIAL_EXPENSES: BusinessExpense[] = [
  {
    id: 'exp-3',
    title: 'আজকের কুলি ও লোডিং খরচ',
    category: 'লেবার/কুলি',
    amount: 1450,
    date: '2026-09-23T08:15:00.000Z',
    paidTo: 'বশির সরদার (লেবার গ্রুপ)',
    paymentMethod: 'নগদ'
  },
  {
    id: 'exp-4',
    title: 'দোকানের চা-নাস্তা ও বিদ্যুৎ বিল',
    category: 'অন্যান্য',
    amount: 350,
    date: '2026-09-23T09:30:00.000Z',
    paymentMethod: 'নগদ'
  },
  {
    id: 'exp-1',
    title: 'কুলি ও লেবার মজুরি',
    category: 'লেবার/কুলি',
    amount: 1200,
    date: '2026-09-22T10:30:00.000Z',
    paidTo: 'বশির সরদার (লেবার গ্রুপ)',
    paymentMethod: 'নগদ'
  },
  {
    id: 'exp-2',
    title: 'দোকান ও আড়তের নাস্তা খরচ',
    category: 'চা-নাস্তা',
    amount: 280,
    date: '2026-09-22T09:00:00.000Z',
    paymentMethod: 'নগদ'
  },
  {
    id: 'exp-5',
    title: 'আড়ত পরিষ্কার ও লেবার মজুরি',
    category: 'লেবার/কুলি',
    amount: 800,
    date: '2026-09-21T16:00:00.000Z',
    paymentMethod: 'নগদ'
  }
];

export const INITIAL_SPOILAGES: SpoilageRecord[] = [
  {
    id: 'spoil-1',
    itemId: 'item-6',
    itemName: 'টমেটো (পাকা দেশি)',
    quantityKg: 12,
    costPricePerKg: 55,
    lossAmount: 660,
    reason: 'পচে গেছে',
    date: '2026-09-22T07:45:00.000Z',
    notes: 'বৃষ্টিতে ভিজে পেছনের খাঁচায় কিছু টমেটো পচে নষ্ট হয়েছে'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'স্বাগত জানাচ্ছি!',
    message: 'কাঁচামাল ও সবজির ডিজিটাল হিসাব খাতা সফলভাবে চালু হয়েছে।',
    type: 'system' as const,
    date: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    isRead: false,
    read: false
  },
  {
    id: 'notif-2',
    title: 'মজুত সতর্কতা: আলু ও পেঁয়াজ',
    message: 'বর্তমান মজুদ নিরাপদ মাত্রায় রয়েছে। নতুন মোকাম দর আপডেট হয়েছে।',
    type: 'stock' as const,
    date: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    isRead: false,
    read: false
  }
];

// CamelCase export aliases for App.tsx and other components
export const initialBusinessProfile = INITIAL_BUSINESS_PROFILE;
export const initialVegetables = INITIAL_ITEMS;
export const initialCustomers = INITIAL_CUSTOMERS;
export const initialSuppliers = INITIAL_SUPPLIERS;
export const initialSales = INITIAL_SALES;
export const initialPurchases = INITIAL_PURCHASES;
export const initialExpenses = INITIAL_EXPENSES;
export const initialSpoilage = INITIAL_SPOILAGES;
export const initialMarketRates = INITIAL_MARKET_RATES;
export const initialNotifications = INITIAL_NOTIFICATIONS;

