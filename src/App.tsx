import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VegetableItem, 
  SaleRecord, 
  PurchaseRecord, 
  Customer, 
  Supplier, 
  BusinessExpense, 
  SpoilageRecord, 
  MarketRate, 
  BusinessNotification, 
  PaymentTransaction,
  BusinessProfile
} from './types';
import {
  initialBusinessProfile,
  initialVegetables,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialSpoilage,
  initialMarketRates,
  initialNotifications
} from './data/initialData';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  createFullBackupData,
  downloadJsonBackup
} from './utils/storage';
import {
  subscribeToCloudUpdates,
  pushToCloud,
  forceFetchFromCloud,
  registerSyncStatusListener,
  SyncStatus,
  AppSyncData
} from './utils/syncService';
import {
  checkBackupAlertStatus,
  recordManualBackup,
  snoozeBackupAlert,
  BackupAlertStatus
} from './utils/backupAlertService';
import { toBengaliNumber } from './utils/formatters';

// Components
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SalesManager } from './components/SalesManager';
import { PurchaseManager } from './components/PurchaseManager';
import { InventoryManager } from './components/InventoryManager';
import { CustomersSuppliers } from './components/CustomersSuppliers';
import { ProfitLossReport } from './components/ProfitLossReport';
import { MarketRateTab } from './components/MarketRateTab';
import { PaymentTracker } from './components/PaymentTracker';
import { InvoiceModal } from './components/InvoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { QrScannerModal } from './components/QrScannerModal';

