import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  X, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  Upload, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Wallet, 
  Phone, 
  User, 
  Calendar, 
  RotateCcw,
  Printer,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SaleRecord, Customer } from '../types';
import { formatTaka, formatBanglaDate, toBengaliNumber } from '../utils/formatters';
import { parseScannedQr, InvoiceQrPayload } from '../utils/qrHelper';
import { playNotificationSound } from '../utils/storage';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  customers: Customer[];
  onViewInvoice: (sale: SaleRecord) => void;
  onUpdateSalePayment?: (invoiceNo: string, amount: number, method: 'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক') => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  sales,
  customers,
  onViewInvoice,
  onUpdateSalePayment
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  
  // Scan result state
  const [scannedResult, setScannedResult] = useState<{
    invoiceNo: string;
    sale: SaleRecord | null;
    qrPayload: Partial<InvoiceQrPayload> | null;
    matchedCustomer: Customer | null;
    scannedText: string;
  } | null>(null);

  // Quick payment in modal
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'নগদ' | 'বিকাশ' | 'নগদ-মোবাইল' | 'ব্যাংক'>('নগদ');
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);
  const [payErrorMsg, setPayErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Process detected QR string
  const handleDecodedString = useCallback((detectedText: string) => {
    if (!detectedText) return;
    
    // Audio / Haptic feedback
    playNotificationSound();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // Ignore vibrate errors
      }
    }

    // Stop continuous frame scan while showing results
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const { invoiceNo, payload } = parseScannedQr(detectedText);

    // Look up in sales database
    let foundSale: SaleRecord | null = null;
    if (invoiceNo) {
      foundSale = sales.find(s => s.invoiceNo.toLowerCase() === invoiceNo.toLowerCase()) || null;
    }
    
    // Also try customer match by phone or name
    let matchedCust: Customer | null = null;
    if (foundSale) {
      matchedCust = customers.find(c => c.id === foundSale?.customerId) || null;
    } else if (payload?.customerPhone) {
      matchedCust = customers.find(c => c.phone === payload?.customerPhone) || null;
    }

    setScannedResult({
      invoiceNo: invoiceNo || (foundSale?.invoiceNo ?? ''),
      sale: foundSale,
      qrPayload: payload,
      matchedCustomer: matchedCust,
      scannedText: detectedText
    });

    if (foundSale && foundSale.dueAmount > 0) {
      setPayAmount(foundSale.dueAmount.toString());
    } else {
      setPayAmount('');
    }
    setPaySuccessMsg(null);
  }, [sales, customers]);

  // Frame scanning loop
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleDecodedString(code.data);
          return; // Stop animation loop
        }
      } catch (err) {
        console.error('Frame decode error:', err);
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleDecodedString]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('আপনার ব্রাউজারে সরাসরি ক্যামেরা সমর্থন নেই। নিচের বাটন দিয়ে মেমোর ছবি আপলোড করতে পারেন।');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : null;
        setHasTorch(Boolean(capabilities?.torch));

        // Start scanning frames
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      let errMsg = 'ক্যামেরা চালু করা সম্ভব হয়নি। ডিভাইসে ক্যামেরা পারমিশন দেওয়া আছে কি না পরীক্ষা করুন।';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'ক্যামেরা ব্যবহারের অনুমতি বাতিল করা হয়েছে। ব্রাউজার সেটিংসে ক্যামেরা এলাও করুন অথবা মেমোর ছবি আপলোড করুন।';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'কোনো ক্যামেরা ডিভাইস পাওয়া যায়নি। অনুগ্রহ করে ছবি আপলোড করুন।';
      }
      setCameraError(errMsg);
      setCameraActive(false);
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Handle Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorchOn(nextTorch);
      } catch (e) {
        console.error('Torch error:', e);
      }
    }
  };

  // Flip camera
  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload photo fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedString(code.data);
          } else {
            alert('ছবিতে কোনো কিউআর কোড (QR Code) শনাক্ত করা যায়নি। পরিষ্কার ও স্পষ্ট ছবি দিয়ে চেষ্টা করুন।');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  // Manual search submit
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearchQuery.trim()) return;
    handleDecodedString(manualSearchQuery.trim());
  };

  // Reset scan
  const handleResetScan = () => {
    setScannedResult(null);
    setPaySuccessMsg(null);
    setPayErrorMsg(null);
    setPayAmount('');
    startCamera();
  };

  // Handle Quick Payment Collection
  const handleCollectPayment = () => {
    if (!scannedResult?.sale || !onUpdateSalePayment) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayErrorMsg('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন');
      return;
    }
    setPayErrorMsg(null);

    onUpdateSalePayment(scannedResult.sale.invoiceNo, amountNum, payMethod);

    // Update local modal state immediately
    const updatedSale: SaleRecord = {
      ...scannedResult.sale,
      paidAmount: scannedResult.sale.paidAmount + amountNum,
      dueAmount: Math.max(0, scannedResult.sale.dueAmount - amountNum)
    };

    setScannedResult(prev => prev ? {
      ...prev,
      sale: updatedSale
    } : null);

    setPaySuccessMsg(`৳${toBengaliNumber(amountNum)} টাকা সফলভাবে আদায় ও মেমো হালনাগাদ করা হয়েছে!`);
    playNotificationSound();
  };

  // Modal open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setManualSearchQuery('');
      setPaySuccessMsg(null);
      setPayErrorMsg(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        id="qr-scanner-modal" 
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col transition-all"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-tight">
                মেমো কিউআর স্ক্যানার ও পেমেন্ট যাচাই
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                ডিভাইস ক্যামেরা দিয়ে ক্যাশ মেমোর কিউআর কোড স্ক্যান করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas for Decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input for Image Upload */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Body Content */}
        <div className="p-4 sm:p-5">

          {/* VIEW A: RESULT / VERIFICATION CARD */}
          {scannedResult ? (
            <div className="space-y-4">
              
              {/* Verification Header Banner */}
              {scannedResult.sale ? (
                <div className="flex items-start gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                        ✓ অনুমোদিত ও আসল মেমো
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {formatBanglaDate(scannedResult.sale.date, true)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 mt-1">
                      মেমো নম্বর <strong>#{scannedResult.sale.invoiceNo}</strong> ডাটাবেজের সাথে সফলভাবে মিলেছে।
                    </p>
                  </div>
                </div>
              ) : scannedResult.qrPayload ? (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="p-2 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                      অফলাইন কিউআর মেমো ডাটা
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300 mt-1">
                      দোকান: <strong>{scannedResult.qrPayload.shopName || 'কাঁচামাল আড়ত'}</strong> (মেমো #{scannedResult.qrPayload.invoiceNo})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
                  <div className="p-2 bg-stone-500 text-white rounded-lg shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-stone-600 text-white">
                      স্ক্যানকৃত কোড
                    </span>
                    <p className="text-xs font-mono text-stone-700 dark:text-stone-300 mt-1 truncate">
                      {scannedResult.scannedText}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      এই নম্বরের কোনো মেমো বর্তমান তালিকায় পাওয়া যায়নি।
                    </p>
                  </div>
                </div>
              )}

              {/* Success Notification for Payment */}
              {paySuccessMsg && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{paySuccessMsg}</span>
                </div>
              )}

              {/* Primary Invoice & Customer Details Card */}
              {scannedResult.sale && (
                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 p-4 space-y-3">
                  
                  {/* Customer & Invoice Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {scannedResult.sale.customerName}
                        </span>
                        {scannedResult.sale.customerPhone && (
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {scannedResult.sale.customerPhone}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        মেমো নং: <strong className="font-mono text-stone-800 dark:text-stone-200">{scannedResult.sale.invoiceNo}</strong> • মাধ্যম: {scannedResult.sale.paymentMethod}
                      </p>
                    </div>

                    {/* Due / Paid Badge */}
                    <div className="shrink-0">
                      {scannedResult.sale.dueAmount > 0 ? (
                        <div className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-right">
                          <span className="text-[10px] block font-medium">বকেয়া বাকি</span>
                          <span className="font-bold text-sm sm:text-base">
                            {formatTaka(scannedResult.sale.dueAmount)}
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-right">
                          <span className="text-[10px] block font-medium">পেমেন্ট স্ট্যাটাস</span>
                          <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> সম্পূর্ণ পরিশোধিত
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-500 dark:text-stone-400 text-[10px] block">সর্বমোট বিল</span>
                      <strong className="text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                        {formatTaka(scannedResult.sale.grandTotal)}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                      <span className="text-[10px] block">জমা / পরিশোধ</span>
                      <strong className="text-xs sm:text-sm">
                        {formatTaka(scannedResult.sale.paidAmount)}
                      </strong>
                    </div>
                    <div className={`p-2 rounded-lg border text-xs sm:text-sm ${
                      scannedResult.sale.dueAmount > 0 
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300' 
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}>
                      <span className="text-[10px] block">অবশিষ্ট বাকি</span>
                      <strong>
                        {formatTaka(scannedResult.sale.dueAmount)}
                      </strong>
                    </div>
                  </div>

                  {/* Purchased Items List Preview */}
                  <div className="pt-1">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                      ক্রয়কৃত সবজির তালিকা ({toBengaliNumber(scannedResult.sale.items.length)} আইটেম):
                    </span>
                    <div className="max-h-36 overflow-y-auto divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                      {scannedResult.sale.items.map((it, idx) => (
                        <div key={idx} className="p-2 text-xs flex items-center justify-between">
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            {it.itemName}
                          </span>
                          <span className="text-stone-500">
                            {toBengaliNumber(it.quantity)} {it.unit} x ৳{toBengaliNumber(it.unitPrice)} = <strong className="text-stone-800 dark:text-stone-200">{formatTaka(it.totalPrice)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Khata Balance Overview if Available */}
                  {scannedResult.matchedCustomer && (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-blue-900 dark:text-blue-300">
                        {scannedResult.matchedCustomer.name} এর মোট চলতি বাকি (খাতা):
                      </span>
                      <strong className="text-blue-900 dark:text-blue-200 font-bold">
                        {formatTaka(scannedResult.matchedCustomer.currentDue)}
                      </strong>
                    </div>
                  )}

                  {/* Quick Payment Form (if due amount > 0) */}
                  {scannedResult.sale.dueAmount > 0 && onUpdateSalePayment && (
                    <div className="mt-3 p-3 bg-white dark:bg-stone-900 rounded-xl border-2 border-emerald-500/40 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>তাৎক্ষণিক বাকি টাকা আদায় ও রিসিট আপডেট করুন</span>
                      </div>
                      {payErrorMsg && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{payErrorMsg}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">জমা টাকার পরিমাণ (৳)</label>
                          <input 
                            type="number" 
                            value={payAmount} 
                            onChange={e => setPayAmount(e.target.value)} 
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold" 
                            placeholder="টাকা" 
                            max={scannedResult.sale.dueAmount}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">পেমেন্ট মাধ্যম</label>
                          <select 
                            value={payMethod} 
                            onChange={e => setPayMethod(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium"
                          >
                            <option value="নগদ">নগদ ক্যাশ</option>
                            <option value="বিকাশ">বিকাশ</option>
                            <option value="নগদ-মোবাইল">নগদ (মোবাইল)</option>
                            <option value="ব্যাংক">ব্যাংক ট্রান্সফার</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={handleCollectPayment}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>জমা নিন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Offline Payload info (if not found in local sales) */}
              {!scannedResult.sale && scannedResult.qrPayload && (
                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-500">মেমো নং:</span> <strong className="text-stone-900 dark:text-stone-100">{scannedResult.qrPayload.invoiceNo}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">তারিখ:</span> <strong>{scannedResult.qrPayload.date?.slice(0, 10)}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">ক্রেতা:</span> <strong>{scannedResult.qrPayload.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">মোট বিল:</span> <strong className="text-emerald-700">{formatTaka(scannedResult.qrPayload.grandTotal || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">পরিশোধ:</span> <strong>{formatTaka(scannedResult.qrPayload.paidAmount || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">বাকি:</span> <strong className="text-rose-600">{formatTaka(scannedResult.qrPayload.dueAmount || 0)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <button
                  onClick={handleResetScan}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>অন্য মেমো স্ক্যান করুন</span>
                </button>

                <div className="flex items-center gap-2">
                  {scannedResult.sale && (
                    <button
                      onClick={() => {
                        onClose();
                        onViewInvoice(scannedResult.sale!);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>মেমো প্রিন্ট ও প্রিভিউ</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 transition-colors"
                  >
                    বন্ধ
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* VIEW B: CAMERA SCANNER & RETICLE */
            <div className="space-y-4">
              
              {/* Camera Feed Viewport */}
              <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-stone-950 rounded-2xl overflow-hidden shadow-inner border border-stone-800 flex items-center justify-center">
                
                {cameraActive && !cameraError ? (
                  <>
                    <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      playsInline 
                      muted 
                    />

                    {/* Viewfinder Overlay with Reticles & Animated Laser */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/70 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                        {/* 4 Corner Markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                        
                        {/* Animated Laser Scanning Line */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce mt-10" />
                      </div>
                    </div>

                    {/* Floating Controls (Torch & Camera Flip) */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      {hasTorch && (
                        <button
                          onClick={toggleTorch}
                          className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                            torchOn ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                          title={torchOn ? 'ফ্ল্যাশ বন্ধ করুন' : 'ফ্ল্যাশ চালু করুন'}
                        >
                          {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={handleFlipCamera}
                        className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                        title="ক্যামেরা পরিবর্তন করুন"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Helper Instruction Badge */}
                    <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-medium tracking-wide border border-white/10 shadow-xs">
                        ক্যাশ মেমোর কিউআর কোডটি বক্সের মাঝে রাখুন
                      </span>
                    </div>
                  </>
                ) : (
                  /* Camera Error or Standby Fallback State */
                  <div className="p-6 text-center text-stone-300 max-w-sm">
                    <Camera className="w-12 h-12 text-stone-500 mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                      {cameraError || 'ক্যামেরা চালু হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        onClick={startCamera}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>পুনরায় চেষ্টা করুন</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>ছবি আপলোড করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Alternative Tools: Upload & Manual Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Upload Memo Image button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all group"
                >
                  <Upload className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>গ্যালারি থেকে মেমোর ছবি আপলোড</span>
                </button>

                {/* Manual Search Form */}
                <form onSubmit={handleManualSearch} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={manualSearchQuery}
                      onChange={e => setManualSearchQuery(e.target.value)}
                      placeholder="মেমো নং লিখুন (যেমন MEMO-...)"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                  >
                    খুঁজুন
                  </button>
                </form>
              </div>

              {/* Recent Invoices Quick Scan Helper */}
              {sales.length > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      দ্রুত যাচাই করতে সাম্প্রতিক মেমো নির্বাচন করুন:
                    </span>
                    <span>{toBengaliNumber(sales.length)} টি মেমো রেকর্ড</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sales.slice(0, 5).map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleDecodedString(s.invoiceNo)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-600 font-mono transition-colors"
                      >
                        {s.invoiceNo} ({s.customerName})
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
