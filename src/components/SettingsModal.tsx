import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Cloud, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  Camera,
  User,
  Edit3,
  Sparkles,
  Building
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { downloadJsonBackup } from '../utils/storage';
import { SyncStatus, getDeviceId, getDeviceName } from '../utils/syncService';
import { 
  BackupAlertStatus, 
  getBackupReminderIntervalDays, 
  setBackupReminderIntervalDays, 
  simulateOverdueBackup 
} from '../utils/backupAlertService';
import { toBengaliNumber } from '../utils/formatters';
import { resizeImageFile, PRESET_SHOP_LOGOS } from '../utils/imageUtils';

interface SettingsModalProps {
  profile: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (profile: BusinessProfile) => void;
  onRestoreData: (restoredData: any) => void;
  onResetData: () => void;
  onClearDemoData?: (clearItemsToo: boolean) => void;
  allAppData: any;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
  backupAlertStatus?: BackupAlertStatus;
  onDownloadBackup?: () => void;
  onRefreshBackupStatus?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onRestoreData,
  onResetData,
  onClearDemoData,
  allAppData,
  syncStatus = 'synced',
  onManualSync,
  backupAlertStatus,
  onDownloadBackup,
  onRefreshBackupStatus
}) => {
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [proprietor, setProprietor] = useState(profile.proprietorName || profile.proprietor || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [tagline, setTagline] = useState(profile.tagline || profile.slogan || '');
  const [logo, setLogo] = useState<string>(profile.logo || '');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClearDemo, setShowConfirmClearDemo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<number>(() => getBackupReminderIntervalDays());
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or profile prop changes
  useEffect(() => {
    setBusinessName(profile.businessName || '');
    setProprietor(profile.proprietorName || profile.proprietor || '');
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setTagline(profile.tagline || profile.slogan || '');
    setLogo(profile.logo || '');
  }, [profile, isOpen]);

  const deviceId = getDeviceId();
  const deviceName = getDeviceName();

  const handleIntervalChange = (days: number) => {
    setReminderInterval(days);
    setBackupReminderIntervalDays(days);
    if (onRefreshBackupStatus) onRefreshBackupStatus();
    setSuccessMsg(`ব্যাকআপ রিমাইন্ডার ব্যবধান প্রতি ${toBengaliNumber(days)} দিনে সেট করা হয়েছে।`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleTriggerSimulateAlert = () => {
    simulateOverdueBackup(8);
    if (onRefreshBackupStatus) onRefreshBackupStatus();
    setSuccessMsg('৮ দিন আগের ওভারডিউ ব্যাকআপ টেস্ট সক্রিয় করা হয়েছে। ড্যাশবোর্ডে সতর্কতা ব্যানার দেখুন।');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleManualBackupClick = () => {
    if (onDownloadBackup) {
      onDownloadBackup();
    } else {
      downloadJsonBackup(allAppData);
    }
    setSuccessMsg('সম্পূর্ণ ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!');
    if (onRefreshBackupStatus) onRefreshBackupStatus();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Logo file upload handler
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const dataUrl = await resizeImageFile(file, 256, 256, 0.85);
      setLogo(dataUrl);
      setSuccessMsg('লোগো ছবি নির্বাচন সম্পন্ন হয়েছে! নিচে "দোকানের তথ্য সেভ করুন" বাটনে ক্লিক করুন।');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'লোগো ছবি প্রসেস করা সম্ভব হয়নি।');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
    setSuccessMsg('লোগো মুছে ফেলা হয়েছে। পরিবর্তন নিশ্চিত করতে সেভ করুন।');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProprietor = proprietor.trim();
    onUpdateProfile({
      ...profile,
      businessName: businessName.trim() || 'আমার কাঁচামাল আড়ত',
      proprietor: cleanProprietor,
      proprietorName: cleanProprietor,
      phone: phone.trim(),
      address: address.trim(),
      tagline: tagline.trim(),
      slogan: tagline.trim(),
      logo: logo || undefined
    });
    setSuccessMsg('দোকান ও মালিকের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.version && (parsed.items || parsed.sales)) {
          onRestoreData(parsed);
          setSuccessMsg('ব্যাকআপ ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMsg('অপ্রত্যাশিত ব্যাকআপ ফাইল ফরম্যাট।');
          setTimeout(() => setErrorMsg(''), 4000);
        }
      } catch (err) {
        setErrorMsg('ফাইলটি পড়া যায়নি। সঠিক JSON ফাইল নির্বাচন করুন।');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full sm:max-w-xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-5 my-0 sm:my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                দোকান প্রোফাইল, লোগো ও ডাটা সেটিংস
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                মালিকের নাম, শপের লোগো ও ব্যাকআপ নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Shop & Owner Profile with Logo */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100 dark:border-stone-800">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>দোকান ও মালিকের তথ্য (Shop & Owner)</span>
            </h4>
            <span className="text-[11px] text-stone-400">মেমো ও রশিদে প্রিন্ট হবে</span>
          </div>

          {/* Logo Upload & Picker */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  দোকানের লোগো (Shop Logo)
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  আপনার দোকানের লোগো ছবি আপলোড করুন অথবা রেডিমেড আইকন বেছে নিন।
                </p>
              </div>

              {/* Logo Preview */}
              <div className="shrink-0 flex items-center justify-center">
                {logo ? (
                  logo.startsWith('data:') || logo.startsWith('http') ? (
                    <img 
                      src={logo} 
                      alt="Shop Logo" 
                      className="w-14 h-14 rounded-xl object-contain bg-white border-2 border-emerald-500/40 shadow-xs p-0.5" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-2xl font-bold shadow-xs border-2 border-emerald-500/40">
                      {logo}
                    </div>
                  )
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-700/80 border-2 border-dashed border-stone-300 dark:border-stone-600 flex flex-col items-center justify-center text-stone-400">
                    <Camera className="w-5 h-5 mb-0.5 text-stone-400" />
                    <span className="text-[9px] font-medium">লোগো নেই</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingLogo ? 'প্রসেস হচ্ছে...' : 'লোগো ছবি আপলোড করুন'}</span>
              </button>

              {logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>

            {/* Quick Preset Icons */}
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
              <span className="text-[10px] font-semibold text-stone-500 block mb-1.5">
                অথবা তৈরি আড়ত আইকন থেকে বেছে নিন:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_SHOP_LOGOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLogo(item.icon);
                      setSuccessMsg(`"${item.name}" লোগো আইকন নির্বাচিত হয়েছে!`);
                      setTimeout(() => setSuccessMsg(''), 2500);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      logo === item.icon
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-[11px]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1 text-xs sm:text-sm">
              দোকান / আড়তের নাম
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="যেমন: মেসার্স আল্লাহর দান কাঁচামাল আড়ত"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Owner / Proprietor Name */}
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-emerald-950 dark:text-emerald-300 text-xs sm:text-sm">
                মালিক / স্বত্বাধিকারীর নাম (Owner Name)
              </label>
              {proprietor === 'মো: রফিকুল ইসলাম' && (
                <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full font-bold">
                  ডেমো নাম সক্রিয়
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={proprietor}
                onChange={(e) => setProprietor(e.target.value)}
                placeholder="যেমন: আপনার নিজের নাম লিখুন"
                className="w-full px-3 py-2 pr-20 rounded-lg bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 font-bold text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-500"
                required
              />
              {proprietor === 'মো: রফিকুল ইসলাম' && (
                <button
                  type="button"
                  onClick={() => setProprietor('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 px-2 py-1 rounded font-semibold transition-colors"
                >
                  নাম মুছুন
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
              ক্যাশ মেমো, ইনভয়েস ও রশিদের শীর্ষে "স্বত্বাধিকারী:" হিসেবে এই নামটি প্রিন্ট হবে।
            </p>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৭১২-xxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ঠিকানা ও বাজার এলাকা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: কারওয়ান বাজার, ঢাকা"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1 text-xs sm:text-sm">
              স্লোগান / মেমোর বক্তব্য
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="তাজা ও সতেজ সবজির বিশ্বস্ত আড়ত"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-98"
            >
              দোকান ও মালিকের তথ্য সেভ করুন
            </button>
          </div>
        </form>

        {/* Section 2: Multi-Device Real-Time Cloud Sync */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>একাধিক ডিভাইসে রিয়েল-টাইম লাইভ সিঙ্ক</span>
            </h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              syncStatus === 'synced'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : syncStatus === 'syncing'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-blue-500 animate-ping' : 'bg-amber-500'
              }`} />
              {syncStatus === 'synced' ? 'সিঙ্ক সক্রিয়' : syncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে...' : 'অফলাইন'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                <span>বর্তমান ডিভাইস:</span>
              </span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[200px]">
                {deviceName}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
              <span>ডিভাইস আইডি:</span>
              <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                {deviceId.slice(0, 16)}...
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-medium active:scale-95 transition-all"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'লিংক কপি হয়েছে' : 'অন্য ডিভাইসের জন্য লিংক'}</span>
              </button>

              {onManualSync && (
                <button
                  type="button"
                  onClick={onManualSync}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium active:scale-95 shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>সিঙ্ক চেক</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Backup & Restore Section */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>নিরাপদ ডাটা ব্যাকআপ ও সতর্কতা সিস্টেম (Backup System)</span>
            </h4>
            {backupAlertStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                backupAlertStatus.isAlertActive
                  ? backupAlertStatus.severity === 'critical'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {backupAlertStatus.isAlertActive ? '⚠️ ব্যাকআপ প্রয়োজন' : '✓ ডাটা সুরক্ষিত'}
              </span>
            )}
          </div>
          
          <p className="text-[11px] text-stone-500 leading-relaxed">
            আপনার ব্যবসার সমস্ত হিসাব, বাকি খাতা ও মেমো আপনার ডিভাইসেই অফলাইনে সুরক্ষিত থাকে। কোনো ডিভাইস সমস্যা এড়াতে নিয়মিত ব্যাকআপ ফাইল ডাউনলোড করে রাখা উত্তম।
          </p>

          {/* Backup Alert Status & Frequency Card */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/80 space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-stone-200/60 dark:border-stone-700/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-600 dark:text-stone-300">সর্বশেষ অফলাইন ব্যাকআপ:</span>
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {backupAlertStatus?.lastBackupDate
                  ? `${toBengaliNumber(backupAlertStatus.daysSinceLastBackup || 0)} দিন আগে (${new Date(backupAlertStatus.lastBackupDate).toLocaleDateString('bn-BD')})`
                  : 'এখনও কোনো ম্যানুয়াল ব্যাকআপ নেওয়া হয়নি'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-600 dark:text-stone-300">অটো রিমাইন্ডার ব্যবধান:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[3, 7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleIntervalChange(days)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      reminderInterval === days
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {days === 7 ? 'সাপ্তাহিক (৭ দিন)' : `${toBengaliNumber(days)} দিন`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-500">
              <span>সতর্কতা অ্যালার্ট টেস্ট করুন:</span>
              <button
                type="button"
                onClick={handleTriggerSimulateAlert}
                className="text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium underline underline-offset-2 transition-colors"
                title="সাপ্তাহিক ব্যাকআপ অ্যালার্ট ব্যানার টেস্ট করুন"
              >
                টেস্ট রিমাইন্ডার সক্রিয় করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleManualBackupClick}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>ব্যাকআপ ফাইল ডাউনলোড</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>ব্যাকআপ রিস্টোর</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Clear Demo Data / Start Clean (USER REQUESTED FEATURE) */}
        <div className="pt-4 border-t border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span>সব ডেমো ডাটা মুছে ফেলুন (Delete All Demo Data)</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                আমাদের দেওয়া পরীক্ষামূলক বেচাকেনা, চালান, বাকি খাতা ও খরচের হিসাব মুছে সম্পূর্ণ নতুন ফ্রেশ খাতা শুরু করুন।
              </p>
            </div>

            {!showConfirmClearDemo && (
              <button
                type="button"
                onClick={() => setShowConfirmClearDemo(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0"
              >
                ডাটা মুছুন
              </button>
            )}
          </div>

          {/* Delete Demo Confirmation Card */}
          {showConfirmClearDemo && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                    আপনি কি সব ডেমো হিসাব মুছে ফ্রেশ খাতা তৈরি করতে চান?
                  </h5>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-1 leading-relaxed">
                    নিচের যে কোনো একটি বিকল্প বেছে নিন:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onClearDemoData) onClearDemoData(false);
                    setShowConfirmClearDemo(false);
                    setSuccessMsg('সমস্ত ডেমো কেনাবেচা ও বাকি সফলভাবে মুছে ফ্রেশ খাতা প্রস্তুত হয়েছে!');
                    setTimeout(() => setSuccessMsg(''), 4000);
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border-2 border-emerald-600 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all shadow-xs"
                >
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                    <span>১. শুধু লেনদেন ও বাকি মুছুন</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">বাঞ্ছনীয়</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                    সবজির তালিকা অক্ষুণ্ণ থাকবে কিন্তু স্টক ০ কেজি হবে। আপনাকে নতুন করে সবজির নাম লিখতে হবে না।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onClearDemoData) onClearDemoData(true);
                    setShowConfirmClearDemo(false);
                    setSuccessMsg('সবকিছু সম্পূর্ণ শূন্য করে ফ্রেশ খাতা তৈরি করা হয়েছে!');
                    setTimeout(() => setSuccessMsg(''), 4000);
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-rose-300 dark:border-rose-800 text-left hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all shadow-xs"
                >
                  <div className="font-bold text-rose-700 dark:text-rose-300 text-xs">
                    ২. সম্পূর্ণ খালি খাতা (Empty All)
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                    সবজির তালিকাসহ সমস্ত রেকর্ড সম্পূর্ণ ০ করে দিন।
                  </p>
                </button>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmClearDemo(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-300 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}

          {/* Optional Sample Data Restore */}
          <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500">
            <span>পরীক্ষার জন্য নমুনা ডাটায় ফিরতে চান?</span>
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 transition-colors"
              >
                নমুনা ডেমো ডাটা লোড করুন
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px]"
                >
                  না
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setShowConfirmReset(false);
                    setSuccessMsg('নমুনা ডেমো ডাটা পুনরায় লোড করা হয়েছে!');
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }}
                  className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]"
                >
                  হ্যাঁ, ডেমো আনুন
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
