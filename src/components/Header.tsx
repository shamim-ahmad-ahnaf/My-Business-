import React, { useState, useRef, useEffect } from 'react';
import { 
  Store, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun, 
  Bell, 
  PlusCircle,
  Menu,
  X,
  Settings,
  CheckCheck,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Boxes,
  Users,
  Wallet,
  QrCode,
  Calculator,
  Cloud,
  CloudOff,
  RefreshCw,
  ShieldAlert,
  Edit3,
  User
} from 'lucide-react';
import { BusinessProfile, BusinessNotification } from '../types';
import { formatBanglaDate, toBengaliNumber } from '../utils/formatters';
import { SyncStatus } from '../utils/syncService';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: BusinessProfile;
  notifications: BusinessNotification[];
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isOnline: boolean;
  onOpenSettings: () => void;
  onOpenQrScanner?: () => void;
  onOpenCalculator?: () => void;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  notifications,
  onMarkAsRead,
  onClearNotifications,
  darkMode,
  setDarkMode,
  isOnline,
  onOpenSettings,
  onOpenQrScanner,
  onOpenCalculator,
  syncStatus = 'synced',
  onManualSync
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
    { id: 'sales', label: 'বিক্রি ও মেমো', icon: '🛒' },
    { id: 'purchases', label: 'মোকাম ক্রয়/চালান', icon: '📦' },
    { id: 'inventory', label: 'মজুত সবজি/স্টক', icon: '🥬' },
    { id: 'parties', label: 'বাকি খাতা', icon: '📒' },
    { id: 'reports', label: 'লাভ-ক্ষতি রিপোর্ট', icon: '📈' },
    { id: 'rates', label: 'দৈনিক বাজার দর', icon: '🏷️' },
    { id: 'payments', label: 'পেমেন্ট ট্র্যাকার', icon: '💳' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        
        {/* Top Tier */}
        <div className="flex items-center justify-between h-14 sm:h-18">
          
          {/* Brand Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-hidden"
              aria-label="ন্যাভিগেশন মেনু"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
            >
              {/* Shop Logo / Icon */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0 overflow-hidden relative border border-emerald-500/30">
                {profile.logo ? (
                  profile.logo.startsWith('data:') || profile.logo.startsWith('http') ? (
                    <img 
                      src={profile.logo} 
                      alt={profile.businessName} 
                      className="w-full h-full object-cover bg-white" 
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl select-none leading-none">{profile.logo}</span>
                  )
                ) : (
                  <Store className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm sm:text-base lg:text-lg text-stone-900 dark:text-stone-100 leading-tight truncate">
                    {profile.businessName}
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1">
                    <span className="text-stone-500 dark:text-stone-400">স্বত্বাধিকারী:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {profile.proprietorName || profile.proprietor || 'মালিকের নাম দিন'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSettings();
                      }}
                      className="p-0.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors"
                      title="দোকানের মালিকের নাম ও লোগো পরিবর্তন করুন"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </span>

                  {(profile.proprietorName === 'মো: রফিকুল ইসলাম' || profile.proprietor === 'মো: রফিকুল ইসলাম') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSettings();
                      }}
                      className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors"
                      title="ক্লিক করে নিজের নাম সেট করুন"
                    >
                      নাম এডিট
                    </button>
                  )}

                  {!isOnline && (
                    <span className="text-amber-600 dark:text-amber-400 text-[10px] font-medium flex items-center gap-0.5">
                      • অফলাইন
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Multi-Device Live Cloud Sync Badge & Button */}
            <button 
              onClick={onManualSync}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                syncStatus === 'syncing'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  : syncStatus === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : syncStatus === 'offline'
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
              title={
                syncStatus === 'syncing'
                  ? 'অন্য ডিভাইসের সাথে ডাটা সিঙ্ক হচ্ছে...'
                  : syncStatus === 'synced'
                  ? 'একাধিক ডিভাইসে রিয়েল-টাইম সিঙ্ক চালু আছে। ক্লিক করে এখনই সিঙ্ক রিফ্রেশ করুন।'
                  : 'অফলাইন মোড - ডাটা ডিভাইসে সংরক্ষিত আছে'
              }
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="hidden sm:inline">সিঙ্ক হচ্ছে...</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <div className="relative">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <span className="hidden lg:inline">ডিভাইস সিঙ্কড</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">অফলাইন</span>
                </>
              )}
            </button>

            {/* Quick Calculator Button */}
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="flex items-center justify-center gap-1.5 h-9 px-2 sm:h-10 sm:px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
                title="আড়ত হিসাব ক্যালকুলেটর"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">ক্যালকুলেটর</span>
              </button>
            )}

            {/* QR Code Scanner Button */}
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                className="flex items-center justify-center gap-1.5 h-9 px-2 sm:h-10 sm:px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
                title="ক্যামেরা দিয়ে মেমো কিউআর স্ক্যান করুন"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">কিউআর স্ক্যান</span>
              </button>
            )}

            {/* Quick POS Sale Button (Desktop/Tablet) */}
            <button
              onClick={() => setActiveTab('sales')}
              className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন বিক্রি মেমো</span>
            </button>

            {/* Notification Dropdown Container */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="নোটিফিকেশন ও অ্যালার্ট"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {toBengaliNumber(unreadCount)}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <>
                  {/* Mobile backdrop for outside tap */}
                  <div 
                    className="fixed inset-0 z-40 sm:hidden bg-black/40 backdrop-blur-2xs" 
                    onClick={() => setShowNotifDropdown(false)} 
                  />
                  <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-15 sm:top-full sm:right-0 mt-1 sm:mt-2 w-auto sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60">
                      <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        <span>নোটিফিকেশন ও সতর্কতা</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={onClearNotifications}
                            className="text-[11px] text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>মুছে ফেলুন</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          className="sm:hidden p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                    {notifications.slice(0, 10).map((n) => {
                      const isUnread = !n.read && !n.isRead;
                      return (
                        <div 
                          key={n.id}
                          onClick={() => onMarkAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${
                            isUnread ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              {n.type === 'stock' && <Boxes className="w-3.5 h-3.5 text-amber-500" />}
                              {n.type === 'sale' && <Receipt className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.type === 'backup' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                              {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                              {n.type === 'due' && <Wallet className="w-3.5 h-3.5 text-blue-500" />}
                              <span>{n.title}</span>
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-stone-400 mt-1 block">
                            {formatBanglaDate(n.date || n.timestamp || new Date().toISOString(), true)}
                          </span>
                        </div>
                      );
                    })}

                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-xs text-stone-400">
                        কোনো নতুন নোটিফিকেশন নেই
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-600" />}
            </button>

            {/* Settings & Profile Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
              title="দোকানের প্রোফাইল ও ডাটা ব্যাকআপ"
            >
              <Settings className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            </button>

          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 py-1.5 border-t border-stone-100 dark:border-stone-800/60 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-3 shadow-xl transition-all">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Mobile Tools */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {onOpenCalculator && (
              <button
                onClick={() => {
                  onOpenCalculator();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>ক্যালকুলেটর</span>
              </button>
            )}

            {onOpenQrScanner && (
              <button
                onClick={() => {
                  onOpenQrScanner();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>কিউআর স্ক্যান</span>
              </button>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
            <span>{profile.proprietorName || profile.proprietor}</span>
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              দোকান সেটিংস ও ব্যাকআপ
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
