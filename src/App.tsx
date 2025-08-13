import clsx from "clsx";
import { format } from "date-fns";
import { useMemo, useState } from "preact/hooks";
import { ImportExportCard } from "./components/ImportExportCard";
import { OrderRow } from "./components/OrderRow";
import { Pagination } from "./components/Pagination";
import { StatsBar } from "./components/StatsBar";
import { useManualRate } from "./hooks/useManualRate";
import type { Order } from "./types";

interface AppProps {
  orders: Order[];
  onFetch: () => Promise<void> | void;
  onCancel?: () => void;
  isFetching?: boolean;
  onImport: (orders: Order[]) => void;
}

export function App({
  orders,
  onFetch,
  onCancel,
  isFetching = false,
  onImport,
}: AppProps) {
  const [tab, setTab] = useState<0 | 1>(0);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = orders.slice(startIdx, startIdx + pageSize);

  // totals
  const total = useMemo(
    () => orders.reduce((sum, o) => sum + o.price, 0),
    [orders]
  );
  const monthly = useMemo(() => {
    const m: Record<string, number> = {};
    orders.forEach((o) => {
      const key = format(o.createdAt, "yyyy-MM");
      m[key] = (m[key] || 0) + o.price;
    });
    return Object.entries(m).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [orders]);

  // Manual FX: JPY -> KRW (persists in localStorage)
  const fx = useManualRate("JPY", "KRW", 10);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto font-sans text-gray-900">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-12 mb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            BOOTH Calculator
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isFetching ? (
            <button
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-sm",
                "bg-blue-600 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              )}
              onClick={onFetch}
            >
              <span className="i">🔄</span>
              <span>BOOTH에서 불러오기</span>
            </button>
          ) : (
            <button
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-sm",
                "bg-red-500 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              )}
              onClick={onCancel}
            >
              <span className="animate-spin" aria-hidden>
                ⏳
              </span>
              <span>중지</span>
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div role="tablist" aria-label="Views" className="flex border-b mb-4">
        <button
          role="tab"
          aria-selected={tab === 0}
          className={clsx(
            "px-4 py-2 -mb-px border-b-2 transition-colors",
            tab === 0
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setTab(0)}
        >
          주문내역
        </button>
        <button
          role="tab"
          aria-selected={tab === 1}
          className={clsx(
            "px-4 py-2 -mb-px border-b-2 transition-colors",
            tab === 1
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setTab(1)}
        >
          저장 / 불러오기
        </button>
      </div>

      {tab === 0 && (
        <section aria-labelledby="overview" className="space-y-4">
          <StatsBar
            totalJPY={total}
            monthly={monthly}
            rate={fx.rate}
            onChangeRate={fx.setRate}
            convert={fx.convert}
          />

          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y">
            {pageItems.map((o) => (
              <OrderRow key={o.id} o={o} toKRW={fx.convert} />
            ))}
            {pageItems.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-2xl mb-2">🗂️</div>
                <p>주문 내역이 없습니다.</p>
              </div>
            )}
          </div>

          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
          />
        </section>
      )}

      {tab === 1 && (
        <section className="space-y-4">
          <ImportExportCard onImport={onImport} orders={orders} />
        </section>
      )}
    </div>
  );
}
