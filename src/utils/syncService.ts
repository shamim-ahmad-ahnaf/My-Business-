import { doc, onSnapshot, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  VegetableItem, 
  SaleRecord, 
  PurchaseRecord, 
  Customer, 
  Supplier, 
  BusinessExpense, 
  SpoilageRecord, 
  MarketRate, 
  BusinessProfile, 
  BusinessNotification,
  PaymentTransaction 
} from '../types';
import { playNotificationSound } from './storage';

export const STORE_DOC_ID = 'main_store';

export interface AppSyncData {
  profile?: BusinessProfile;
  items?: VegetableItem[];
  sales?: SaleRecord[];
  purchases?: PurchaseRecord[];
  customers?: Customer[];
  suppliers?: Supplier[];
  expenses?: BusinessExpense[];
  spoilages?: SpoilageRecord[];
  marketRates?: MarketRate[];
  notifications?: BusinessNotification[];
  transactions?: PaymentTransaction[];
  lastUpdated?: string;
  updatedBy?: string;
  deviceName?: string;
}

// Get or create persistent device ID
export function getDeviceId(): string {
  const STORAGE_DEVICE_KEY = 'kachamal_device_id_v1';
  let devId = localStorage.getItem(STORAGE_DEVICE_KEY);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_DEVICE_KEY, devId);
  }
  return devId;
}

// Get friendly device name (e.g. "কম্পিউটার (Chrome)", "মোবাইল")
export function getDeviceName(): string {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile ? 'মোবাইল ডিভাইস' : 'কম্পিউটার/ডেস্কটপ';
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

const STORAGE_LAST_SYNC_KEY = 'kachamal_last_successful_sync_time_v1';

function readStoredSyncTime(): Date | null {
  try {
    const stored = localStorage.getItem(STORAGE_LAST_SYNC_KEY);
    if (stored) {
      const d = new Date(stored);
      if (!isNaN(d.getTime())) return d;
    }
  } catch (e) {
    // Ignore storage reading errors
  }
  return null;
}

let lastSyncTimestamp: Date | null = readStoredSyncTime();
let syncStatusListeners: Array<(status: SyncStatus, lastSyncTime?: Date) => void> = [];
let currentSyncStatus: SyncStatus = 'synced';

export function getLastSuccessfulSyncTime(): Date | null {
  return lastSyncTimestamp || readStoredSyncTime();
}

export function registerSyncStatusListener(listener: (status: SyncStatus, lastSyncTime?: Date) => void) {
  syncStatusListeners.push(listener);
  listener(currentSyncStatus, lastSyncTimestamp || undefined);
  return () => {
    syncStatusListeners = syncStatusListeners.filter(l => l !== listener);
  };
}

function updateSyncStatus(status: SyncStatus) {
  currentSyncStatus = status;
  if (status === 'synced') {
    lastSyncTimestamp = new Date();
    try {
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, lastSyncTimestamp.toISOString());
    } catch (e) {
      // Ignore storage write errors
    }
  }
  syncStatusListeners.forEach(listener => listener(status, lastSyncTimestamp || undefined));
}

/**
 * Strips all undefined properties recursively so Firestore setDoc never fails with unsupported undefined field value.
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: AppSyncData = {};

/**
 * Push local changes to Firestore so all other devices receive updates in real-time.
 * Uses a short debounce to bundle rapid sequential state changes.
 */
export function pushToCloud(updates: Partial<AppSyncData>) {
  if (!navigator.onLine) {
    updateSyncStatus('offline');
    return;
  }

  pendingPayload = {
    ...pendingPayload,
    ...updates,
    lastUpdated: new Date().toISOString(),
    updatedBy: getDeviceId(),
    deviceName: getDeviceName()
  };

  updateSyncStatus('syncing');

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      const storeDocRef = doc(db, 'stores', STORE_DOC_ID);
      const cleanData = sanitizeForFirestore(pendingPayload);
      await setDoc(storeDocRef, cleanData, { merge: true });
      updateSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync to Firestore cloud:', err);
      updateSyncStatus('error');
    }
  }, 400);
}

/**
 * Subscribe to real-time updates from Firestore.
 * Triggers callback only when remote devices make changes.
 */
export function subscribeToCloudUpdates(
  onRemoteUpdate: (data: AppSyncData) => void
): () => void {
  const myDeviceId = getDeviceId();
  const storeDocRef = doc(db, 'stores', STORE_DOC_ID);

  const unsubscribe = onSnapshot(
    storeDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data() as AppSyncData;
      
      // If this update originated from another device, apply it locally!
      if (data && data.updatedBy && data.updatedBy !== myDeviceId) {
        console.log('Received real-time update from remote device:', data.deviceName || data.updatedBy);
        onRemoteUpdate(data);
        updateSyncStatus('synced');
        playNotificationSound();
      }
    },
    (error) => {
      console.error('Firestore snapshot listener error:', error);
      updateSyncStatus(navigator.onLine ? 'error' : 'offline');
    }
  );

  return unsubscribe;
}

/**
 * Force fetch the latest data from the cloud on initial launch or manual sync button click.
 */
export async function forceFetchFromCloud(): Promise<AppSyncData | null> {
  if (!navigator.onLine) {
    updateSyncStatus('offline');
    return null;
  }

  try {
    updateSyncStatus('syncing');
    const storeDocRef = doc(db, 'stores', STORE_DOC_ID);
    const snap = await getDoc(storeDocRef);
    if (snap.exists()) {
      updateSyncStatus('synced');
      return snap.data() as AppSyncData;
    }
    updateSyncStatus('synced');
    return null;
  } catch (err) {
    console.error('Error force fetching from cloud:', err);
    updateSyncStatus('error');
    return null;
  }
}
