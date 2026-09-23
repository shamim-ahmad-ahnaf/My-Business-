import { getLastSuccessfulSyncTime } from './syncService';

export const BACKUP_STORAGE_KEYS = {
  LAST_MANUAL_BACKUP: 'kachamal_last_manual_backup_time_v1',
  REMINDER_INTERVAL_DAYS: 'kachamal_backup_reminder_interval_days_v1',
  SNOOZED_UNTIL: 'kachamal_backup_alert_snoozed_until_v1'
} as const;

export interface BackupAlertStatus {
  isAlertActive: boolean;
  daysSinceLastBackup: number | null;
  daysSinceLastSync: number | null;
  lastBackupDate: Date | null;
  lastSyncDate: Date | null;
  intervalDays: number;
  severity: 'normal' | 'warning' | 'critical';
  reason: 'never_backed_up' | 'overdue_no_sync' | 'overdue_periodic' | 'none';
  isSnoozed: boolean;
  snoozedUntil: Date | null;
}

/**
 * Record that a manual backup has been downloaded by the user
 */
export function recordManualBackup(): Date {
  const now = new Date();
  localStorage.setItem(BACKUP_STORAGE_KEYS.LAST_MANUAL_BACKUP, now.toISOString());
  localStorage.removeItem(BACKUP_STORAGE_KEYS.SNOOZED_UNTIL);
  return now;
}

/**
 * Get timestamp of the last manual backup
 */
export function getLastManualBackupTime(): Date | null {
  const raw = localStorage.getItem(BACKUP_STORAGE_KEYS.LAST_MANUAL_BACKUP);
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Get configured reminder interval (default: 7 days / weekly)
 */
export function getBackupReminderIntervalDays(): number {
  const raw = localStorage.getItem(BACKUP_STORAGE_KEYS.REMINDER_INTERVAL_DAYS);
  if (!raw) return 7;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed <= 0 ? 7 : parsed;
}

/**
 * Set reminder interval (e.g. 3, 7, 14, 30 days)
 */
export function setBackupReminderIntervalDays(days: number): void {
  localStorage.setItem(BACKUP_STORAGE_KEYS.REMINDER_INTERVAL_DAYS, days.toString());
}

/**
 * Snooze alert for N days (default 2 days)
 */
export function snoozeBackupAlert(days: number = 2): void {
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  localStorage.setItem(BACKUP_STORAGE_KEYS.SNOOZED_UNTIL, until.toISOString());
}

/**
 * Clear snooze
 */
export function clearBackupAlertSnooze(): void {
  localStorage.removeItem(BACKUP_STORAGE_KEYS.SNOOZED_UNTIL);
}

/**
 * Check if the backup alert should be shown to the user.
 * 
 * Rules:
 * 1. If alert is currently snoozed, return inactive.
 * 2. If user has never backed up manually, alert after interval or if no recent sync.
 * 3. If days since last manual backup >= intervalDays (e.g., 7 days):
 *    - If no recent sync in the last 2 days, or device is offline: Critical Warning.
 *    - Otherwise: Routine Weekly Reminder Warning.
 */
export function checkBackupAlertStatus(): BackupAlertStatus {
  const now = new Date();
  const intervalDays = getBackupReminderIntervalDays();
  const lastBackup = getLastManualBackupTime();
  const lastSync = getLastSuccessfulSyncTime();

  // Check snooze
  const snoozedRaw = localStorage.getItem(BACKUP_STORAGE_KEYS.SNOOZED_UNTIL);
  let isSnoozed = false;
  let snoozedUntil: Date | null = null;
  if (snoozedRaw) {
    const parsed = new Date(snoozedRaw);
    if (!isNaN(parsed.getTime()) && parsed > now) {
      isSnoozed = true;
      snoozedUntil = parsed;
    }
  }

  // Calculate days since last backup
  let daysSinceLastBackup: number | null = null;
  if (lastBackup) {
    const diffMs = now.getTime() - lastBackup.getTime();
    daysSinceLastBackup = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Calculate days since last sync
  let daysSinceLastSync: number | null = null;
  if (lastSync) {
    const diffMs = now.getTime() - lastSync.getTime();
    daysSinceLastSync = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } else {
    daysSinceLastSync = 999;
  }

  // Determine if alert is active
  if (isSnoozed) {
    return {
      isAlertActive: false,
      daysSinceLastBackup,
      daysSinceLastSync,
      lastBackupDate: lastBackup,
      lastSyncDate: lastSync,
      intervalDays,
      severity: 'normal',
      reason: 'none',
      isSnoozed: true,
      snoozedUntil
    };
  }

  // Case 1: Never manually backed up
  if (!lastBackup) {
    // If sync hasn't occurred recently or at least 1 day has passed
    const isNoRecentSync = daysSinceLastSync === null || daysSinceLastSync >= 2 || !navigator.onLine;
    return {
      isAlertActive: true,
      daysSinceLastBackup: null,
      daysSinceLastSync,
      lastBackupDate: null,
      lastSyncDate: lastSync,
      intervalDays,
      severity: isNoRecentSync ? 'critical' : 'warning',
      reason: 'never_backed_up',
      isSnoozed: false,
      snoozedUntil: null
    };
  }

  // Case 2: Last backup exceeds interval (e.g. 7+ days)
  if (daysSinceLastBackup !== null && daysSinceLastBackup >= intervalDays) {
    const isNoRecentSync = daysSinceLastSync === null || daysSinceLastSync >= 2 || !navigator.onLine;
    return {
      isAlertActive: true,
      daysSinceLastBackup,
      daysSinceLastSync,
      lastBackupDate: lastBackup,
      lastSyncDate: lastSync,
      intervalDays,
      severity: isNoRecentSync || (daysSinceLastBackup >= (intervalDays * 2)) ? 'critical' : 'warning',
      reason: isNoRecentSync ? 'overdue_no_sync' : 'overdue_periodic',
      isSnoozed: false,
      snoozedUntil: null
    };
  }

  // Case 3: All good
  return {
    isAlertActive: false,
    daysSinceLastBackup,
    daysSinceLastSync,
    lastBackupDate: lastBackup,
    lastSyncDate: lastSync,
    intervalDays,
    severity: 'normal',
    reason: 'none',
    isSnoozed: false,
    snoozedUntil: null
  };
}

/**
 * Helper to simulate an overdue state for demonstration/testing
 */
export function simulateOverdueBackup(daysAgo: number = 8): void {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  localStorage.setItem(BACKUP_STORAGE_KEYS.LAST_MANUAL_BACKUP, d.toISOString());
  localStorage.removeItem(BACKUP_STORAGE_KEYS.SNOOZED_UNTIL);
}
