import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Clock, 
  X, 
  CheckCircle2, 
  CloudOff,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { BackupAlertStatus } from '../utils/backupAlertService';
import { toBengaliNumber } from '../utils/formatters';

interface BackupAlertBannerProps {
  status: BackupAlertStatus;
  onDownloadBackup: () => void;
  onSyncNow?: () => void;
  onSnooze: (days?: number) => void;
  className?: string;
}

export const BackupAlertBanner: React.FC<BackupAlertBannerProps> = ({
  status,
  onDownloadBackup,
  onSyncNow,
  onSnooze,
  className = ''
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!status.isAlertActive && !downloadSuccess) {
    return null;
  }

  const isCritical = status.severity === 'critical';

  const handleDownload = () => {
    onDownloadBackup();
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  const formatDaysText = (days: number | null) => {
    if (days === null) return 'কখনও নেওয়া হয়নি';
    if (days === 0) return 'আজকে';
    if (days === 1) return 'গতকাল (১ দিন আগে)';
    return `${toBengaliNumber(days)} দিন আগে`;
  };

  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-2xl border transition-all shadow-sm ${
        downloadSuccess
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
          : isCritical
          ? 'bg-gradient-to-r from-rose-50 via-amber-50/50 to-orange-50 dark:from-rose-950/60 dark:via-amber-950/40 dark:to-orange-950/50 border-rose-300 dark:border-rose-800/70'
          : 'bg-gradient-to-r from-amber-50 via-yellow-50/50 to-stone-50 dark:from-amber-950/50 dark:via-yellow-950/30 dark:to-stone-900 border-amber-300 dark:border-amber-700/60'
      } ${className}`}
    >
      {/* Visual Accent Top Bar */}
      <div 
        className={`h-1 w-full ${
          downloadSuccess 
            ? 'bg-emerald-500' 
            : isCritical 
            ? 'bg-rose-500 animate-pulse' 
            : 'bg-amber-500'
        }`} 
      />

      <div className="p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        
        {/* Left icon & text */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 mt-0.5">
            {downloadSuccess ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : isCritical ? (
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center relative">
                <ShieldAlert className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                {downloadSuccess ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    ম্যানুয়াল ব্যাকআপ সফলভাবে সংরক্ষিত হয়েছে!
                  </span>
                ) : isCritical ? (
                  <span className="text-rose-800 dark:text-rose-300">
                    জরুরি সতর্কতা: অফলাইন ডাটা ব্যাকআপ প্রয়োজন
                  </span>
                ) : (
                  <span className="text-amber-800 dark:text-amber-300">
                    সাপ্তাহিক রুটিন ব্যাকআপ রিমাইন্ডার (Backup Alert)
                  </span>
                )}
              </h4>

              {!downloadSuccess && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isCritical 
                    ? 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200' 
                    : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                }`}>
                  {isCritical ? 'জরুরি' : 'সাপ্তাহিক'}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl">
              {downloadSuccess ? (
                'আপনার সম্পূর্ণ হিসাব, বাকি খাতা ও বিক্রয় ইতিহাসের এনক্রিপ্টেড ব্যাকআপ ফাইলটি আপনার ডিভাইসে ডাউনলোড সম্পন্ন হয়েছে।'
              ) : status.reason === 'never_backed_up' ? (
                'আপনার দোকানে এখনও কোনো ম্যানুয়াল অফলাইন ব্যাকআপ ফাইল সংরক্ষণ করা হয়নি। অপ্রত্যাশিত নেটওয়ার্ক বা ব্রাউজার সমস্যা এড়াতে এখনই একটি অফলাইন কপি সংরক্ষণ করুন।'
              ) : status.reason === 'overdue_no_sync' ? (
                `গত ${toBengaliNumber(status.daysSinceLastBackup || 7)}+ দিন ধরে কোনো অফলাইন ব্যাকআপ নেওয়া হয়নি এবং সাম্প্রতিক ক্লাউড সিঙ্ক নিশ্চিত করা যায়নি। সমস্ত হিসাব সুরক্ষিত রাখতে এখনই ব্যাকআপ ডাউনলোড করুন।`
              ) : (
                `প্রতি সপ্তাহে অন্তত একবার অফলাইন ব্যাকআপ নেওয়া নিয়ম। সর্বশেষ ব্যাকআপ নেওয়া হয়েছিল ${formatDaysText(status.daysSinceLastBackup)}।`
              )}
            </p>

            {/* Badges Info Bar */}
            {!downloadSuccess && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="inline-flex items-center gap-1 bg-white/70 dark:bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-stone-700">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  সর্বশেষ ব্যাকআপ: <strong className="text-stone-800 dark:text-stone-200">{formatDaysText(status.daysSinceLastBackup)}</strong>
                </span>

                <span className="inline-flex items-center gap-1 bg-white/70 dark:bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-stone-700">
                  {navigator.onLine ? (
                    <RefreshCw className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <CloudOff className="w-3 h-3 text-amber-500" />
                  )}
                  ক্লাউড সিঙ্ক: <strong className="text-stone-800 dark:text-stone-200">{navigator.onLine ? 'অনলাইন' : 'অফলাইন'}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right action buttons */}
        {!downloadSuccess ? (
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 shrink-0 md:self-center pl-13 md:pl-0">
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${
                isCritical
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20'
              }`}
              title="সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>এখনই ব্যাকআপ নিন</span>
            </button>

            {onSyncNow && navigator.onLine && (
              <button
                onClick={onSyncNow}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
                title="ক্লাউডের সাথে এখনই সিঙ্ক করুন"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">সিঙ্ক চেক</span>
              </button>
            )}

            <button
              onClick={() => onSnooze(2)}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="২ দিনের জন্য নোটিফিকেশন স্থগিত করুন"
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>২ দিন পর</span>
            </button>

            <button
              onClick={() => onSnooze(1)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-13 md:pl-0">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              ধন্যবাদ! পরবর্তী রিমাইন্ডার ৭ দিন পর দেওয়া হবে।
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
