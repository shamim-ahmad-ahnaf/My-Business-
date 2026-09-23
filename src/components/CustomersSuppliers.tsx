import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MessageSquare, 
  CheckCircle2,
  DollarSign,
  Calculator
} from 'lucide-react';
import { CalcInput } from './CalcInput';
import { Customer, Supplier, PaymentTransaction } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

interface CustomersSuppliersProps {
  customers: Customer[];
  suppliers: Supplier[];
  onAddCustomer: (customer: Customer) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onRecordCustomerPayment: (customerId: string, amount: number, method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক', note?: string) => void;
  onRecordSupplierPayment: (supplierId: string, amount: number, method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক', note?: string) => void;
}

export const CustomersSuppliers: React.FC<CustomersSuppliersProps> = ({
  customers,
  suppliers,
  onAddCustomer,
  onAddSupplier,
  onRecordCustomerPayment,
  onRecordSupplierPayment
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal State
  const [collectDueCustomer, setCollectDueCustomer] = useState<Customer | null>(null);
  const [payDueSupplier, setPayDueSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক'>('নগদ');
  const [paymentNote, setPaymentNote] = useState('');

  // Add Party Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialDue, setInitialDue] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const totalCustomerDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.marketLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectDueCustomer || paymentAmount <= 0) return;
    onRecordCustomerPayment(collectDueCustomer.id, paymentAmount, paymentMethod, paymentNote);
    setCollectDueCustomer(null);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  const handleSupplierPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDueSupplier || paymentAmount <= 0) return;
    onRecordSupplierPayment(payDueSupplier.id, paymentAmount, paymentMethod, paymentNote);
    setPayDueSupplier(null);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || 'স্থানীয়',
      totalPurchases: initialDue,
      totalPaid: 0,
      currentDue: initialDue,
      createdAt: new Date().toISOString(),
      notes: notes.trim()
    };
    onAddCustomer(newCust);
    setShowAddCustomerModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setInitialDue(0);
    setNotes('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newSupp: Supplier = {
      id: `supp-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      marketLocation: address.trim() || 'মোকাম',
      totalPurchases: initialDue,
      totalPaid: 0,
      currentPayable: initialDue,
      createdAt: new Date().toISOString(),
    };
    onAddSupplier(newSupp);
    setShowAddSupplierModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setInitialDue(0);
  };

  const handleWhatsAppReminder = (c: Customer) => {
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম ${c.name} ভাই। আমাদের কাঁচামাল ও সবজির দোকান থেকে আপনার বকেয়া হিসাব বাবদ মোট পাওনা রয়েছে ${formatTaka(c.currentDue)}। অনুগ্রহ করে সময়মতো পরিশোধ করার অনুরোধ রইল। ধন্যবাদ!`
    );
    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>বাকি খাতা ও পার্টি ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            নিয়মিত ক্রেতাদের বাকি পাওনা এবং মহাজন/মোকাম দেনা হিসাব নিখুঁতভাবে সংরক্ষণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'customers' ? (
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কাস্টমার খাতা</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddSupplierModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন মহাজন খাতা</span>
            </button>
          )}
        </div>
      </div>

      {/* Dues KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">
              কাস্টমারদের কাছে মোট বাকি পাওনা (Receivables)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatTaka(totalCustomerDue)}
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {toBengaliNumber(customers.filter(c => c.currentDue > 0).length)} জন ক্রেতার কাছে বকেয়া আছে
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold block">
              মহাজনদের কাছে মোট দেনা (Payables)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {formatTaka(totalSupplierPayable)}
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {toBengaliNumber(suppliers.filter(s => s.currentPayable > 0).length)} জন মহাজনের টাকা পরিশোধযোগ্য
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'customers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            কাস্টমার বাকি খাতা ({toBengaliNumber(customers.length)})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            মহাজন ও মোকাম সাপ্লায়ার ({toBengaliNumber(suppliers.length)})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder={activeTab === 'customers' ? 'কাস্টমারের নাম বা ফোন...' : 'মহাজন বা মোকামের নাম...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-hidden dark:text-stone-100"
          />
        </div>
      </div>

      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-3">ক্রেতার নাম ও ঠিকানা</th>
                  <th className="py-3 px-3">যোগাযোগ</th>
                  <th className="py-3 px-3 text-right">মোট কেনাকাটা</th>
                  <th className="py-3 px-3 text-right">মোট পরিশোধ</th>
                  <th className="py-3 px-3 text-right">বর্তমান বাকি</th>
                  <th className="py-3 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{c.name}</div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{c.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-stone-700 dark:text-stone-300">
                      {formatTaka(c.totalPurchases)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatTaka(c.totalPaid)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      {c.currentDue > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">{formatTaka(c.currentDue)}</span>
                      ) : (
                        <span className="text-emerald-600">০ (পরিশোধ)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {c.currentDue > 0 && (
                          <>
                            <button
                              onClick={() => {
                                setCollectDueCustomer(c);
                                setPaymentAmount(c.currentDue);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                            >
                              বাকি আদায়
                            </button>
                            <button
                              onClick={() => handleWhatsAppReminder(c)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-md transition-colors"
                              title="WhatsApp তাগাদা মেসেজ পাঠান"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {c.currentDue === 0 && (
                          <span className="text-[11px] text-stone-400">ক্লিয়ার</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Customer Cards */}
          <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
            {filteredCustomers.map((c) => (
              <div key={c.id} className="p-4 space-y-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">{c.name}</h4>
                    <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{c.address}</span>
                    </div>
                  </div>
                  <div>
                    {c.currentDue > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                        বাকি: {formatTaka(c.currentDue)}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        সম্পূর্ণ পরিশোধ
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-stone-400 block">মোট কেনাকাটা</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{formatTaka(c.totalPurchases)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">মোট পরিশোধ</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatTaka(c.totalPaid)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.phone}</span>
                  </a>

                  <div className="flex items-center gap-2">
                    {c.currentDue > 0 && (
                      <>
                        <button
                          onClick={() => handleWhatsAppReminder(c)}
                          className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg active:scale-95 transition-all"
                          title="WhatsApp তাগাদা"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCollectDueCustomer(c);
                            setPaymentAmount(c.currentDue);
                          }}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all"
                        >
                          বাকি আদায়
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="py-10 text-center text-xs text-stone-400">
                কোনো কাস্টমার পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suppliers Tab Content */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-3">মহাজন / আড়তের নাম</th>
                  <th className="py-3 px-3">মোকাম / হাট</th>
                  <th className="py-3 px-3">ফোন নম্বর</th>
                  <th className="py-3 px-3 text-right">মোট মাল ক্রয়</th>
                  <th className="py-3 px-3 text-right">মোট প্রদান</th>
                  <th className="py-3 px-3 text-right">বর্তমান দেনা</th>
                  <th className="py-3 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-stone-800">
                        {s.marketLocation}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-stone-600 dark:text-stone-400">
                      {s.phone}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-stone-700 dark:text-stone-300">
                      {formatTaka(s.totalPurchases)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatTaka(s.totalPaid)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      {s.currentPayable > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">{formatTaka(s.currentPayable)}</span>
                      ) : (
                        <span className="text-emerald-600">০ (পরিশোধ)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {s.currentPayable > 0 ? (
                        <button
                          onClick={() => {
                            setPayDueSupplier(s);
                            setPaymentAmount(s.currentPayable);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors"
                        >
                          দেনা শোধ
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">ক্লিয়ার</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Supplier Cards */}
          <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
            {filteredSuppliers.map((s) => (
              <div key={s.id} className="p-4 space-y-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">{s.name}</h4>
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 mt-1">
                      {s.marketLocation}
                    </span>
                  </div>
                  <div>
                    {s.currentPayable > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        দেনা: {formatTaka(s.currentPayable)}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        পরিশোধিত
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-stone-400 block">মোট ক্রয়</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{formatTaka(s.totalPurchases)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">মোট প্রদান</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatTaka(s.totalPaid)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`tel:${s.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{s.phone}</span>
                  </a>

                  {s.currentPayable > 0 && (
                    <button
                      onClick={() => {
                        setPayDueSupplier(s);
                        setPaymentAmount(s.currentPayable);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-stone-800 hover:bg-stone-900 text-white shadow-xs active:scale-95 transition-all"
                    >
                      দেনা শোধ
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredSuppliers.length === 0 && (
              <div className="py-10 text-center text-xs text-stone-400">
                কোনো মহাজন বা সরবরাহকারী পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Collect Due from Customer */}
      {collectDueCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>বাকি টাকা আদায় জমা</span>
              </h3>
              <button onClick={() => setCollectDueCustomer(null)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>
            
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs space-y-1">
              <p><strong>ক্রেতা:</strong> {collectDueCustomer.name}</p>
              <p><strong>বর্তমান মোট বাকি:</strong> <span className="font-bold text-rose-600">{formatTaka(collectDueCustomer.currentDue)}</span></p>
            </div>

            <form onSubmit={handleCustomerPaymentSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <CalcInput
                  label="জমার পরিমাণ (টাকা)"
                  value={paymentAmount || 0}
                  onChange={setPaymentAmount}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle={`${collectDueCustomer.name} - বাকি আদায় হিসাব`}
                  align="right"
                  inputClassName="text-lg font-bold text-emerald-600 dark:text-emerald-400 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                >
                  <option value="নগদ">নগদ ক্যাশ (Cash)</option>
                  <option value="বিকাশ">বিকাশ (bKash)</option>
                  <option value="নগদ-মোবাইল">নগদ (Nagad App)</option>
                  <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">নোট / রেফারেন্স (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="যেমন: দোকান কাউন্টারে নগদ প্রদান..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setCollectDueCustomer(null)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Due to Supplier */}
      {payDueSupplier && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-stone-800 dark:text-stone-200" />
                <span>মহাজন দেনা পরিশোধ</span>
              </h3>
              <button onClick={() => setPayDueSupplier(null)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs space-y-1">
              <p><strong>মহাজন:</strong> {payDueSupplier.name} ({payDueSupplier.marketLocation})</p>
              <p><strong>মোট বকেয়া দেনা:</strong> <span className="font-bold text-amber-600">{formatTaka(payDueSupplier.currentPayable)}</span></p>
            </div>

            <form onSubmit={handleSupplierPaymentSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <CalcInput
                  label="পরিশোধের পরিমাণ (টাকা)"
                  value={paymentAmount || 0}
                  onChange={setPaymentAmount}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle={`${payDueSupplier.name} - দেনা পরিশোধ হিসাব`}
                  align="right"
                  inputClassName="text-lg font-bold text-stone-900 dark:text-stone-100 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                >
                  <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                  <option value="নগদ">নগদ ক্যাশ</option>
                  <option value="বিকাশ">বিকাশ</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPayDueSupplier(null)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 font-bold rounded-xl bg-stone-800 hover:bg-stone-900 text-white shadow-xs"
                >
                  পরিশোধ সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                নতুন কাস্টমার খাতা খুলুন
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">ক্রেতার নাম / প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: হাজী হোটেল / রফিক বিক্রেতা..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="01712-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">ঠিকানা / দোকান নং</label>
                <input
                  type="text"
                  placeholder="বাজার শেড নং ২..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <CalcInput
                  label="পূর্বের বাকি (যদি থাকে)"
                  value={initialDue || 0}
                  onChange={setInitialDue}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle="পূর্বের বাকি হিসাব"
                  align="right"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  খাতা সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                নতুন মহাজন / মোকাম সরবরাহকারী যোগ
              </h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-stone-400 hover:text-stone-600 p-1 text-base">✕</button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">মহাজন / আড়তের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: মেসার্স মকবুল আড়তদার..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">মোকাম / হাটের ঠিকানা</label>
                <input
                  type="text"
                  placeholder="যেমন: বগুড়া, পাবনা, মেহেরপুর..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  placeholder="01715-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <CalcInput
                  label="পূর্বের দেনা (যদি থাকে)"
                  value={initialDue || 0}
                  onChange={setInitialDue}
                  unitPresets="money"
                  suffix="৳"
                  calcTitle="পূর্বের দেনা হিসাব"
                  align="right"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2.5 text-stone-600 rounded-xl hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 font-bold rounded-xl bg-stone-800 hover:bg-stone-900 text-white shadow-xs"
                >
                  মহাজন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
