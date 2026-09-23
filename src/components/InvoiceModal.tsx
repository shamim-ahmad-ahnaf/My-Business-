import React, { useState, useEffect } from 'react';
import { SaleRecord, BusinessProfile } from '../types';
import { formatTaka, formatBanglaDate, amountInBengaliWords, toBengaliNumber } from '../utils/formatters';
import { createInvoiceQrPayload, generateQrDataUrl } from '../utils/qrHelper';
import { Printer, X, Share2, Check, Phone, MapPin, QrCode, Download, Eye } from 'lucide-react';

interface InvoiceModalProps {
  sale: SaleRecord | null;
  profile: BusinessProfile;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, profile, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQrZoom, setShowQrZoom] = useState(false);

  // Generate QR code data URL whenever the sale changes
  useEffect(() => {
    if (!sale) return;

    let isMounted = true;
    const generateQr = async () => {
      try {
        const payload = createInvoiceQrPayload(sale, profile);
        const dataUrl = await generateQrDataUrl(JSON.stringify(payload), {
          width: 300,
          margin: 1
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate invoice QR code:', err);
      }
    };

    generateQr();
    return () => {
      isMounted = false;
    };
  }, [sale, profile]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `*${profile.businessName}*\n` +
      `মেমো নং: ${sale.invoiceNo}\n` +
      `তারিখ: ${formatBanglaDate(sale.date, true)}\n` +
      `ক্রেতা: ${sale.customerName} (${sale.customerPhone || 'সাধারণ'})\n` +
      `-----------------------------\n` +
      sale.items.map(i => `${i.itemName}: ${toBengaliNumber(i.quantity)} ${i.unit} x ৳${toBengaliNumber(i.unitPrice)} = ৳${toBengaliNumber(i.totalPrice)}`).join('\n') +
      `\n-----------------------------\n` +
      `মোট টাকা: ৳${toBengaliNumber(sale.subtotal)}\n` +
      (sale.discount ? `ছাড়: ৳${toBengaliNumber(sale.discount)}\n` : '') +
      `সর্বমোট: ৳${toBengaliNumber(sale.grandTotal)}\n` +
      `পরিশোধ: ৳${toBengaliNumber(sale.paidAmount)}\n` +
      `বাকি: ৳${toBengaliNumber(sale.dueAmount)}\n` +
      `পেমেন্ট মাধ্যম: ${sale.paymentMethod}\n` +
      `যোগাযোগ: ${profile.phone}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${sale.invoiceNo}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="invoice-modal-card" 
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 my-0 sm:my-8 max-h-[92vh] overflow-y-auto transition-all"
      >
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 no-print gap-1.5 sticky top-0 z-20">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs sm:text-base text-stone-800 dark:text-stone-200 truncate">
              ক্যাশ মেমো / ইনভয়েস
            </span>
            <span className="hidden xs:inline text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
              কিউআর
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {qrDataUrl && (
              <button
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                title="কিউআর কোড ইমেজ ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">কিউআর সংরক্ষণ</span>
              </button>
            )}
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
              title="WhatsApp বা SMS এর জন্য টেক্সট কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />}
              <span>{copied ? 'কপি!' : 'শেয়ার'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Memo Area */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-stone-900 text-sm">
          {/* Memo Header */}
          <div className="text-center border-b-2 border-stone-800 pb-4 mb-4">
            <div className="inline-block px-3 py-0.5 text-xs tracking-wider bg-stone-800 text-white font-medium rounded-sm mb-1.5">
              বিসমিল্লাহির রাহমানির রাহিম
            </div>

            {/* Custom Shop Logo if present */}
            {profile.logo && (
              <div className="flex items-center justify-center my-1.5">
                {profile.logo.startsWith('data:') || profile.logo.startsWith('http') ? (
                  <img 
                    src={profile.logo} 
                    alt={profile.businessName} 
                    className="h-12 w-12 object-contain rounded-lg border border-stone-200" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xl">
                    {profile.logo}
                  </div>
                )}
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
              {profile.businessName}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">{profile.slogan || profile.tagline}</p>
            <p className="text-xs text-stone-700 font-medium mt-1">
              স্বত্বাধিকারী: {profile.proprietorName || profile.proprietor}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-stone-600 mt-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" /> {profile.address}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                <Phone className="w-3 h-3 text-stone-500" /> {profile.phone}
              </span>
            </div>
          </div>

          {/* Invoice Meta Bar */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs bg-stone-50 p-3 rounded border border-stone-200">
            <div>
              <p><span className="text-stone-500">মেমো নং:</span> <strong className="font-mono text-stone-800 text-sm">{sale.invoiceNo}</strong></p>
              <p className="mt-1"><span className="text-stone-500">ক্রেতার নাম:</span> <strong className="text-stone-900">{sale.customerName}</strong></p>
              {sale.customerPhone && (
                <p className="mt-0.5 text-stone-600">মোবাইল: {sale.customerPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p><span className="text-stone-500">তারিখ:</span> <strong className="text-stone-800">{formatBanglaDate(sale.date, true)}</strong></p>
              <p className="mt-1">
                <span className="text-stone-500">পেমেন্ট মাধ্যম:</span>{' '}
                <span className="inline-block px-2 py-0.5 font-medium rounded bg-emerald-100 text-emerald-800">
                  {sale.paymentMethod}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-800 bg-stone-100 text-stone-800">
                  <th className="py-2 px-2 text-center w-8">নং</th>
                  <th className="py-2 px-2">কাঁচামাল/সবজির নাম</th>
                  <th className="py-2 px-2 text-right">পরিমাণ</th>
                  <th className="py-2 px-2 text-right">দর (টাকা)</th>
                  <th className="py-2 px-2 text-right">মোট (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2 px-2 text-center text-stone-500">{toBengaliNumber(idx + 1)}</td>
                    <td className="py-2 px-2 font-medium text-stone-900">{item.itemName}</td>
                    <td className="py-2 px-2 text-right text-stone-800 whitespace-nowrap">
                      {toBengaliNumber(item.quantity)} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-right text-stone-800">
                      {formatTaka(item.unitPrice)}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-stone-950">
                      {formatTaka(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary & QR Code Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-300 pt-3">
            
            {/* Left Column: In Words, Notes, and QR Code */}
            <div className="text-xs text-stone-600 flex flex-col justify-between space-y-3">
              <div>
                <p className="font-semibold text-stone-800 mb-1">কথায়:</p>
                <p className="italic text-stone-700 bg-stone-50 p-2 rounded border border-stone-200">
                  {amountInBengaliWords(sale.grandTotal)}
                </p>
                {sale.notes && (
                  <p className="mt-1.5 text-stone-500">মন্তব্য: {sale.notes}</p>
                )}
              </div>

              {/* Scannable QR Code Box */}
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                <div 
                  className="relative group cursor-pointer shrink-0" 
                  onClick={() => setShowQrZoom(true)}
                  title="বড় করে কিউআর দেখুন"
                >
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt={`QR Code for ${sale.invoiceNo}`}
                      className="w-20 h-20 bg-white p-1 rounded border border-stone-300 shadow-2xs"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-stone-200 animate-pulse rounded" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity no-print">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-[11px] leading-snug">
                  <div className="font-bold text-stone-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>মেমো ও পেমেন্ট কিউআর কোড</span>
                  </div>
                  <p className="text-stone-500 text-[10px] mt-0.5">
                    মোবাইল ক্যামেরা বা হিসাব খাতার স্ক্যানার দিয়ে স্ক্যান করে দ্রুত মেমো যাচাই করুন।
                  </p>
                  <p className="font-mono text-[10px] text-emerald-800 font-semibold mt-1">
                    #{sale.invoiceNo}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 border-t border-dashed border-stone-200 pt-1">
                {profile.invoiceFooterNote}
              </p>
            </div>

            {/* Right Column: Totals Table */}
            <div className="text-xs space-y-1.5 bg-stone-50 p-3 rounded border border-stone-200">
              <div className="flex justify-between text-stone-600">
                <span>উপমোট (Subtotal):</span>
                <span className="font-medium text-stone-900">{formatTaka(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>ছাড় (Discount):</span>
                  <span>- {formatTaka(sale.discount)}</span>
                </div>
              )}
              {sale.labourCost && sale.labourCost > 0 ? (
                <div className="flex justify-between text-stone-600">
                  <span>লেবার/কুলি খরচ:</span>
                  <span>+ {formatTaka(sale.labourCost)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold text-stone-950 border-t border-stone-300 pt-1.5">
                <span>সর্বমোট (Grand Total):</span>
                <span>{formatTaka(sale.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>নগদ পরিশোধ (Paid):</span>
                <span>{formatTaka(sale.paidAmount)}</span>
              </div>
              <div className={`flex justify-between font-bold pt-1 border-t border-stone-200 ${sale.dueAmount > 0 ? 'text-rose-700' : 'text-stone-600'}`}>
                <span>বকেয়া / বাকি (Due):</span>
                <span>{formatTaka(sale.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-8 pt-4 text-xs text-stone-600">
            <div className="text-center">
              <div className="w-32 border-t border-stone-400 mb-1"></div>
              <span>ক্রেতার স্বাক্ষর</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-t border-stone-400 mb-1"></div>
              <span className="font-medium text-stone-800">বিক্রেতা / ক্যাশিয়ার</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center no-print">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            ডিজিটাল কিউআর ভেরিফিকেশন সহ অটোমেটিক মেমো
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

        {/* QR Code Enlarged Zoom Modal */}
        {showQrZoom && qrDataUrl && (
          <div 
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowQrZoom(false)}
          >
            <div 
              className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-xs space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-base text-stone-900">মেমো কিউআর কোড</h3>
              <p className="text-xs text-stone-500">মেমো নং: {sale.invoiceNo}</p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
                <img src={qrDataUrl} alt="Enlarged QR" className="w-60 h-60 mx-auto" />
              </div>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={handleDownloadQr}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড করুন</span>
                </button>
                <button
                  onClick={() => setShowQrZoom(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold"
                >
                  বন্ধ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
