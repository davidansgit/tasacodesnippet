/**
 * Cache management utilities for localStorage and sessionStorage
 * Provides a unified interface for caching data with expiration
 */

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
  hash?: string;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  version: string; // Cache version for invalidation
  storage: "localStorage" | "sessionStorage";
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  version?: string; // Cache version (default: '1.0.0')
  storage?: "localStorage" | "sessionStorage"; // Storage type (default: 'localStorage')
  forceRefresh?: boolean; // Force refresh even if cache exists
}

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: Required<CacheOptions> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  version: "1.0.0",
  storage: "localStorage",
  forceRefresh: false,
};

/**
 * Get the appropriate storage object
 */
function getStorage(
  storageType: "localStorage" | "sessionStorage"
): Storage | null {
  if (typeof window === "undefined") {
    return null; // Server-side rendering
  }

  try {
    return storageType === "localStorage" ? localStorage : sessionStorage;
  } catch (error) {
    console.error(`Error accessing ${storageType}:`, error);
    return null;
  }
}

/**
 * Check if cache item is expired
 */
function isExpired(item: CacheItem): boolean {
  return Date.now() > item.expiresAt;
}

/**
 * Check if cache item version is outdated
 */
function isVersionOutdated(item: CacheItem, currentVersion: string): boolean {
  return item.version !== currentVersion;
}

/**
 * Set data in cache
 */
export function setCacheData<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): boolean {
  try {
    const config = { ...DEFAULT_CACHE_CONFIG, ...options };
    const storage = getStorage(config.storage);

    if (!storage) {
      console.warn("Storage not available");
      return false;
    }

    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + config.ttl,
      version: config.version,
    };

    const jsonData = JSON.stringify(cacheItem);
    storage.setItem(key, jsonData);

    return true;
  } catch (error) {
    console.error("Error setting cache data:", error);
    return false;
  }
}

/**
 * Get data from cache
 */
export function getCacheData<T>(
  key: string,
  options: CacheOptions = {}
): T | null {
  try {
    const config = { ...DEFAULT_CACHE_CONFIG, ...options };
    const storage = getStorage(config.storage);

    if (!storage) {
      console.warn("Storage not available");
      return null;
    }

    const cachedData = storage.getItem(key);
    if (!cachedData) {
      return null;
    }

    const cacheItem: CacheItem<T> = JSON.parse(cachedData);

    // Check if expired
    if (isExpired(cacheItem)) {
      storage.removeItem(key);
      return null;
    }

    // Check version
    if (isVersionOutdated(cacheItem, config.version)) {
      storage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error("Error getting cache data:", error);
    return null;
  }
}

/**
 * Remove data from cache
 */
export function removeCacheData(
  key: string,
  storage: "localStorage" | "sessionStorage" = "localStorage"
): boolean {
  try {
    const storageObj = getStorage(storage);
    if (!storageObj) {
      return false;
    }

    storageObj.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing cache data:", error);
    return false;
  }
}

/**
 * Clear all cache data
 */
export function clearAllCache(
  storage: "localStorage" | "sessionStorage" = "localStorage"
): boolean {
  try {
    const storageObj = getStorage(storage);
    if (!storageObj) {
      return false;
    }

    // Get all keys that start with our cache prefix
    const keys = Object.keys(storageObj);
    const cacheKeys = keys.filter((key) => key.startsWith("tasa_cache_"));

    cacheKeys.forEach((key) => {
      storageObj.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(
  storage: "localStorage" | "sessionStorage" = "localStorage"
): {
  totalKeys: number;
  cacheKeys: number;
  expiredKeys: number;
  totalSize: number;
} {
  try {
    const storageObj = getStorage(storage);
    if (!storageObj) {
      return { totalKeys: 0, cacheKeys: 0, expiredKeys: 0, totalSize: 0 };
    }

    const keys = Object.keys(storageObj);
    const cacheKeys = keys.filter((key) => key.startsWith("tasa_cache_"));
    let expiredKeys = 0;
    let totalSize = 0;

    cacheKeys.forEach((key) => {
      try {
        const cachedData = storageObj.getItem(key);
        if (cachedData) {
          totalSize += cachedData.length;
          const cacheItem: CacheItem = JSON.parse(cachedData);
          if (isExpired(cacheItem)) {
            expiredKeys++;
          }
        }
      } catch (error) {
        console.error(`Error parsing cache item ${key}:`, error);
      }
    });

    return {
      totalKeys: keys.length,
      cacheKeys: cacheKeys.length,
      expiredKeys,
      totalSize,
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return { totalKeys: 0, cacheKeys: 0, expiredKeys: 0, totalSize: 0 };
  }
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredCache(
  storage: "localStorage" | "sessionStorage" = "localStorage"
): number {
  try {
    const storageObj = getStorage(storage);
    if (!storageObj) {
      return 0;
    }

    const keys = Object.keys(storageObj);
    const cacheKeys = keys.filter((key) => key.startsWith("tasa_cache_"));
    let removedCount = 0;

    cacheKeys.forEach((key) => {
      try {
        const cachedData = storageObj.getItem(key);
        if (cachedData) {
          const cacheItem: CacheItem = JSON.parse(cachedData);
          if (isExpired(cacheItem)) {
            storageObj.removeItem(key);
            removedCount++;
          }
        }
      } catch (error) {
        console.error(`Error cleaning up cache item ${key}:`, error);
        // Remove corrupted cache entries
        storageObj.removeItem(key);
        removedCount++;
      }
    });

    return removedCount;
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    return 0;
  }
}

/**
 * Check if cache exists and is valid
 */
export function hasValidCache(
  key: string,
  options: CacheOptions = {}
): boolean {
  const config = { ...DEFAULT_CACHE_CONFIG, ...options };
  const storage = getStorage(config.storage);

  if (!storage) {
    return false;
  }

  try {
    const cachedData = storage.getItem(key);
    if (!cachedData) {
      return false;
    }

    const cacheItem: CacheItem = JSON.parse(cachedData);

    return (
      !isExpired(cacheItem) && !isVersionOutdated(cacheItem, config.version)
    );
  } catch (error) {
    console.error("Error checking cache validity:", error);
    return false;
  }
}
