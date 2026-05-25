import { useState, useRef, useEffect } from 'react';

export function useToast(duration = 3500) {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function showToast(msg: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = setTimeout(() => setToast(null), duration);
  }

  function hideToast() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }

  return { toast, showToast, hideToast };
}
