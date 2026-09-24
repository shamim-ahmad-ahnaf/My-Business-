import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  Download, 
  ShoppingCart, 
  UserPlus, 
  CheckCircle2,
  Calendar,
  AlertCircle,
  QrCode,
  Calculator,
  X,
  Tag
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { VoiceSearchButton } from './VoiceSearchButton';
import { 
  VegetableItem, 
  SaleRecord, 
  SaleItem, 
  Customer, 
  UnitType 
} from '../types';
import { 
  formatTaka, 
  formatBanglaDate, 
  toBengaliNumber, 
  toEnglishNumber,
  convertToKg 
} from '../utils/formatters';
import { exportSalesToCsv } from '../utils/storage';

interface SalesManagerProps {
  sales: SaleRecord[];
  items: VegetableItem[];
  customers: Customer[];
  onAddSale: (sale: SaleRecord) => void;
  onViewInvoice: (sale: SaleRecord) => void;
  onAddCustomer: (customer: Customer) => void;
  onOpenQrScanner?: () => void;
}

export const SalesManager: React.FC<SalesManagerProps> = ({
  sales,
  items,
  customers,
  onAddSale,
  onViewInvoice,
  onAddCustomer,
  onOpenQrScanner
}) => {
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Form State for New Sale
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerName, setCustomerName] = useState<string>(customers[0]?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(customers[0]?.phone || '');
  const [isQuickCustomer, setIsQuickCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [saleType, setSaleType] = useState<'wholesale' | 'retail'>('wholesale');
  const [currentLineItems, setCurrentLineItems] = useState<SaleItem[]>([
    {
      itemId: items[0]?.id || '',
      itemName: items[0]?.nameBn || '',
      quantity: 1,
      unit: items[0]?.defaultUnit || 'কেজি',
      quantityInKg: convertToKg(1, items[0]?.defaultUnit || 'কেজি'),
      unitPrice: items[0]?.currentWholesalePricePerKg || 30,
      totalPrice: items[0]?.currentWholesalePricePerKg || 30,
      costPricePerKg: items[0]?.avgPurchasePricePerKg || 25,
    }
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [labourCost, setLabourCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক' | 'বাকি'>('নগদ');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Handle line item change
  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(i => i.id === itemId);
    if (!selected) return;

    const updated = [...currentLineItems];
    const unitPrice = saleType === 'wholesale' ? selected.currentWholesalePricePerKg : selected.currentRetailPricePerKg;
    const qtyInKg = convertToKg(updated[index].quantity, updated[index].unit);

    updated[index] = {
      ...updated[index],
      itemId: selected.id,
      itemName: selected.nameBn,
      unit: selected.defaultUnit,
      unitPrice: unitPrice,
      costPricePerKg: selected.avgPurchasePricePerKg,
      quantityInKg: qtyInKg,
      totalPrice: Math.round(qtyInKg * unitPrice)
    };
    setCurrentLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...currentLineItems];
    const item = updated[index];
    const qtyInKg = convertToKg(qty, item.unit);
    updated[index] = {
      ...item,
      quantity: qty,
      quantityInKg: qtyInKg,
      totalPrice: Math.round(qtyInKg * item.unitPrice)
    };
    setCurrentLineItems(updated);
  };

  const handleUnitChange = (index: number, unit: UnitType) => {
    const updated = [...currentLineItems];
    const item = updated[index];
    const qtyInKg = convertToKg(item.quantity, unit);
    updated[index] = {
      ...item,
      unit: unit,
      quantityInKg: qtyInKg,
      totalPrice: Math.round(qtyInKg * item.unitPrice)
    };
    setCurrentLineItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...currentLineItems];
    const item = updated[index];
    updated[index] = {
      ...item,
      unitPrice: price,
      totalPrice: Math.round(item.quantityInKg * price)
    };
    setCurrentLineItems(updated);
  };

  const addLineItem = () => {
    const defaultItem = items[0];
    if (!defaultItem) return;
    const price = saleType === 'wholesale' ? defaultItem.currentWholesalePricePerKg : defaultItem.currentRetailPricePerKg;
    const qtyInKg = convertToKg(1, defaultItem.defaultUnit);
    setCurrentLineItems([
      ...currentLineItems,
      {
        itemId: defaultItem.id,
        itemName: defaultItem.nameBn,
        quantity: 1,
        unit: defaultItem.defaultUnit,
        quantityInKg: qtyInKg,
        unitPrice: price,
        totalPrice: Math.round(qtyInKg * price),
        costPricePerKg: defaultItem.avgPurchasePricePerKg,
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (currentLineItems.length <= 1) return;
    setCurrentLineItems(currentLineItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = currentLineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const grandTotal = Math.max(0, subtotal - discount + labourCost);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Sync paidAmount when grandTotal changes if it was fully paid
  const handleFullPay = () => {
    setPaidAmount(grandTotal);
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const c = customers.find(cust => cust.id === id);
    if (c) {
      setCustomerName(c.name);
      setCustomerPhone(c.phone);
    }
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (currentLineItems.length === 0) {
      setValidationError('কমপক্ষে একটি পণ্য যোগ করুন');
      return;
    }

    // Check stock availability
    for (const line of currentLineItems) {
      const stockItem = items.find(i => i.id === line.itemId);
      if (stockItem && line.quantityInKg > stockItem.currentStockKg) {
        setValidationError(`সতর্কতা: "${line.itemName}" এর পর্যাপ্ত মজুদ নেই! বর্তমানে আছে ${stockItem.currentStockKg} কেজি, বিক্রি করতে চাচ্ছেন ${line.quantityInKg} কেজি।`);
        return;
      }
    }

    let finalCustomerId = customerId;
    let finalCustName = customerName;
    let finalCustPhone = customerPhone;

    if (isQuickCustomer) {
      if (!newCustName.trim()) {
        setValidationError('নতুন কাস্টমারের নাম লিখুন');
        return;
      }
      finalCustomerId = `cust-${Date.now()}`;
      finalCustName = newCustName.trim();
      finalCustPhone = newCustPhone.trim();

      const newCustomerObj: Customer = {
        id: finalCustomerId,
        name: finalCustName,
        phone: finalCustPhone,
        address: newCustAddress.trim() || 'স্থানীয়',
        totalPurchases: grandTotal,
        totalPaid: paidAmount,
        currentDue: dueAmount,
        createdAt: new Date().toISOString(),
      };
      onAddCustomer(newCustomerObj);
    }

    const nextInvoiceNumber = `ইনভ-${toBengaliNumber(new Date().getFullYear())}-${toBengaliNumber(1000 + sales.length + 1)}`;

    const newSaleRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      invoiceNo: nextInvoiceNumber,
      customerId: finalCustomerId,
      customerName: finalCustName,
      customerPhone: finalCustPhone,
      items: currentLineItems,
      subtotal,
      discount,
      labourCost,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod,
      date: new Date().toISOString(),
      notes
    };

    onAddSale(newSaleRecord);
    setShowNewSaleModal(false);
    onViewInvoice(newSaleRecord); // Automatically show invoice for instant printing!

    // Reset Form
    setIsQuickCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
    setDiscount(0);
    setLabourCost(0);
    setPaidAmount(0);
    setNotes('');
  };

  // Filter Sales by customer name, invoice number, customer phone, or product name
  const filteredSales = sales.filter(sale => {
    const rawTerm = searchTerm.trim().toLowerCase();
    if (rawTerm) {
      const enTerm = toEnglishNumber(rawTerm);
      const enInvoice = toEnglishNumber(sale.invoiceNo.toLowerCase());

      const matchesCustomer = sale.customerName.toLowerCase().includes(rawTerm);
      const matchesInvoice = 
        sale.invoiceNo.toLowerCase().includes(rawTerm) ||
        enInvoice.includes(enTerm);
      const matchesPhone = Boolean(sale.customerPhone && sale.customerPhone.includes(rawTerm));

      // Check if any product / item in this sale matches the search term
      const matchesProduct = Boolean(
        sale.items && sale.items.some(item => 
          item.itemName.toLowerCase().includes(rawTerm)
        )
      );

      if (!matchesCustomer && !matchesInvoice && !matchesPhone && !matchesProduct) {
        return false;
      }
    }

    if (dateFilter === 'today') {
      return sale.date.slice(0, 10) === new Date().toISOString().slice(0, 10);
    } else if (dateFilter === 'week') {
      const pastWeek = new Date();
      pastWeek.setDate(pastWeek.getDate() - 7);
      return new Date(sale.date) >= pastWeek;
    } else if (dateFilter === 'month') {
      const pastMonth = new Date();
      pastMonth.setDate(pastMonth.getDate() - 30);
      return new Date(sale.date) >= pastMonth;
    }
    return true;
  });

  const totalFilteredSalesAmount = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalFilteredPaidAmount = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalFilteredDueAmount = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>কাঁচামাল বিক্রয় ও ক্যাশ মেমো</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            প্রতিদিনের সবজি কেনাবেচা হিসাব রাখুন এবং অটোমেটিক প্রিন্ট উপযোগী মেমো তৈরি করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs"
              title="ক্যামেরা দিয়ে মেমো কিউআর স্ক্যান করুন"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>মেমো কিউআর স্ক্যান</span>
            </button>
          )}

          <button
            onClick={() => exportSalesToCsv(sales)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>এক্সেল/CSV ডাউনলোড</span>
          </button>

          <button
            onClick={() => {
              setShowNewSaleModal(true);
              setValidationError('');
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিক্রি মেমো</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="ক্রেতার নাম, ইনভয়েস নম্বর (যেমন: ১০০১) বা পণ্যের নাম (যেমন: আলু, পেঁয়াজ) দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-24 py-2 text-xs sm:text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:border-emerald-500 dark:text-stone-100 transition-colors"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  title="সার্চ মুছুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <VoiceSearchButton
                onTranscript={(text) => setSearchTerm(text)}
                placeholderHint="ক্রেতার নাম বা মেমো নম্বর বলুন..."
                size="sm"
              />
              {onOpenQrScanner && (
                <button
                  onClick={onOpenQrScanner}
                  type="button"
                  className="p-1 text-stone-400 hover:text-emerald-600 transition-colors"
                  title="ক্যামেরা দিয়ে মেমো খুঁজুন"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'today', 'week', 'month'] as const).map((filter) => {
              const labels = { all: 'সব বিক্রি', today: 'আজকের', week: 'বিগত ৭ দিন', month: 'এই মাস' };
              return (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    dateFilter === filter
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Product Search Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500 mr-0.5">
            <Tag className="w-3 h-3" />
            দ্রুত পণ্য ফিল্টার:
          </span>
          {['আলু', 'পেঁয়াজ', 'রসুন', 'টমেটো', 'কাঁচামরিচ', 'বেগুন', 'আদা'].map((veg) => (
            <button
              key={veg}
              type="button"
              onClick={() => setSearchTerm(veg)}
              className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                searchTerm.toLowerCase() === veg.toLowerCase()
                  ? 'bg-emerald-600 text-white font-medium shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600'
              }`}
            >
              {veg}
            </button>
          ))}
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-2 py-0.5 text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium ml-auto flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              ফিল্টার বাতিল
            </button>
          )}
        </div>

        {/* Search Results Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              পাওয়া গেছে: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{toBengaliNumber(filteredSales.length)}</strong> টি মেমো
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
                কীওয়ার্ড: &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 text-[11px] sm:text-xs">
            <span>মোট বিক্রি: <strong className="text-stone-800 dark:text-stone-200">{formatTaka(totalFilteredSalesAmount)}</strong></span>
            <span>জমা: <strong className="text-emerald-600 dark:text-emerald-400">{formatTaka(totalFilteredPaidAmount)}</strong></span>
            {totalFilteredDueAmount > 0 && (
              <span>বাকি: <strong className="text-rose-600 dark:text-rose-400">{formatTaka(totalFilteredDueAmount)}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Sales Records Table & Mobile Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-3">মেমো নং</th>
                <th className="py-3 px-3">তারিখ ও সময়</th>
                <th className="py-3 px-3">ক্রেতার তথ্য</th>
                <th className="py-3 px-3">সবজি আইটেম</th>
                <th className="py-3 px-3 text-right">মোট টাকা</th>
                <th className="py-3 px-3 text-right">জমা</th>
                <th className="py-3 px-3 text-right">বাকি</th>
                <th className="py-3 px-3 text-center">মাধ্যম</th>
                <th className="py-3 px-3 text-center">মেমো</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-stone-800 dark:text-stone-200">
                    {sale.invoiceNo}
                  </td>
                  <td className="py-3 px-3 text-stone-600 dark:text-stone-400 text-xs">
                    {formatBanglaDate(sale.date, true)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{sale.customerName}</div>
                    {sale.customerPhone && (
                      <div className="text-[11px] text-stone-400">{sale.customerPhone}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-stone-700 dark:text-stone-300 text-xs max-w-[240px]">
                    <div className="flex flex-wrap gap-1">
                      {sale.items.map((i, idx) => {
                        const isMatched = searchTerm.trim() && i.itemName.toLowerCase().includes(searchTerm.trim().toLowerCase());
                        return (
                          <span 
                            key={idx} 
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                              isMatched 
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500' 
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {i.itemName} ({toBengaliNumber(i.quantity)} {i.unit})
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                    {formatTaka(sale.grandTotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatTaka(sale.paidAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">
                    {sale.dueAmount > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">{formatTaka(sale.dueAmount)}</span>
                    ) : (
                      <span className="text-stone-400">০</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      title="ইনভয়েস দেখুন বা প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                        {searchTerm
                          ? `"${searchTerm}" সম্পর্কিত কোনো বিক্রয় মেমো খুঁজে পাওয়া যায়নি`
                          : 'কোনো বিক্রয় রেকর্ড খুঁজে পাওয়া যায়নি'}
                      </p>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="px-3 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          সার্চ ফিল্টার রিসেট করুন
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards View (Layout B) */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    #{sale.invoiceNo}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {sale.paymentMethod}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {formatBanglaDate(sale.date, true)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 mt-1">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    {sale.customerName}
                  </h4>
                  {sale.customerPhone && (
                    <a 
                      href={`tel:${sale.customerPhone}`}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-600 mt-0.5"
                    >
                      <span>📞 {sale.customerPhone}</span>
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {formatTaka(sale.grandTotal)}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    জমা: {formatTaka(sale.paidAmount)}
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-stone-600 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-lg">
                <span className="font-medium text-stone-500 block mb-1">বিক্রিত পণ্য:</span>
                <div className="flex flex-wrap gap-1">
                  {sale.items.map((i, idx) => {
                    const isMatched = searchTerm.trim() && i.itemName.toLowerCase().includes(searchTerm.trim().toLowerCase());
                    return (
                      <span
                        key={idx}
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          isMatched
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500'
                            : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {i.itemName} ({toBengaliNumber(i.quantity)} {i.unit})
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Due and Invoice Button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div>
                  {sale.dueAmount > 0 ? (
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1">
                      <span>বাকি: {formatTaka(sale.dueAmount)}</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                      ✓ সম্পূর্ণ পরিশোধ
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onViewInvoice(sale)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>মেমো দেখুন</span>
                </button>
              </div>
            </div>
          ))}

          {filteredSales.length === 0 && (
            <div className="py-12 text-center text-xs text-stone-400 px-4">
              <Search className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
                {searchTerm
                  ? `"${searchTerm}" সম্পর্কিত কোনো মেমো খুঁজে পাওয়া যায়নি`
                  : 'কোনো বিক্রয় রেকর্ড খুঁজে পাওয়া যায়নি'}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-2.5 px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  সার্চ ফিল্টার রিসেট করুন
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Sale Modal (POS / Billing form) */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full sm:max-w-3xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-emerald-700 text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-lg">নতুন বিক্রয় চালান ও ইনভয়েস তৈরি</h3>
              </div>
              <button
                onClick={() => setShowNewSaleModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-800 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSale} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                
                {/* Error Banner */}
                {validationError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Mode & Customer Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-stone-50 dark:bg-stone-800/40 p-3 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  {/* Sale Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      বিক্রির ধরণ
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSaleType('wholesale')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          saleType === 'wholesale'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        পাইকারি দর
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleType('retail')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          saleType === 'retail'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        খুচরা দর
                      </button>
                    </div>
                  </div>

                  {/* Customer Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        ক্রেতা / কাস্টমার
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsQuickCustomer(!isQuickCustomer)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{isQuickCustomer ? 'তালিকা থেকে নিন' : '+ নতুন ক্রেতা'}</span>
                      </button>
                    </div>

                    {!isQuickCustomer ? (
                      <select
                        value={customerId}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.currentDue > 0 ? `(পূর্বের বাকি ৳${c.currentDue})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="ক্রেতার নাম..."
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="মোবাইল নম্বর (ঐচ্ছিক)..."
                          value={newCustPhone}
                          onChange={(e) => setNewCustPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                      বিক্রয়কৃত সবজির তালিকা
                    </h4>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>সবজি যোগ করুন</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {currentLineItems.map((line, idx) => (
                      <div key={idx} className="rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-2.5 sm:p-2">
                        
                        {/* Mobile View: Two-tier comfortable inputs */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelect(idx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.nameBn} (মজুদ: {i.currentStockKg} কেজি)
                                </option>
                              ))}
                            </select>
                            {currentLineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 rounded-lg shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 text-xs items-end">
                            <div className="col-span-5">
                              <span className="text-[10px] text-stone-500 block mb-0.5">পরিমাণ</span>
                              <CalcInput
                                value={line.quantity || 0}
                                onChange={(val) => handleQuantityChange(idx, val)}
                                unitPresets="weight"
                                suffix={line.unit}
                                calcTitle={`${line.itemName || 'আইটেম'} - পরিমাণ হিসাব`}
                                align="center"
                                inputClassName="font-bold py-1.5"
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <span className="text-[10px] text-stone-500 block mb-0.5">একক</span>
                              <select
                                value={line.unit}
                                onChange={(e) => handleUnitChange(idx, e.target.value as UnitType)}
                                className="w-full px-1 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs h-[34px]"
                              >
                                <option value="কেজি">কেজি</option>
                                <option value="পাল্লা">পাল্লা</option>
                                <option value="মণ">মণ</option>
                                <option value="বস্তা">বস্তা</option>
                                <option value="খাঁচা">খাঁচা</option>
                                <option value="পিস">পিস</option>
                              </select>
                            </div>
                            <div className="col-span-4">
                              <span className="text-[10px] text-stone-500 block mb-0.5">দর/কেজি</span>
                              <CalcInput
                                value={line.unitPrice || 0}
                                onChange={(val) => handlePriceChange(idx, val)}
                                unitPresets="money"
                                suffix="৳"
                                calcTitle={`${line.itemName || 'আইটেম'} - দর হিসাব`}
                                align="right"
                                inputClassName="font-bold py-1.5"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-xs">
                            <span className="text-stone-500 text-[11px]">আইটেম মোট:</span>
                            <span className="font-bold text-stone-900 dark:text-stone-100">{formatTaka(line.totalPrice)}</span>
                          </div>
                        </div>

                        {/* Desktop View: Grid */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center text-xs">
                          <div className="col-span-4">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemSelect(idx, e.target.value)}
                              className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.nameBn} (মজুদ: {i.currentStockKg} কেজি)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2">
                            <CalcInput
                              value={line.quantity || 0}
                              onChange={(val) => handleQuantityChange(idx, val)}
                              unitPresets="weight"
                              suffix={line.unit}
                              calcTitle={`${line.itemName || 'আইটেম'} - পরিমাণ`}
                              align="center"
                              inputClassName="font-bold py-1.5"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <select
                              value={line.unit}
                              onChange={(e) => handleUnitChange(idx, e.target.value as UnitType)}
                              className="w-full px-1.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs h-[34px]"
                            >
                              <option value="কেজি">কেজি</option>
                              <option value="পাল্লা">পাল্লা (৫ কেজি)</option>
                              <option value="মণ">মণ (৪০ কেজি)</option>
                              <option value="বস্তা">বস্তা (~৫০ কেজি)</option>
                              <option value="খাঁচা">খাঁচা (~২৫ কেজি)</option>
                              <option value="পিস">পিস</option>
                            </select>
                          </div>

                          <div className="col-span-2">
                            <CalcInput
                              value={line.unitPrice || 0}
                              onChange={(val) => handlePriceChange(idx, val)}
                              unitPresets="money"
                              suffix="৳"
                              calcTitle={`${line.itemName || 'আইটেম'} - দর`}
                              align="right"
                              inputClassName="font-medium py-1.5"
                              required
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-between gap-1">
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              {formatTaka(line.totalPrice)}
                            </span>
                            {currentLineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Calculation & Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-4">
                  
                  {/* Notes & Extra Costs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <CalcInput
                          label="কুলি/লেবার খরচ"
                          value={labourCost || 0}
                          onChange={setLabourCost}
                          unitPresets="money"
                          suffix="৳"
                          calcTitle="কুলি/লেবার খরচ হিসাব"
                          align="right"
                        />
                      </div>
                      <div>
                        <CalcInput
                          label="ছাড় (Discount)"
                          value={discount || 0}
                          onChange={setDiscount}
                          unitPresets="money"
                          suffix="৳"
                          calcTitle="ছাড় ও কমিশন হিসাব"
                          align="right"
                          inputClassName="text-emerald-600 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="যেমন: সকালে ডেলিভারি সম্পন্ন..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                      />
                    </div>
                  </div>

                  {/* Totals & Payment Box */}
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>উপমোট:</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{formatTaka(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-bold text-stone-950 dark:text-stone-50 border-t border-stone-300 dark:border-stone-700 pt-1.5">
                      <span>সর্বমোট টাকা:</span>
                      <span className="text-base text-emerald-600 dark:text-emerald-400">{formatTaka(grandTotal)}</span>
                    </div>

                    {/* Paid amount with Full Pay quick button */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-semibold text-stone-700 dark:text-stone-300">নগদ গ্রহণ (পরিশোধ):</label>
                        <button
                          type="button"
                          onClick={handleFullPay}
                          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
                        >
                          সম্পূর্ণ পরিশোধ
                        </button>
                      </div>
                      <CalcInput
                        value={paidAmount || 0}
                        onChange={setPaidAmount}
                        unitPresets="money"
                        suffix="৳"
                        calcTitle="নগদ গ্রহণ / পরিশোধ হিসাব"
                        align="right"
                        inputClassName="text-sm font-bold text-emerald-700 dark:text-emerald-400"
                        required
                      />
                    </div>

                    {/* Due preview */}
                    <div className={`flex justify-between font-bold pt-1 ${dueAmount > 0 ? 'text-rose-600' : 'text-stone-500'}`}>
                      <span>বকেয়া / বাকি থাকবে:</span>
                      <span>{formatTaka(dueAmount)}</span>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="pt-1">
                      <label className="block text-[11px] text-stone-500 mb-1">পেমেন্ট মাধ্যম</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-medium"
                      >
                        <option value="নগদ">নগদ ক্যাশ (Cash)</option>
                        <option value="বিকাশ">বিকাশ (bKash)</option>
                        <option value="নগদ-মোবাইল">নগদ (Nagad App)</option>
                        <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                        <option value="বাকি">সম্পূর্ণ বাকি</option>
                      </select>
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Sticky Footer Buttons */}
              <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>চালান সম্পন্ন ও মেমো তৈরি</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
