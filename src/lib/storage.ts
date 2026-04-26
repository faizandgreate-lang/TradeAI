export const API_KEY_STORAGE_KEY = 'trading_aios_gemini_key';
export const HISTORY_STORAGE_KEY = 'trading_aios_history';

export interface PredictionHistoryItem {
  id: string;
  assetType: string;
  pair: string;
  timeframe: string;
  direction: 'UP' | 'DOWN';
  confidence: number;
  reasoning: string;
  timestamp: number;
}

export function getApiKey(): string | null {
  const DEFAULT_KEY = 'AIzaSyCMedL_uM6Tt96-5vuYXC6fwiodXWai38E';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || DEFAULT_KEY;
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function getHistory(): PredictionHistoryItem[] {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addHistoryItem(item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>): PredictionHistoryItem {
  const history = getHistory();
  const newItem: PredictionHistoryItem = {
    ...item,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  // Keep only the latest 50 predictions
  const updatedHistory = [newItem, ...history].slice(0, 50);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  return newItem;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
