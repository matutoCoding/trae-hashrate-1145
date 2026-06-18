export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    const parsed = JSON.parse(item);
    return parseDates(parsed) as T;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

const parseDates = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    if (isIsoDateString(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => parseDates(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = parseDates(value);
    }
    return result;
  }

  return obj;
};

const isIsoDateString = (str: string): boolean => {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
  if (!isoDateRegex.test(str)) {
    return false;
  }
  const date = new Date(str);
  return !isNaN(date.getTime());
};

export const STORAGE_KEYS = {
  RATES: 'billiards_rates',
  TABLES: 'billiards_tables',
  SESSIONS: 'billiards_sessions',
  BILLS: 'billiards_bills',
  QUEUE: 'billiards_queue',
  MEMBERS: 'billiards_members',
  QUEUE_COUNTER: 'billiards_queue_counter',
  STATS: 'billiards_stats',
} as const;