export const App: React.FC = () => {
  // Theme & State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return loadFromStorage(STORAGE_KEYS.DARK_MODE, false);
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleRecord | null>(null);

  // Sync & Remote State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const isRemoteUpdating = useRef<boolean>(false);

  // Core Business Data
  const [profile, setProfile] = useState<BusinessProfile>(() => {
    return loadFromStorage(STORAGE_KEYS.PROFILE, initialBusinessProfile);
  });
  const [items, setItems] = useState<VegetableItem[]>(() => {
    return loadFromStorage(STORAGE_KEYS.ITEMS, initialVegetables);
  });
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    return loadFromStorage(STORAGE_KEYS.SALES, initialSales);
  });
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    return loadFromStorage(STORAGE_KEYS.PURCHASES, initialPurchases);
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    return loadFromStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    return loadFromStorage(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  });
  const [expenses, setExpenses] = useState<BusinessExpense[]>(() => {
    return loadFromStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
  });
  const [spoilages, setSpoilages] = useState<SpoilageRecord[]>(() => {
    return loadFromStorage(STORAGE_KEYS.SPOILAGES, initialSpoilage);
  });
  const [marketRates, setMarketRates] = useState<MarketRate[]>(() => {
    return loadFromStorage(STORAGE_KEYS.MARKET_RATES, initialMarketRates);
  });
  const [notifications, setNotifications] = useState<BusinessNotification[]>(() => {
    return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  });
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    return loadFromStorage('kachamal_transactions', []);
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage(STORAGE_KEYS.DARK_MODE, darkMode);
  }, [darkMode]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification('ইন্টারনেট সংযোগ চালু হয়েছে', 'ইন্টারনেট ব্যাকআপ ও ডিভাইস সিঙ্ক সক্রিয় আছে।', 'system');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addNotification('ইন্টারনেট সংযোগ বিচ্ছিন্ন', 'অ্যাপ্লিকেশনটি সম্পূর্ণ অফলাইন মোডে লোকাল স্টোরেজে কাজ করছে।', 'alert');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time Cloud Synchronization (Multi-Device)
  useEffect(() => {
    const unsubscribeStatus = registerSyncStatusListener((status) => {
      setSyncStatus(status);
    });

    // Initial check: if cloud has remote data, populate it; otherwise seed cloud
    forceFetchFromCloud().then((cloudData) => {
      if (cloudData && (cloudData.sales?.length || cloudData.items?.length || cloudData.profile)) {
        isRemoteUpdating.current = true;
        if (cloudData.profile) setProfile(cloudData.profile);
        if (cloudData.items) setItems(cloudData.items);
        if (cloudData.sales) setSales(cloudData.sales);
        if (cloudData.purchases) setPurchases(cloudData.purchases);
        if (cloudData.customers) setCustomers(cloudData.customers);
        if (cloudData.suppliers) setSuppliers(cloudData.suppliers);
        if (cloudData.expenses) setExpenses(cloudData.expenses);
        if (cloudData.spoilages) setSpoilages(cloudData.spoilages);
        if (cloudData.marketRates) setMarketRates(cloudData.marketRates);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        if (cloudData.transactions) setTransactions(cloudData.transactions);
        setTimeout(() => {
          isRemoteUpdating.current = false;
        }, 600);
      } else {
        // First cloud seed
        pushToCloud({
          profile,
          items,
          sales,
          purchases,
          customers,
          suppliers,
          expenses,
          spoilages,
          marketRates,
          notifications,
          transactions
        });
      }
    }).catch(err => console.error('Cloud initial sync error:', err));

    // Live subscription: whenever another device updates main_store, update immediately!
    const unsubscribeCloud = subscribeToCloudUpdates((remoteData: AppSyncData) => {
      isRemoteUpdating.current = true;
      if (remoteData.profile) setProfile(remoteData.profile);
      if (remoteData.items) setItems(remoteData.items);
      if (remoteData.sales) setSales(remoteData.sales);
      if (remoteData.purchases) setPurchases(remoteData.purchases);
      if (remoteData.customers) setCustomers(remoteData.customers);
      if (remoteData.suppliers) setSuppliers(remoteData.suppliers);
      if (remoteData.expenses) setExpenses(remoteData.expenses);
      if (remoteData.spoilages) setSpoilages(remoteData.spoilages);
      if (remoteData.marketRates) setMarketRates(remoteData.marketRates);
      if (remoteData.notifications) setNotifications(remoteData.notifications);
      if (remoteData.transactions) setTransactions(remoteData.transactions);

      addNotification(
        'অন্য ডিভাইস থেকে ডাটা আপডেট হয়েছে',
        `${remoteData.deviceName || 'অন্যান্য ডিভাইস'} থেকে তথ্য রিয়েল-টাইমে সিঙ্ক হয়েছে।`,
        'system'
      );

      setTimeout(() => {
        isRemoteUpdating.current = false;
      }, 600);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeCloud();
    };
  }, []);

  // Save changes to localStorage and push to cloud (skip if remote update in progress)
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
    if (!isRemoteUpdating.current) pushToCloud({ profile });
  }, [profile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ITEMS, items);
    if (!isRemoteUpdating.current) pushToCloud({ items });
  }, [items]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SALES, sales);
    if (!isRemoteUpdating.current) pushToCloud({ sales });
  }, [sales]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
    if (!isRemoteUpdating.current) pushToCloud({ purchases });
  }, [purchases]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    if (!isRemoteUpdating.current) pushToCloud({ customers });
  }, [customers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    if (!isRemoteUpdating.current) pushToCloud({ suppliers });
  }, [suppliers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    if (!isRemoteUpdating.current) pushToCloud({ expenses });
  }, [expenses]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SPOILAGES, spoilages);
    if (!isRemoteUpdating.current) pushToCloud({ spoilages });
  }, [spoilages]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MARKET_RATES, marketRates);
    if (!isRemoteUpdating.current) pushToCloud({ marketRates });
  }, [marketRates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    if (!isRemoteUpdating.current) pushToCloud({ notifications });
  }, [notifications]);

  useEffect(() => {
    saveToStorage('kachamal_transactions', transactions);
    if (!isRemoteUpdating.current) pushToCloud({ transactions });
  }, [transactions]);

  // Helper to add notification
  const addNotification = (
    title: string, 
    message: string, 
    type: 'sale' | 'purchase' | 'stock' | 'due' | 'system' | 'alert' | 'backup' | 'market'
  ) => {
    const newNotif: BusinessNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 1. Add Sale Handler
  const handleAddSale = (sale: SaleRecord) => {
    // Deduct stock for each item sold
    setItems(prevItems => {
      return prevItems.map(item => {
        const soldMatch = sale.items.find(si => si.itemId === item.id);
        if (soldMatch) {
          const updatedStock = Math.max(0, item.currentStockKg - soldMatch.quantityInKg);
          return { ...item, currentStockKg: updatedStock };
        }
        return item;
      });
    });

    // Update Customer dues if customer selected
    if (sale.customerId) {
      setCustomers(prevCustomers => {
        return prevCustomers.map(c => {
          if (c.id === sale.customerId) {
            return {
              ...c,
              totalPurchases: c.totalPurchases + sale.grandTotal,
              totalPaid: c.totalPaid + sale.paidAmount,
              currentDue: c.currentDue + sale.dueAmount
            };
          }
          return c;
        });
      });
    }

    setSales(prev => [sale, ...prev]);
    addNotification(
      `নতুন বিক্রি সম্পন্ন: ৳${sale.grandTotal}`,
      `${sale.customerName}-কে মেমো #${sale.invoiceNo} প্রদান করা হয়েছে। জমা ৳${sale.paidAmount}`,
      'sale'
    );

    // Auto open invoice preview
    setSelectedInvoice(sale);
  };

  // 2. Add Purchase Handler
  const handleAddPurchase = (purchase: PurchaseRecord) => {
    // Increase stock & recompute average cost
    setItems(prevItems => {
      return prevItems.map(item => {
        const pItem = purchase.items.find(pi => pi.itemId === item.id);
        if (pItem) {
          const addedKg = pItem.quantityInKg || pItem.quantity;
          const newQty = item.currentStockKg + addedKg;
          // Weighted average cost
          const oldVal = item.currentStockKg * item.avgPurchasePricePerKg;
          const newVal = addedKg * pItem.unitPrice;
          const newAvgPrice = newQty > 0 ? Math.round((oldVal + newVal) / newQty) : pItem.unitPrice;

          return {
            ...item,
            currentStockKg: newQty,
            avgPurchasePricePerKg: newAvgPrice
          };
        }
        return item;
      });
    });

    // Update Supplier ledger
    if (purchase.supplierId) {
      setSuppliers(prevSuppliers => {
        return prevSuppliers.map(s => {
          if (s.id === purchase.supplierId) {
            return {
              ...s,
              totalPurchases: s.totalPurchases + purchase.grandTotal,
              totalPaid: s.totalPaid + purchase.paidAmount,
              currentPayable: s.currentPayable + purchase.dueAmount
            };
          }
          return s;
        });
      });
    }

    setPurchases(prev => [purchase, ...prev]);
    addNotification(
      `নতুন মাল চালান জমা: ${purchase.chalanNo}`,
      `${purchase.supplierName} মোকাম থেকে মোট ৳${purchase.grandTotal} এর মাল গোডাউনে লোড হয়েছে।`,
      'purchase'
    );
  };

  // 3. Add New Vegetable Item
  const handleAddItem = (newItem: VegetableItem) => {
    setItems(prev => [...prev, newItem]);
    
    // Add to daily market rates
    const newRate: MarketRate = {
      itemId: newItem.id,
      itemName: newItem.nameBn,
      yesterdayWholesaleKg: newItem.avgPurchasePricePerKg,
      todayWholesaleKg: newItem.currentWholesalePricePerKg,
      todayRetailKg: newItem.currentRetailPricePerKg,
      unit: 'কেজি',
      trend: 'same',
      changePercent: 0,
      marketNote: 'নতুন আইটেম যুক্ত হয়েছে',
      lastUpdated: 'আজ'
    };
    setMarketRates(prev => [...prev, newRate]);

    addNotification(
      `নতুন সবজি যুক্ত হয়েছে`,
      `${newItem.nameBn} ক্যাটালগ ও মজুতে যুক্ত করা হয়েছে।`,
      'stock'
    );
  };

  // 4. Update Stock Quantity Directly
  const handleUpdateStock = (itemId: string, newStockKg: number) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, currentStockKg: newStockKg } : item));
    const it = items.find(i => i.id === itemId);
    addNotification(
      `মজুত সমন্বয় করা হয়েছে`,
      `${it?.nameBn || 'সবজি'} এর নতুন মজুত: ${newStockKg} কেজি`,
      'stock'
    );
  };

  // 5. Add Spoilage / Wastage
  const handleAddSpoilage = (spoilage: SpoilageRecord) => {
    // Deduct from stock
    setItems(prev => prev.map(item => {
      if (item.id === spoilage.itemId) {
        return {
          ...item,
          currentStockKg: Math.max(0, item.currentStockKg - spoilage.quantityKg)
        };
      }
      return item;
    }));

    setSpoilages(prev => [spoilage, ...prev]);
    addNotification(
      `পচন / ক্ষতি এন্ট্রি`,
      `${spoilage.itemName} ${spoilage.quantityKg} কেজি (${spoilage.reason}) বাদ দেওয়া হয়েছে। ক্ষতি ৳${spoilage.lossAmount}`,
      'alert'
    );
  };

  // 6. Add Customer / Supplier
  const handleAddCustomer = (c: Customer) => {
    setCustomers(prev => [...prev, c]);
    addNotification('নতুন কাস্টমার খাতা', `${c.name} এর বাকি খাতা খোলা হয়েছে।`, 'system');
  };

  const handleAddSupplier = (s: Supplier) => {
    setSuppliers(prev => [...prev, s]);
    addNotification('নতুন মহাজন যোগ', `${s.name} (${s.marketLocation}) সরবরাহকারী হিসেবে যুক্ত হয়েছেন।`, 'system');
  };

  // 7. Customer Payment (বাকি আদায়)
  const handleRecordCustomerPayment = (
    customerId: string, 
    amount: number, 
    method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক', 
    note?: string
  ) => {
    let customerName = 'কাস্টমার';
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        customerName = c.name;
        return {
          ...c,
          totalPaid: c.totalPaid + amount,
          currentDue: Math.max(0, c.currentDue - amount)
        };
      }
      return c;
    }));

    // Record transaction
    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      partyId: customerId,
      partyName: customerName,
      partyType: 'customer',
      type: 'in',
      amount,
      method,
      date: new Date().toISOString(),
      note: note || 'বাকি আদায় জমা'
    };
    setTransactions(prev => [newTx, ...prev]);

    addNotification(
      `বাকি আদায় জমা হয়েছে`,
      `${customerName} এর কাছ থেকে ${method} মাধ্যমে ৳${amount} পাওয়া গেছে।`,
      'due'
    );
  };

  // 8. Supplier Payment (মহাজন দেনা পরিশোধ)
  const handleRecordSupplierPayment = (
    supplierId: string, 
    amount: number, 
    method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক', 
    note?: string
  ) => {
    let supplierName = 'মহাজন';
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        supplierName = s.name;
        return {
          ...s,
          totalPaid: s.totalPaid + amount,
          currentPayable: Math.max(0, s.currentPayable - amount)
        };
      }
      return s;
    }));

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      partyId: supplierId,
      partyName: supplierName,
      partyType: 'supplier',
      type: 'out',
      amount,
      method,
      date: new Date().toISOString(),
      note: note || 'মহাজন দেনা পরিশোধ'
    };
    setTransactions(prev => [newTx, ...prev]);

    addNotification(
      `মহাজন দেনা পরিশোধ`,
      `${supplierName} কে ${method} মাধ্যমে ৳${amount} পরিশোধ করা হয়েছে।`,
      'system'
    );
  };

  // 9. Invoice QR Code Payment Collection
  const handleUpdateSalePayment = (
    invoiceNo: string,
    amount: number,
    method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক'
  ) => {
    let customerId = '';
    let customerName = '';

    setSales(prev => prev.map(sale => {
      if (sale.invoiceNo.toLowerCase() === invoiceNo.toLowerCase()) {
        customerId = sale.customerId;
        customerName = sale.customerName;
        const newPaid = sale.paidAmount + amount;
        const newDue = Math.max(0, sale.dueAmount - amount);
        return {
          ...sale,
          paidAmount: newPaid,
          dueAmount: newDue
        };
      }
      return sale;
    }));

    // If this customer exists in Khata, reduce customer's overall due
    if (customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            totalPaid: c.totalPaid + amount,
            currentDue: Math.max(0, c.currentDue - amount)
          };
        }
        return c;
      }));
    }

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      partyId: customerId || 'general',
      partyName: customerName || 'সাধারণ ক্রেতা',
      partyType: 'customer',
      type: 'in',
      amount,
      method,
      date: new Date().toISOString(),
      note: `মেমো #${invoiceNo} কিউআর স্ক্যান বাকি পরিশোধ`
    };
    setTransactions(prev => [newTx, ...prev]);

    addNotification(
      `কিউআর মেমো পেমেন্ট সম্পন্ন`,
      `মেমো #${invoiceNo} (${customerName}) এর ৳${amount} ${method} পরিশোধ হিসেবে সফলভাবে জমা হয়েছে।`,
      'due'
    );
  };

  // 9. Add Expense
  const handleAddExpense = (exp: BusinessExpense) => {
    setExpenses(prev => [exp, ...prev]);
    addNotification(
      `দোকান খরচ এন্ট্রি`,
      `${exp.title} (${exp.category}) বাবদ ৳${exp.amount} খরচ যোগ হয়েছে।`,
      'system'
    );
  };

  // 10. Update Market Rate
  const handleUpdateMarketRate = (rate: MarketRate) => {
    setMarketRates(prev => prev.map(r => r.itemId === rate.itemId ? rate : r));
    // Also update wholesale and retail price in items
    setItems(prev => prev.map(i => {
      if (i.id === rate.itemId) {
        return {
          ...i,
          currentWholesalePricePerKg: rate.todayWholesaleKg,
          currentRetailPricePerKg: rate.todayRetailKg
        };
      }
      return i;
    }));

    addNotification(
      `বাজার দর পরিবর্তন`,
      `${rate.itemName} এর আজকের পাইকারি দর ৳${rate.todayWholesaleKg}/কেজি নির্ধারণ করা হয়েছে।`,
      'system'
    );
  };

  // 11. Notifications handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // 12. Backup / Restore / Reset
  const allAppData = createFullBackupData({
    profile,
    items,
    sales,
    purchases,
    customers,
    suppliers,
    expenses,
    spoilages,
    marketRates
  });

  // Backup Alert Periodic Reminder State
  const [backupAlertStatus, setBackupAlertStatus] = useState<BackupAlertStatus>(() => checkBackupAlertStatus());

  const refreshBackupAlert = useCallback(() => {
    const status = checkBackupAlertStatus();
    setBackupAlertStatus(status);
    return status;
  }, []);

  // Periodic check (every 10 minutes and on mount)
  useEffect(() => {
    refreshBackupAlert();
    const intervalId = setInterval(() => {
      refreshBackupAlert();
    }, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [refreshBackupAlert]);

  // When backup alert is active, check and dispatch an in-app notification if not sent recently
  useEffect(() => {
    if (backupAlertStatus.isAlertActive) {
      const recentBackupNotif = notifications.some(
        n => n.type === 'backup' && n.date && (Date.now() - new Date(n.date).getTime() < 48 * 60 * 60 * 1000)
      );
      if (!recentBackupNotif) {
        addNotification(
          backupAlertStatus.severity === 'critical'
            ? 'জরুরি ব্যাকআপ সতর্কতা'
            : 'সাপ্তাহিক ব্যাকআপ রিমাইন্ডার',
          backupAlertStatus.reason === 'overdue_no_sync'
            ? 'গত ৭ দিনে কোনো ব্যাকআপ নেওয়া হয়নি এবং সিঙ্ক অনুপস্থিত। অফলাইন ব্যাকআপ ফাইল সংরক্ষণ করুন।'
            : 'আপনার ব্যবসার হিসাব সুরক্ষিত রাখতে একটি অফলাইন ব্যাকআপ ফাইল ডাউনলোড করে রাখুন।',
          'backup'
        );
      }
    }
  }, [backupAlertStatus.isAlertActive]);

  const handleDownloadManualBackup = () => {
    downloadJsonBackup(allAppData);
    recordManualBackup();
    refreshBackupAlert();
    addNotification(
      'ম্যানুয়াল ব্যাকআপ সফল হয়েছে',
      'আপনার ডিভাইসে সম্পূর্ণ ডাটার ব্যাকআপ ফাইল ডাউনলোড হয়েছে। পরবর্তী রিমাইন্ডার ১ সপ্তাহ পর দেওয়া হবে।',
      'backup'
    );
  };

  const handleSnoozeBackupAlert = (days: number = 2) => {
    snoozeBackupAlert(days);
    refreshBackupAlert();
    addNotification(
      'সতর্কতা স্থগিত করা হয়েছে',
      `${toBengaliNumber(days)} দিনের জন্য ব্যাকআপ রিমাইন্ডার স্থগিত রাখা হয়েছে।`,
      'system'
    );
  };

  const handleRestoreData = (restored: any) => {
    if (restored.profile) setProfile(restored.profile);
    if (restored.items) setItems(restored.items);
    if (restored.sales) setSales(restored.sales);
    if (restored.purchases) setPurchases(restored.purchases);
    if (restored.customers) setCustomers(restored.customers);
    if (restored.suppliers) setSuppliers(restored.suppliers);
    if (restored.expenses) setExpenses(restored.expenses);
    if (restored.spoilages) setSpoilages(restored.spoilages);
    if (restored.marketRates) setMarketRates(restored.marketRates);
  };

  const handleResetData = () => {
    setProfile(initialBusinessProfile);
    setItems(initialVegetables);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setExpenses(initialExpenses);
    setSpoilages(initialSpoilage);
    setMarketRates(initialMarketRates);
    setNotifications(initialNotifications);
    setTransactions([]);
  };

  const handleClearDemoData = (clearItemsToo: boolean = false) => {
    // 1. Clear all transactions, invoices, debts, dues, and expenses
    setSales([]);
    setPurchases([]);
    setCustomers([]);
    setSuppliers([]);
    setExpenses([]);
    setSpoilages([]);
    setTransactions([]);

    // 2. Vegetable items stock management
    if (clearItemsToo) {
      setItems([]);
    } else {
      // Keep item names catalog, but reset stock quantities and prices to 0
      setItems(prevItems => prevItems.map(item => ({
        ...item,
        currentStockKg: 0,
        avgPurchasePricePerKg: 0,
        currentWholesalePricePerKg: 0,
        currentRetailPricePerKg: 0
      })));
    }

    setNotifications([
      {
        id: `notif-clean-${Date.now()}`,
        title: 'ফ্রেশ খাতা প্রস্তুত',
        message: 'সমস্ত ডেমো কেনাবেচা, খরচ ও বাকি খাতা সফলভাবে মুছে ফেলা হয়েছে। এখন আপনি আপনার নিজস্ব হিসাব শুরু করতে পারেন।',
        type: 'system',
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        read: false
      }
    ]);

    // 3. Force push cleared states to cloud
    if (!isRemoteUpdating.current) {
      pushToCloud({
        sales: [],
        purchases: [],
        customers: [],
        suppliers: [],
        expenses: [],
        spoilages: [],
        transactions: []
      });
    }
  };

  const handleManualSync = async () => {
    try {
      const cloudData = await forceFetchFromCloud();
      if (cloudData) {
        isRemoteUpdating.current = true;
        if (cloudData.profile) setProfile(cloudData.profile);
        if (cloudData.items) setItems(cloudData.items);
        if (cloudData.sales) setSales(cloudData.sales);
        if (cloudData.purchases) setPurchases(cloudData.purchases);
        if (cloudData.customers) setCustomers(cloudData.customers);
        if (cloudData.suppliers) setSuppliers(cloudData.suppliers);
        if (cloudData.expenses) setExpenses(cloudData.expenses);
        if (cloudData.spoilages) setSpoilages(cloudData.spoilages);
        if (cloudData.marketRates) setMarketRates(cloudData.marketRates);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        if (cloudData.transactions) setTransactions(cloudData.transactions);
        setTimeout(() => {
          isRemoteUpdating.current = false;
        }, 600);
        addNotification('সিঙ্ক সম্পন্ন', 'ক্লাউড থেকে সর্বশেষ ডাটা সফলভাবে ডাউনলোড হয়েছে।', 'system');
      } else {
        pushToCloud({
          profile,
          items,
          sales,
          purchases,
          customers,
          suppliers,
          expenses,
          spoilages,
          marketRates,
          notifications,
          transactions
        });
        addNotification('সিঙ্ক সম্পন্ন', 'বর্তমান ডিভাইসের ডাটা ক্লাউডে সুরক্ষিত করা হয়েছে।', 'system');
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
      addNotification('সিঙ্ক ব্যর্থ', 'ক্লাউডের সাথে সংযোগ স্থাপন করা যায়নি।', 'alert');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-150">
      
      {/* Top Main Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearNotifications={handleClearNotifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOnline={isOnline}
        onOpenSettings={() => setShowSettings(true)}
        onOpenQrScanner={() => setShowQrScanner(true)}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-16">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            items={items}
            sales={sales}
            purchases={purchases}
            customers={customers}
            suppliers={suppliers}
            expenses={expenses}
            spoilages={spoilages}
            marketRates={marketRates}
            onNavigate={(tab) => setActiveTab(tab)}
            onViewInvoice={(sale) => setSelectedInvoice(sale)}
            onOpenQrScanner={() => setShowQrScanner(true)}
            backupAlertStatus={backupAlertStatus}
            onDownloadBackup={handleDownloadManualBackup}
            onSnoozeBackupAlert={handleSnoozeBackupAlert}
            onManualSync={handleManualSync}
            profile={profile}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesManager
            sales={sales}
            items={items}
            customers={customers}
            onAddSale={handleAddSale}
            onViewInvoice={(sale) => setSelectedInvoice(sale)}
            onAddCustomer={handleAddCustomer}
            onOpenQrScanner={() => setShowQrScanner(true)}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchaseManager
            purchases={purchases}
            items={items}
            suppliers={suppliers}
            onAddPurchase={handleAddPurchase}
            onAddSupplier={handleAddSupplier}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            items={items}
            spoilages={spoilages}
            onAddItem={handleAddItem}
            onUpdateStock={handleUpdateStock}
            onAddSpoilage={handleAddSpoilage}
          />
        )}

        {activeTab === 'parties' && (
          <CustomersSuppliers
            customers={customers}
            suppliers={suppliers}
            onAddCustomer={handleAddCustomer}
            onAddSupplier={handleAddSupplier}
            onRecordCustomerPayment={handleRecordCustomerPayment}
            onRecordSupplierPayment={handleRecordSupplierPayment}
          />
        )}

        {activeTab === 'reports' && (
          <ProfitLossReport
            sales={sales}
            expenses={expenses}
            spoilages={spoilages}
            items={items}
            profile={profile}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === 'rates' && (
          <MarketRateTab
            marketRates={marketRates}
            onUpdateMarketRate={handleUpdateMarketRate}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentTracker
            transactions={transactions}
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            customers={customers}
            suppliers={suppliers}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 py-3 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {profile.businessName} • {profile.address} • স্বত্বাধিকারী: {profile.proprietor || profile.proprietorName}
          </span>
          <span className="text-[11px] text-stone-400">
            কাঁচামাল ও সবজি আড়ত হিসাব খাতা v1.0 • অফলাইন ও মোবাইল বান্ধব
          </span>
        </div>
      </footer>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          sale={selectedInvoice}
          profile={profile}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* QR Code Scanner & Verification Modal */}
      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        sales={sales}
        customers={customers}
        onViewInvoice={(sale) => {
          setShowQrScanner(false);
          setSelectedInvoice(sale);
        }}
        onUpdateSalePayment={handleUpdateSalePayment}
      />

      {/* Settings & Profile Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          profile={profile}
          onUpdateProfile={setProfile}
          onRestoreData={handleRestoreData}
          onResetData={handleResetData}
          onClearDemoData={handleClearDemoData}
          allAppData={allAppData}
          syncStatus={syncStatus}
          onManualSync={handleManualSync}
          backupAlertStatus={backupAlertStatus}
          onDownloadBackup={handleDownloadManualBackup}
          onRefreshBackupStatus={refreshBackupAlert}
        />
      )}

    </div>
  );
};

export default App;
