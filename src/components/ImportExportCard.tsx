import { useRef } from "preact/hooks";
import { useToast } from "../toast";
import type { Order } from "../types";
import { csvToOrders, ordersToCSV } from "../utils/csv";

type Props = { onImport: (orders: Order[]) => void; orders: Order[] };

export function ImportExportCard({ onImport, orders }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function handleSave() {
    const csv = ordersToCSV(orders);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function readFileAsText(file: File): Promise<string> {
    if ("text" in file) return await (file as any).text();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async function handleFile(file: File) {
    const text = await readFileAsText(file);
    onImport(csvToOrders(text));
    toast.success("CSV 불러오기 완료!");
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.includes("csv")) void handleFile(file);
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  return (
    <div
      className="rounded-xl border-2 border-dashed p-6 text-center bg-white hover:bg-slate-50 transition-colors"
      onDrop={onDrop as any}
      onDragOver={onDragOver as any}
      aria-label="Drop CSV here"
    >
      <div className="text-3xl mb-2">📥</div>
      <p className="text-gray-700 font-medium">CSV에서 주문내역 불러오기</p>
      <p className="text-sm text-gray-500 mb-4">
        .csv 파일을 여기에 드래그하거나 클릭하여 선택하세요.
      </p>
      <div className="flex items-center justify-center gap-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
          onClick={handleSave}
        >
          저장
        </button>
        <button
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg shadow-sm"
          onClick={() => fileRef.current?.click()}
        >
          불러오기
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={(e) => {
          const f = (e.currentTarget as HTMLInputElement).files?.[0];
          if (f) void handleFile(f);
          (e.currentTarget as HTMLInputElement).value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
