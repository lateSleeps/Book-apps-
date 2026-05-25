import { useEffect, useState } from 'react';

/**
 * Hook for managing local storage
 * Automatically syncs with localStorage and handles hydration
 *
 * @example
 * const [name, setName] = useLocalStorage('name', 'default');
 * // Changes to 'name' state will be saved to localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  // Write to localStorage when value changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return isHydrated ? [storedValue, setValue] : [initialValue, setValue];
}
