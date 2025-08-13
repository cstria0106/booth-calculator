import { ChangeEvent } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { csvToOrders, ordersToCSV } from "./csv";
import type { Order } from "./types";

interface AppProps {
  orders: Order[];
  onFetch: () => Promise<void> | void;
  onImport: (orders: Order[]) => void;
}

export function App({ orders, onFetch, onImport }: AppProps) {
  const [tab, setTab] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = orders.reduce((sum, o) => sum + o.price, 0);
  const monthly: Record<string, number> = {};
  orders.forEach((o) => {
    const key = `${o.createdAt.getFullYear()}-${String(
      o.createdAt.getMonth() + 1
    ).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + o.price;
  });

  function handleSave() {
    const csv = ordersToCSV(orders);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleLoad(e: ChangeEvent) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const list = csvToOrders(text);
      onImport(list);
    };
    reader.readAsText(file);
    input.value = "";
  }

  return (
    <div className="p-4 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">BOOTH Calculator</h1>
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 -mb-px border-b-2 ${
            tab === 0
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setTab(0)}
        >
          Orders
        </button>
        <button
          className={`ml-2 px-4 py-2 -mb-px border-b-2 ${
            tab === 1
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setTab(1)}
        >
          Import/Export
        </button>
      </div>

      {tab === 0 && (
        <div>
          <div className="bg-white rounded shadow p-4 mb-4">
            <h2 className="font-semibold mb-2">Totals</h2>
            <div className="mb-2">{total} JPY</div>
            <ul>
              {Object.entries(monthly).map(([m, v]) => (
                <li
                  key={m}
                  className="flex justify-between py-1 border-b last:border-b-0"
                >
                  <span>{m}</span>
                  <span>{v} JPY</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            onClick={onFetch}
          >
            Fetch from BOOTH
          </button>
          <ul>
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">{o.name}</div>
                  <div className="text-sm text-gray-500">
                    {o.createdAt.toISOString().split("T")[0]}
                  </div>
                </div>
                <div>{o.price} JPY</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 1 && (
        <div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleSave}
          >
            Save CSV
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => fileRef.current?.click()}
          >
            Load CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleLoad}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
