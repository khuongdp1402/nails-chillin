import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ServiceCategory } from '../types';

export type ServiceMode = 'nail' | 'headspa' | 'both';

const MODE_KEY = 'aura_mode_v1';
const MODE_TTL_MS = 24 * 60 * 60 * 1000;

interface ModeContextValue {
  mode: ServiceMode | null;
  setMode: (m: ServiceMode) => void;
  clearMode: () => void;
  showsCategory: (c: ServiceCategory) => boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

function readMode(): ServiceMode | null {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { mode?: unknown; expiresAt?: unknown };
    const valid = parsed.mode === 'nail' || parsed.mode === 'headspa' || parsed.mode === 'both';
    if (!valid || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(MODE_KEY);
      return null;
    }
    return parsed.mode as ServiceMode;
  } catch {
    return null;
  }
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ServiceMode | null>(() => readMode());

  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'visible') setModeState(readMode());
    };
    setModeState(readMode());
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, []);

  const setMode = useCallback((m: ServiceMode) => {
    try {
      localStorage.setItem(MODE_KEY, JSON.stringify({ mode: m, expiresAt: Date.now() + MODE_TTL_MS }));
    } catch {
      /* ignore */
    }
    setModeState(m);
  }, []);

  const clearMode = useCallback(() => {
    try {
      localStorage.removeItem(MODE_KEY);
    } catch {
      /* ignore */
    }
    setModeState(null);
  }, []);

  const showsCategory = useCallback(
    (c: ServiceCategory) => mode === null || mode === 'both' || mode === c,
    [mode],
  );

  const value = useMemo(
    () => ({ mode, setMode, clearMode, showsCategory }),
    [mode, setMode, clearMode, showsCategory],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
