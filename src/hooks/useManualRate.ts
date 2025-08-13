import { useEffect, useMemo, useState } from "preact/hooks";

export function useManualRate(base = "JPY", quote = "KRW", initial = 10) {
  const key = `fx:manual:${base}:${quote}`;
  const [rate, setRate] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(key);
      const n = raw ? Number(raw) : NaN;
      return Number.isFinite(n) && n > 0 ? n : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, String(rate));
    } catch {
      /* ignore */
    }
  }, [rate, key]);

  const convert = useMemo(() => {
    return (amount: number | null | undefined) => {
      if (!Number.isFinite(rate) || rate <= 0) return null;
      const a = amount ?? 0;
      return Math.round(a * rate);
    };
  }, [rate]);

  return { rate, setRate, convert };
}
