/**
 * Safe Browser LocalStorage Utility with in-memory fallback.
 * Strictly used for client-side demo state persistence.
 */

const memoryCache = new Map<string, string>();

function isStorageAvailable(): boolean {
  try {
    const testKey = '__car911_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = typeof window !== 'undefined' && isStorageAvailable();

export const STORAGE_KEYS = {
  FAVORITES: 'car911_demo_favorites',
  COMPARISON: 'car911_demo_comparison',
  RECENTLY_VIEWED: 'car911_demo_recently_viewed',
  BOOKINGS: 'car911_demo_bookings',
  SESSION: 'car911_demo_session',
  FILTERS: 'car911_demo_filters',
  REGISTERED_USERS: 'car911_demo_users',
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (storageAvailable) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
    } else {
      const memoryRaw = memoryCache.get(key);
      if (memoryRaw !== undefined) {
        return JSON.parse(memoryRaw) as T;
      }
    }
  } catch (error) {
    console.warn(`[Car 911 Storage] Failed to read key "${key}":`, error);
  }
  return defaultValue;
}

export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (storageAvailable) {
      window.localStorage.setItem(key, serialized);
    } else {
      memoryCache.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.warn(`[Car 911 Storage] Failed to write key "${key}":`, error);
    return false;
  }
}

export function removeStorageItem(key: string): void {
  try {
    if (storageAvailable) {
      window.localStorage.removeItem(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.warn(`[Car 911 Storage] Failed to delete key "${key}":`, error);
  }
}

export function clearAllDemoStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorageItem(key);
  });
  memoryCache.clear();
}
