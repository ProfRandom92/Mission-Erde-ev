/**
 * Safe localStorage utilities with error handling
 */

/**
 * Safely get item from localStorage
 */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get item from localStorage: ${key}`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Try to clear old data
      try {
        localStorage.clear();
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    console.error(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Get and parse JSON from localStorage
 */
export function getStorageJSON<T>(key: string, defaultValue: T): T {
  const item = getStorageItem(key);
  if (!item) return defaultValue;

  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse JSON from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Stringify and set JSON in localStorage
 */
export function setStorageJSON<T>(key: string, value: T): boolean {
  try {
    const json = JSON.stringify(value);
    return setStorageItem(key, json);
  } catch (error) {
    console.error(`Failed to stringify JSON for localStorage: ${key}`, error);
    return false;
  }
}
