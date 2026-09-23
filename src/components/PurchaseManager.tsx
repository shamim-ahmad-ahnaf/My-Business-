import React, { useState } from 'react';
import { 
  Plus, 
  Truck, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  Search,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { 
  VegetableItem, 
  PurchaseRecord, 
  PurchaseItem, 
  Supplier, 
  UnitType 
} from '../types';
import { 
  formatTaka, 
  formatBanglaDate, 
  toBengaliNumber, 
  convertToKg,
  formatWeight 
} from '../utils/formatters';

interface PurchaseManagerProps {
  purchases: PurchaseRecord[];
  items: VegetableItem[];
  suppliers: Supplier[];
  onAddPurchase: (purchase: PurchaseRecord) => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export const PurchaseManager: React.FC<PurchaseManagerProps> = ({
  purchases,
  items,
  suppliers,
  onAddPurchase,
  onAddSupplier
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierName, setSupplierName] = useState<string>(suppliers[0]?.name || '');
  const [supplierPhone, setSupplierPhone] = useState<string>(suppliers[0]?.phone || '');
  const [isQuickSupplier, setIsQuickSupplier] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');
  const [newSuppLocation, setNewSuppLocation] = useState('');

  const [chalanNo, setChalanNo] = useState('');
  const [currentLineItems, setCurrentLineItems] = useState<PurchaseItem[]>([
    {
      itemId: items[0]?.id || '',
      itemName: items[0]?.nameBn || '',
      quantity: 10,
      unit: items[0]?.defaultUnit || 'বস্তা',
      quantityInKg: convertToKg(10, items[0]?.defaultUnit || 'বস্তা'),
      unitPrice: items[0]?.avgPurchasePricePerKg || 25,
      totalPrice: (items[0]?.avgPurchasePricePerKg || 25) * convertToKg(10, items[0]?.defaultUnit || 'বস্তা'),
    }
  ]);

  const [transportCost, setTransportCost] = useState<number>(0);
  const [labourCost, setLabourCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'নগদ' | 'বিকাশ' | 'ব্যাংক' | 'বাকি'>('ব্যাংক');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSupplierSelect = (id: string) => {
    setSupplierId(id);
    const s = suppliers.find(sup => sup.id === id);
    if (s) {
      setSupplierName(s.name);
      setSupplierPhone(s.phone);
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(i => i.id === itemId);
    if (!selected) return;

    const updated = [...currentLineItems];
    const qtyInKg = convertToKg(updated[index].quantity, selected.defaultUnit);
    updated[index] = {
      ...updated[index],
      itemId: selected.id,
      itemName: selected.nameBn,
      unit: selected.defaultUnit,
      unitPrice: selected.avgPurchasePricePerKg,
      quantityInKg: qtyInKg,
      totalPrice: Math.round(qtyInKg * selected.avgPurchasePricePerKg)
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
    const qtyInKg = convertToKg(10, defaultItem.defaultUnit);
    setCurrentLineItems([
      ...currentLineItems,
      {
        itemId: defaultItem.id,
        itemName: defaultItem.nameBn,
        quantity: 10,
        unit: defaultItem.defaultUnit,
        quantityInKg: qtyInKg,
        unitPrice: defaultItem.avgPurchasePricePerKg,
        totalPrice: Math.round(qtyInKg * defaultItem.avgPurchasePricePerKg),
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (currentLineItems.length <= 1) return;
    setCurrentLineItems(currentLineItems.filter((_, i) => i !== index));
  };

  const itemsSubtotal = currentLineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const grandTotal = itemsSubtotal + transportCost + labourCost;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentLineItems.length === 0) {
      setError('কমপক্ষে একটি পণ্য যোগ করুন');
      return;
    }

    let finalSuppId = supplierId;
    let finalSuppName = supplierName;
    let finalSuppPhone = supplierPhone;

    if (isQuickSupplier) {
      if (!newSuppName.trim()) {
        setError('মহাজন/সাপ্লায়ারের নাম লিখুন');
        return;
      }
      finalSuppId = `supp-${Date.now()}`;
      finalSuppName = newSuppName.trim();
      finalSuppPhone = newSuppPhone.trim();

      const newSupplierObj: Supplier = {
        id: finalSuppId,
        name: finalSuppName,
        phone: finalSuppPhone,
        marketLocation: newSuppLocation.trim() || 'স্থানীয় মোকাম',
        totalPurchases: grandTotal,
        totalPaid: paidAmount,
        currentPayable: dueAmount,
        createdAt: new Date().toISOString(),
      };
      onAddSupplier(newSupplierObj);
    }

    const newPurchase: PurchaseRecord = {
      id: `purch-${Date.now()}`,
      chalanNo: chalanNo.trim() || `চালান-${toBengaliNumber(purchases.length + 1)}`,
      supplierId: finalSuppId,
      supplierName: finalSuppName,
      supplierPhone: finalSuppPhone,
      items: currentLineItems,
      transportCost,
      labourCost,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod,
      date: new Date().toISOString(),
      notes
    };

    onAddPurchase(newPurchase);
    setShowModal(false);

    // Reset Form
    setIsQuickSupplier(false);
    setNewSuppName('');
    setNewSuppPhone('');
    setChalanNo('');
    setTransportCost(0);
    setLabourCost(0);
    setPaidAmount(0);
    setNotes('');
  };

  const filteredPurchases = purchases.filter(p => 
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.chalanNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>সবজি চালান ক্রয় ও মহাজনি হিসাব</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            কৃষক ও বিভিন্ন মোকাম/আড়ত থেকে আগত নতুন চালান এন্ট্রি করুন। স্টক স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setError('');
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন চালান এন্ট্রি</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="চালান নং বা মহাজনের নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden dark:text-stone-100"
          />
        </div>
      </div>

      {/* Purchases Table & Mobile Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-3">চালান নং</th>
                <th className="py-3 px-3">তারিখ</th>
                <th className="py-3 px-3">মহাজন / মোকাম</th>
                <th className="py-3 px-3">মালামালের বিবরণ</th>
                <th className="py-3 px-3 text-right">গাড়ি ও লেবার</th>
                <th className="py-3 px-3 text-right">মোট টাকা</th>
                <th className="py-3 px-3 text-right">পরিশোধ</th>
                <th className="py-3 px-3 text-right">মহাজন দেনা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-stone-800 dark:text-stone-200">
                    {p.chalanNo}
                  </td>
                  <td className="py-3 px-3 text-stone-600 dark:text-stone-400 text-xs">
                    {formatBanglaDate(p.date, true)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{p.supplierName}</div>
                    {p.supplierPhone && (
                      <div className="text-[11px] text-stone-400">{p.supplierPhone}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-stone-700 dark:text-stone-300 text-xs">
                    <div>
                      {p.items.map(i => `${i.itemName} (${toBengaliNumber(i.quantity)} ${i.unit})`).join(', ')}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      মোট ওজন: {formatWeight(p.items.reduce((acc, i) => acc + i.quantityInKg, 0))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-stone-600 dark:text-stone-400">
                    {formatTaka(p.transportCost + p.labourCost)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                    {formatTaka(p.grandTotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatTaka(p.paidAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">
                    {p.dueAmount > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">{formatTaka(p.dueAmount)}</span>
                    ) : (
                      <span className="text-stone-400">পরিশোধ</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    কোনো চালানের তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards View */}
        <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
          {filteredPurchases.map((p) => (
            <div key={p.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  #{p.chalanNo}
                </span>
                <span className="text-[11px] text-stone-400">
                  {formatBanglaDate(p.date, true)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 mt-1">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {p.supplierName}
                  </h4>
                  {p.supplierPhone && (
                    <a href={`tel:${p.supplierPhone}`} className="text-xs text-stone-500 hover:text-emerald-600 mt-0.5 block">
                      📞 {p.supplierPhone}
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {formatTaka(p.grandTotal)}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    পরিশোধ: {formatTaka(p.paidAmount)}
                  </div>
                </div>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl">
                <div className="font-medium text-stone-500 mb-0.5">আমদানিকৃত সবজি:</div>
                <div>{p.items.map(i => `${i.itemName} (${toBengaliNumber(i.quantity)} ${i.unit})`).join(', ')}</div>
                <div className="text-[11px] text-stone-400 mt-1">
                  মোট ওজন: {formatWeight(p.items.reduce((acc, i) => acc + i.quantityInKg, 0))} • গাড়ি/লেবার: {formatTaka(p.transportCost + p.labourCost)}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div>
                  {p.dueAmount > 0 ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      মহাজন দেনা: {formatTaka(p.dueAmount)}
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ সম্পূর্ণ পরিশোধ
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400">
                  {p.paymentMethod || 'চালান'}
                </span>
              </div>
            </div>
          ))}

          {filteredPurchases.length === 0 && (
            <div className="py-10 text-center text-xs text-stone-400">
              কোনো চালানের তথ্য পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>

      {/* New Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full sm:max-w-3xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-stone-800 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-lg">নতুন সবজির চালান ও ক্রয় এন্ট্রি</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Chalan No & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    চালান / মেমো নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: চালান-বগুড়া-১২"
                    value={chalanNo}
                    onChange={(e) => setChalanNo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      মহাজন / মোকাম সরবরাহকারী
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickSupplier(!isQuickSupplier)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      {isQuickSupplier ? 'তালিকা থেকে' : '+ নতুন মহাজন'}
                    </button>
                  </div>

                  {!isQuickSupplier ? (
                    <select
                      value={supplierId}
                      onChange={(e) => handleSupplierSelect(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.marketLocation}) {s.currentPayable > 0 ? `- দেনা ৳${s.currentPayable}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="মহাজন/আড়তের নাম..."
                        value={newSuppName}
                        onChange={(e) => setNewSuppName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                        required
                      />
                      <input
                        type="text"
                        placeholder="মোকামের ঠিকানা (যেমন: বগুড়া, মেহেরপুর)..."
                        value={newSuppLocation}
                        onChange={(e) => setNewSuppLocation(e.target.value)}
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
                    চালানে আগত কাঁচামালের তালিকা
                  </h4>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>আরও মাল যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {currentLineItems.map((line, idx) => (
                    <div key={idx} className="rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-2.5 sm:p-2">
                      {/* Mobile View */}
                      <div className="sm:hidden space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={line.itemId}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                          >
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.nameBn}
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
                              calcTitle={`${line.itemName || 'পণ্য'} - পরিমাণ হিসাব`}
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
                              <option value="বস্তা">বস্তা</option>
                              <option value="কেজি">কেজি</option>
                              <option value="পাল্লা">পাল্লা</option>
                              <option value="মণ">মণ</option>
                              <option value="খাঁচা">খাঁচা</option>
                              <option value="পিস">পিস</option>
                            </select>
                          </div>
                          <div className="col-span-4">
                            <span className="text-[10px] text-stone-500 block mb-0.5">ক্রয়দর/কেজি</span>
                            <CalcInput
                              value={line.unitPrice || 0}
                              onChange={(val) => handlePriceChange(idx, val)}
                              unitPresets="money"
                              suffix="৳"
                              calcTitle={`${line.itemName || 'পণ্য'} - ক্রয়দর হিসাব`}
                              align="right"
                              inputClassName="font-bold py-1.5"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-xs">
                          <span className="text-stone-500 text-[11px]">মাল মোট:</span>
                          <span className="font-bold text-stone-900 dark:text-stone-100">{formatTaka(line.totalPrice)}</span>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-4">
                          <select
                            value={line.itemId}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                          >
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.nameBn}
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
                            calcTitle={`${line.itemName || 'পণ্য'} - পরিমাণ`}
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
                            <option value="বস্তা">বস্তা (~৫০ কেজি)</option>
                            <option value="কেজি">কেজি</option>
                            <option value="পাল্লা">পাল্লা (৫ কেজি)</option>
                            <option value="মণ">মণ (৪০ কেজি)</option>
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
                            calcTitle={`${line.itemName || 'পণ্য'} - দর`}
                            align="right"
                            inputClassName="font-medium py-1.5"
                            required
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between">
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

              {/* Transportation, Porter & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-4">
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <CalcInput
                        label="গাড়ি / ট্রাক ভাড়া"
                        value={transportCost || 0}
                        onChange={setTransportCost}
                        unitPresets="money"
                        suffix="৳"
                        calcTitle="ট্রাক ও গাড়িভাড়া হিসাব"
                        align="right"
                        inputClassName="font-semibold"
                      />
                    </div>
                    <div>
                      <CalcInput
                        label="খালাস / লেবার খরচ"
                        value={labourCost || 0}
                        onChange={setLabourCost}
                        unitPresets="money"
                        suffix="৳"
                        calcTitle="লেবার ও খালাস খরচ হিসাব"
                        align="right"
                        inputClassName="font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1">মন্তব্য (ট্রাক নম্বর ইত্যাদি)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="যেমন: ঢাকা মেট্রো-ট-১২-৩৪৫৬..."
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>পণ্যের ক্রয়মূল্য:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{formatTaka(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-950 dark:text-stone-50 border-t border-stone-300 pt-1.5">
                    <span>চালানের সর্বমোট মূল্য:</span>
                    <span className="text-base text-stone-900 dark:text-stone-100">{formatTaka(grandTotal)}</span>
                  </div>

                  <div className="pt-2">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      মহাজনকে প্রদান (পরিশোধ):
                    </label>
                    <CalcInput
                      value={paidAmount || 0}
                      onChange={setPaidAmount}
                      unitPresets="money"
                      suffix="৳"
                      calcTitle="মহাজনকে প্রদান হিসাব"
                      align="right"
                      inputClassName="text-sm font-bold text-emerald-700 dark:text-emerald-400"
                      required
                    />
                  </div>

                  <div className={`flex justify-between font-bold pt-1 ${dueAmount > 0 ? 'text-amber-600' : 'text-stone-500'}`}>
                    <span>মহাজন দেনা থাকবে:</span>
                    <span>{formatTaka(dueAmount)}</span>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[11px] text-stone-500 mb-1">পেমেন্ট মাধ্যম</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-medium"
                    >
                      <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                      <option value="নগদ">নগদ ক্যাশ</option>
                      <option value="বিকাশ">বিকাশ</option>
                      <option value="বাকি">সম্পূর্ণ বাকি</option>
                    </select>
                  </div>
                </div>
              </div>

              </div>

              {/* Submit Sticky Footer */}
              <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>চালান সংরক্ষণ ও স্টক আপডেট</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
