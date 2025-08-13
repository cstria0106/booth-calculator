// toast.tsx
import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";

type ToastVariant = "default" | "success" | "error" | "loading";
type ToastOptions = {
  id?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastItem = Required<Pick<ToastOptions, "message">> & {
  id: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
};

type ToastContextValue = {
  show: (opts: ToastOptions | string) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  loading: (message: string) => string;
  dismiss: (id: string) => void;
  update: (
    id: string,
    opts: Partial<Omit<ToastItem, "id" | "createdAt">>
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function EmojiIcon({ variant }: { variant: ToastVariant }) {
  const map: Record<
    ToastVariant,
    { emoji: string; label: string; pulse?: boolean }
  > = {
    success: { emoji: "✅", label: "Success" },
    error: { emoji: "❌", label: "Error" },
    loading: { emoji: "⏳", label: "Loading", pulse: true },
    default: { emoji: "🔔", label: "Notification" },
  };
  const { emoji, label, pulse } = map[variant];
  return (
    <span
      aria-label={label}
      role="img"
      className={[
        "select-none text-base leading-5",
        pulse ? "animate-pulse" : "",
      ].join(" ")}
    >
      {emoji}
    </span>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Trigger enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [toast.id]);

  // Auto-dismiss
  useEffect(() => {
    if (toast.variant === "loading") return;
    timerRef.current = window.setTimeout(() => handleClose(), toast.duration);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, toast.variant]);

  function handleClose() {
    setLeaving(true);
    window.setTimeout(() => onClose(toast.id), 250);
  }

  function pause() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }
  function resume() {
    if (toast.variant === "loading") return;
    timerRef.current = window.setTimeout(() => handleClose(), 1500);
  }

  const base =
    "pointer-events-auto relative flex w-full min-w-[260px] max-w-sm items-center gap-3 " +
    "rounded-xl bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] " +
    "border border-slate-200 outline-none focus-visible:outline-none " +
    "transition-all duration-300 ease-out will-change-transform";

  // Enter/leave states
  const motion = leaving
    ? "opacity-0 translate-y-2 scale-[0.98]"
    : mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-2 scale-[0.98]";

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={[base, motion].join(" ")}
    >
      <div className="mt-0.5 flex-none">
        <EmojiIcon variant={toast.variant} />
      </div>
      <div className="flex-1 text-sm leading-5">{toast.message}</div>
      <button
        aria-label="Close"
        className="rounded-md p-1 opacity-70 transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-slate-300"
        onClick={handleClose}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ComponentChildren }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo<ToastContextValue>(
    () => ({
      show: (opts) => {
        const o: ToastOptions =
          typeof opts === "string" ? { message: opts } : opts;
        const id = o.id ?? Math.random().toString(36).slice(2);
        const next: ToastItem = {
          id,
          message: o.message,
          variant: o.variant ?? "default",
          duration: o.duration ?? 2500,
          createdAt: Date.now(),
        };
        setToasts((prev) => [next, ...prev].slice(0, 6));
        return id;
      },
      success: (message, duration): string =>
        api.show({
          message,
          variant: "success",
          duration,
        }) as unknown as string,
      error: (message, duration): string =>
        api.show({ message, variant: "error", duration }) as unknown as string,
      loading: (message): string =>
        api.show({
          message,
          variant: "loading",
          duration: 60_000,
        }) as unknown as string,
      dismiss: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
      update: (id, opts) =>
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...opts } : t))
        ),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex max-h-[calc(100vh-2rem)] flex-col-reverse items-end gap-2 overflow-hidden"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={api.dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
