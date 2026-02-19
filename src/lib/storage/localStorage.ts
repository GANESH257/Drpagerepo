/**
 * Generic localStorage helpers - SSR-safe
 * 
 * All functions check for browser environment and never throw errors.
 * Returns safe fallbacks on SSR or errors.
 */

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Read JSON from localStorage with fallback
 * 
 * @param key localStorage key
 * @param fallback Value to return if key doesn't exist or on error
 * @returns Parsed JSON value or fallback
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return fallback;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Error reading JSON from localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Write JSON to localStorage
 * 
 * @param key localStorage key
 * @param value Value to serialize and store
 */
export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing JSON to localStorage key "${key}":`, error);
  }
}

/**
 * Remove key from localStorage
 * 
 * @param key localStorage key to remove
 */
export function removeKey(key: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Append item to array in localStorage (prepend for newest first)
 * 
 * @param key localStorage key
 * @param item Item to add
 * @param maxItems Optional maximum items to keep (keeps latest)
 */
export function appendToArray<T>(key: string, item: T, maxItems?: number): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const existing = readJSON<T[]>(key, []);
    const updated = [item, ...existing];
    
    // Cap array size if maxItems specified
    const final = maxItems ? updated.slice(0, maxItems) : updated;
    
    writeJSON(key, final);
  } catch (error) {
    console.error(`Error appending to array in localStorage key "${key}":`, error);
  }
}

/**
 * Update array item by ID
 * 
 * @param key localStorage key
 * @param id Item ID to find
 * @param patch Partial update to apply
 */
export function updateArrayItemById<T extends { id: string }>(
  key: string,
  id: string,
  patch: Partial<T>
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const existing = readJSON<T[]>(key, []);
    const updated = existing.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    writeJSON(key, updated);
  } catch (error) {
    console.error(`Error updating array item in localStorage key "${key}":`, error);
  }
}
