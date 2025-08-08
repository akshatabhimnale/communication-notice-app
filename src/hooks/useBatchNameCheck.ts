import { useState, useEffect, useCallback } from 'react';
import { checkBatchNameAvailability } from '@/services/noticeService';
import { BatchNameCheckResponse } from '@/types/noticeTypesInterface';

interface UseBatchNameCheckReturn {
  isChecking: boolean;
  result: BatchNameCheckResponse | null;
  error: string | null;
  checkBatchName: (name: string) => void;
  clearResult: () => void;
}

// Helper to generate N unique suggestions with random 3–5 digit numeric suffixes
const generateRandomSuggestions = (rawName: string, count = 4): string[] => {
  const base = (rawName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'batch';

  const suggestions = new Set<string>();

  const randDigits = (): string => {
    const len = Math.floor(Math.random() * 3) + 3; // 3..5
    const min = 10 ** (len - 1);
    const max = 10 ** len - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  };

  let guard = 0;
  while (suggestions.size < count && guard < 100) {
    guard++;
    suggestions.add(`${base}_${randDigits()}`);
  }

  return Array.from(suggestions);
};

const useBatchNameCheck = (debounceMs: number = 500): UseBatchNameCheckReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<BatchNameCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debouncedName, setDebouncedName] = useState<string>('');

  // Debounce the batch name input
  const checkBatchName = useCallback((name: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      setResult(null);
      setError(null);
      setDebouncedName('');
      return;
    }
    setDebouncedName(trimmed);
  }, []);

  // Clear results
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setIsChecking(false);
  }, []);

  // Effect to handle debounced API calls
  useEffect(() => {
    if (!debouncedName.trim()) {
      clearResult();
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await checkBatchNameAvailability(debouncedName);

        if (!response.available) {
          const suggestions = generateRandomSuggestions(debouncedName, 4);
          setResult({ ...response, suggestions });
        } else {
          setResult(response);
        }
      } catch (err) {
        console.error('Batch name check error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to check batch name availability'
        );
        setResult(null);
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [debouncedName, debounceMs, clearResult]);

  return {
    isChecking,
    result,
    error,
    checkBatchName,
    clearResult,
  };
};

export default useBatchNameCheck;
