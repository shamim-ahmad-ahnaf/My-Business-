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
  },
  {
    id: 'item-12',
    nameBn: 'কাঁচা ও পাকা পেঁপে',
    nameEn: 'Papaya (Fresh)',
    category: 'ফলমূল',
    currentStockKg: 480,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 28,
    currentRetailPricePerKg: 45,
    currentWholesalePricePerKg: 35,
    minStockAlertKg: 100,
  },
  {
    id: 'item-13',
    nameBn: 'তরমুজ (বড় লাল)',
    nameEn: 'Watermelon',
    category: 'ফলমূল',
    currentStockKg: 650,
    defaultUnit: 'পিস',
    avgPurchasePricePerKg: 32,
    currentRetailPricePerKg: 50,
    currentWholesalePricePerKg: 40,
    minStockAlertKg: 120,
  },
  {
    id: 'item-14',
    nameBn: 'কাঁচকলা ও সবরি কলা',
    nameEn: 'Green & Ripe Banana',
    category: 'ফলমূল',
    currentStockKg: 350,
    defaultUnit: 'পিস',
    avgPurchasePricePerKg: 30,
    currentRetailPricePerKg: 48,
    currentWholesalePricePerKg: 38,
    minStockAlertKg: 80,
  },
  {
    id: 'item-15',
    nameBn: 'কাগজি লেবু (দেশি)',
    nameEn: 'Lime / Lemon',
    category: 'ফলমূল',
    currentStockKg: 95,
    defaultUnit: 'পিস',
    avgPurchasePricePerKg: 85,
    currentRetailPricePerKg: 130,
    currentWholesalePricePerKg: 105,
    minStockAlertKg: 40,
  },
  {
    id: 'item-16',
    nameBn: 'লাল শাক ও পালং শাক',
    nameEn: 'Leafy Spinach & Amaranth',
    category: 'শাকসবজি',
    currentStockKg: 160,
    defaultUnit: 'পাল্লা',
    avgPurchasePricePerKg: 22,
    currentRetailPricePerKg: 35,
    currentWholesalePricePerKg: 28,
    minStockAlertKg: 50,
  },
  {
    id: 'item-17',
    nameBn: 'শুকনা মরিচ ও জিরা',
    nameEn: 'Dry Red Chili & Cumin',
    category: 'মসলাপাতি',
    currentStockKg: 140,
    defaultUnit: 'কেজি',
    avgPurchasePricePerKg: 320,
    currentRetailPricePerKg: 420,
    currentWholesalePricePerKg: 370,
    minStockAlertKg: 40,
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
  },
  {
    itemId: 'item-9',
    itemName: 'পটল',
    yesterdayWholesaleKg: 46,
    todayWholesaleKg: 48,
    todayRetailKg: 60,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 4.3,
    marketNote: 'মোকামে নতুন পটলের সরবরাহ সীমিত থাকায় পাইকারিতে দর কিছুটা চড়া',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:৩০'
  },
  {
    itemId: 'item-10',
    itemName: 'মিষ্টি কুমড়া (গোটা)',
    yesterdayWholesaleKg: 28,
    todayWholesaleKg: 28,
    todayRetailKg: 35,
    unit: 'কেজি',
    trend: 'same',
    changePercent: 0,
    marketNote: 'গোটা মিষ্টি কুমড়ার দর বেশ কয়েকদিন যাবৎ স্থিতিশীল',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:১৫'
  },
  {
    itemId: 'item-11',
    itemName: 'লাউ (বড় পিস)',
    yesterdayWholesaleKg: 48,
    todayWholesaleKg: 45,
    todayRetailKg: 60,
    unit: 'পিস',
    trend: 'down',
    changePercent: -6.3,
    marketNote: 'গ্রামাঞ্চল থেকে প্রচুর তাজা লাউয়ের সরবরাহ আসায় দর সামান্য নিম্নমুখী',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:১৫'
  },
  {
    itemId: 'item-12',
    itemName: 'কাঁচা ও পাকা পেঁপে',
    yesterdayWholesaleKg: 35,
    todayWholesaleKg: 35,
    todayRetailKg: 45,
    unit: 'কেজি',
    trend: 'same',
    changePercent: 0,
    marketNote: 'সবজি ও পাকা পেঁপের সরবরাহ স্বাভাবিক রয়েছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:০০'
  },
  {
    itemId: 'item-13',
    itemName: 'তরমুজ (দেশি লাল)',
    yesterdayWholesaleKg: 45,
    todayWholesaleKg: 42,
    todayRetailKg: 55,
    unit: 'কেজি',
    trend: 'down',
    changePercent: -6.7,
    marketNote: 'বরিশাল ও উপকূলীয় মোকাম থেকে বড় চালান পৌঁছানোয় দাম কমেছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৬:০০'
  },
  {
    itemId: 'item-14',
    itemName: 'পাকা সাগর কলা',
    yesterdayWholesaleKg: 42,
    todayWholesaleKg: 45,
    todayRetailKg: 55,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 7.1,
    marketNote: 'নরসিংদী ও মধুপুর থেকে পাকা কলার চালান সীমিত থাকায় দর বেড়েছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৫:৪৫'
  },
  {
    itemId: 'item-15',
    itemName: 'কলমি ও লাল শাক',
    yesterdayWholesaleKg: 22,
    todayWholesaleKg: 24,
    todayRetailKg: 35,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 9.1,
    marketNote: 'সকালের বাজারে তাজা শাকের প্রচুর চাহিদা থাকায় চড়া দর',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৫:৪৫'
  },
  {
    itemId: 'item-16',
    itemName: 'কাঁচা লেবু (কাগজি)',
    yesterdayWholesaleKg: 28,
    todayWholesaleKg: 28,
    todayRetailKg: 40,
    unit: 'কেজি',
    trend: 'same',
    changePercent: 0,
    marketNote: 'লেবুর পাইকারি ও খুচরা বাজার দর অপরিবর্তিত রয়েছে',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৫:৩০'
  },
  {
    itemId: 'item-17',
    itemName: 'শুকনা মরিচ ও জিরা',
    yesterdayWholesaleKg: 365,
    todayWholesaleKg: 370,
    todayRetailKg: 420,
    unit: 'কেজি',
    trend: 'up',
    changePercent: 1.4,
    marketNote: 'আমদানি ব্যয় বৃদ্ধির কারণে মসলা মোকামে পাইকারি দর ঊর্ধ্বমুখী',
    lastUpdated: '২০২৬-০৯-২২ সকাল ০৫:৩০'
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
  },
  // October 2026 (Current Month)
  {
    id: 'sale-106',
    invoiceNo: 'ইনভ-২০২৬-১০০৬',
    customerId: 'cust-1',
    customerName: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    customerPhone: '01712-345678',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 4, unit: 'বস্তা', quantityInKg: 200, unitPrice: 34, totalPrice: 6800, costPricePerKg: 28 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 76, totalPrice: 7600, costPricePerKg: 65 },
      { itemId: 'item-6', itemName: 'টমেটো (পাকা দেশি)', quantity: 2, unit: 'খাঁচা', quantityInKg: 50, unitPrice: 72, totalPrice: 3600, costPricePerKg: 55 }
    ],
    subtotal: 18000,
    discount: 200,
    labourCost: 100,
    grandTotal: 17900,
    paidAmount: 15000,
    dueAmount: 2900,
    paymentMethod: 'নগদ',
    date: '2026-10-10T08:30:00.000Z',
    notes: 'অক্টোবর মাসের নিয়মিত অর্ডার'
  },
  {
    id: 'sale-107',
    invoiceNo: 'ইনভ-২০২৬-১০০৭',
    customerId: 'cust-3',
    customerName: 'হাজী কাশেম স্টোর (পাইকারি)',
    customerPhone: '01934-567890',
    items: [
      { itemId: 'item-5', itemName: 'কাঁচামরিচ', quantity: 5, unit: 'পাল্লা', quantityInKg: 25, unitPrice: 145, totalPrice: 3625, costPricePerKg: 110 },
      { itemId: 'item-7', itemName: 'বেগুন (গোল তালবেগুন)', quantity: 6, unit: 'পাল্লা', quantityInKg: 30, unitPrice: 58, totalPrice: 1740, costPricePerKg: 45 },
      { itemId: 'item-3', itemName: 'রসুন (দেশি)', quantity: 10, unit: 'কেজি', quantityInKg: 10, unitPrice: 215, totalPrice: 2150, costPricePerKg: 170 }
    ],
    subtotal: 7515,
    discount: 115,
    grandTotal: 7400,
    paidAmount: 7400,
    dueAmount: 0,
    paymentMethod: 'বিকাশ',
    date: '2026-10-06T09:00:00.000Z'
  },
  // August 2026
  {
    id: 'sale-090',
    invoiceNo: 'ইনভ-২০২৬-০৮৯০',
    customerId: 'cust-1',
    customerName: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    customerPhone: '01712-345678',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 6, unit: 'বস্তা', quantityInKg: 300, unitPrice: 32, totalPrice: 9600, costPricePerKg: 27 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 3, unit: 'বস্তা', quantityInKg: 150, unitPrice: 70, totalPrice: 10500, costPricePerKg: 60 }
    ],
    subtotal: 20100,
    discount: 100,
    grandTotal: 20000,
    paidAmount: 18000,
    dueAmount: 2000,
    paymentMethod: 'নগদ',
    date: '2026-08-25T08:00:00.000Z'
  },
  {
    id: 'sale-089',
    invoiceNo: 'ইনভ-২০২৬-০৮৮৯',
    customerId: 'cust-2',
    customerName: 'আব্দুর রহিম (খুচরা বিক্রেতা)',
    items: [
      { itemId: 'item-6', itemName: 'টমেটো (পাকা দেশি)', quantity: 4, unit: 'খাঁচা', quantityInKg: 100, unitPrice: 65, totalPrice: 6500, costPricePerKg: 50 },
      { itemId: 'item-8', itemName: 'শসা (কচি হাইব্রিড)', quantity: 8, unit: 'পাল্লা', quantityInKg: 40, unitPrice: 40, totalPrice: 1600, costPricePerKg: 30 }
    ],
    subtotal: 8100,
    discount: 100,
    grandTotal: 8000,
    paidAmount: 8000,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-08-14T09:30:00.000Z'
  },
  // July 2026
  {
    id: 'sale-080',
    invoiceNo: 'ইনভ-২০২৬-০৭৮০',
    customerId: 'cust-3',
    customerName: 'হাজী কাশেম স্টোর (পাইকারি)',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 4, unit: 'বস্তা', quantityInKg: 200, unitPrice: 30, totalPrice: 6000, costPricePerKg: 26 },
      { itemId: 'item-7', itemName: 'বেগুন (গোল তালবেগুন)', quantity: 6, unit: 'পাল্লা', quantityInKg: 30, unitPrice: 50, totalPrice: 1500, costPricePerKg: 42 }
    ],
    subtotal: 7500,
    discount: 100,
    grandTotal: 7400,
    paidAmount: 6000,
    dueAmount: 1400,
    paymentMethod: 'নগদ',
    date: '2026-07-20T10:00:00.000Z'
  },
  {
    id: 'sale-079',
    invoiceNo: 'ইনভ-২০২৬-০৭৭৯',
    customerId: 'cust-4',
    customerName: 'মায়ের দোয়া ভেজিটেবল কর্নার',
    items: [
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 68, totalPrice: 6800, costPricePerKg: 58 }
    ],
    subtotal: 6800,
    discount: 100,
    grandTotal: 6700,
    paidAmount: 6700,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-07-08T09:15:00.000Z'
  },
  // June 2026
  {
    id: 'sale-070',
    invoiceNo: 'ইনভ-২০২৬-০৬৭০',
    customerId: 'cust-1',
    customerName: 'আলমগীর হোটেল এন্ড রেস্টুরেন্ট',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 5, unit: 'বস্তা', quantityInKg: 250, unitPrice: 30, totalPrice: 7500, costPricePerKg: 25 },
      { itemId: 'item-5', itemName: 'কাঁচামরিচ', quantity: 6, unit: 'পাল্লা', quantityInKg: 30, unitPrice: 120, totalPrice: 3600, costPricePerKg: 95 }
    ],
    subtotal: 11100,
    discount: 100,
    grandTotal: 11000,
    paidAmount: 11000,
    dueAmount: 0,
    paymentMethod: 'নগদ',
    date: '2026-06-18T08:30:00.000Z'
  },
  // May 2026
  {
    id: 'sale-060',
    invoiceNo: 'ইনভ-২০২৬-০৫৬০',
    customerId: 'cust-2',
    customerName: 'আব্দুর রহিম (খুচরা বিক্রেতা)',
    items: [
      { itemId: 'item-1', itemName: 'আলু (ডায়মন্ড লাল)', quantity: 4, unit: 'বস্তা', quantityInKg: 200, unitPrice: 28, totalPrice: 5600, costPricePerKg: 24 },
      { itemId: 'item-2', itemName: 'পেঁয়াজ (দেশি পাবনা)', quantity: 2, unit: 'বস্তা', quantityInKg: 100, unitPrice: 65, totalPrice: 6500, costPricePerKg: 55 }
    ],
    subtotal: 12100,
    discount: 100,
    grandTotal: 12000,
    paidAmount: 10000,
    dueAmount: 2000,
    paymentMethod: 'নগদ',
    date: '2026-05-15T09:00:00.000Z'
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
  },
  // October 2026
  {
    id: 'exp-101',
    title: 'অক্টোবর দোকান ভাড়া ও বিদ্যুৎ বিল',
    category: 'দোকান ভাড়া',
    amount: 2500,
    date: '2026-10-05T11:00:00.000Z',
    paidTo: 'আড়ত সমিতি',
    paymentMethod: 'ব্যাংক'
  },
  {
    id: 'exp-102',
    title: 'লেবার ও লোডিং মজুরি',
    category: 'লেবার/কুলি',
    amount: 1100,
    date: '2026-10-10T14:00:00.000Z',
    paidTo: 'বশির সরদার',
    paymentMethod: 'নগদ'
  },
  // August 2026
  {
    id: 'exp-81',
    title: 'আগস্ট মাসের দোকান ভাড়া ও লেবার',
    category: 'দোকান ভাড়া',
    amount: 3200,
    date: '2026-08-05T10:00:00.000Z',
    paidTo: 'আড়ত সমিতি',
    paymentMethod: 'ব্যাংক'
  },
  {
    id: 'exp-82',
    title: 'ট্রাক লোডিং ও কুলি খরচ',
    category: 'লেবার/কুলি',
    amount: 1400,
    date: '2026-08-20T12:00:00.000Z',
    paidTo: 'লেবার গ্রুপ',
    paymentMethod: 'নগদ'
  },
  // July 2026 (rainy season high expenses)
  {
    id: 'exp-71',
    title: 'বৃষ্টিজনিত ত্রিপল ও পরিবহন অতিরিক্ত খরচ',
    category: 'যাতায়াত ও গাড়িভাড়া',
    amount: 3800,
    date: '2026-07-12T11:30:00.000Z',
    paidTo: 'ট্রাক চালক',
    paymentMethod: 'নগদ'
  },
  {
    id: 'exp-72',
    title: 'জুলাই দোকান ভাড়া ও বিদ্যুৎ বিল',
    category: 'দোকান ভাড়া',
    amount: 2800,
    date: '2026-07-05T09:00:00.000Z',
    paidTo: 'আড়ত সমিতি',
    paymentMethod: 'ব্যাংক'
  },
  // June 2026
  {
    id: 'exp-61',
    title: 'জুন দোকান ভাড়া ও লেবার খরচ',
    category: 'দোকান ভাড়া',
    amount: 2600,
    date: '2026-06-05T10:00:00.000Z',
    paymentMethod: 'ব্যাংক'
  },
  // May 2026
  {
    id: 'exp-51',
    title: 'মে মাসের আড়ত পরিচালন ও লেবার বিল',
    category: 'লেবার/কুলি',
    amount: 2200,
    date: '2026-05-10T10:00:00.000Z',
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
  },
  {
    id: 'spoil-71',
    itemId: 'item-6',
    itemName: 'টমেটো (পাকা দেশি)',
    quantityKg: 40,
    costPricePerKg: 50,
    lossAmount: 2000,
    reason: 'পচে গেছে',
    date: '2026-07-15T08:00:00.000Z',
    notes: 'টানা বর্ষার কারণে চালানে টমেটো ক্ষতিগ্রস্ত হয়েছে'
  },
  {
    id: 'spoil-81',
    itemId: 'item-8',
    itemName: 'শসা (কচি হাইব্রিড)',
    quantityKg: 15,
    costPricePerKg: 30,
    lossAmount: 450,
    reason: 'শুকিয়ে ওজন হ্রাস',
    date: '2026-08-18T09:00:00.000Z'
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

