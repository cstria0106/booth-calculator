import type { Order } from "../types";
import { fmtJPY, fmtKRW } from "../utils/format";

type Props = { o: Order; toKRW: (n: number) => number | null };

export function OrderRow({ o, toKRW }: Props) {
  const krw = toKRW(o.price);
  return (
    <div className="flex justify-between items-center p-3 sm:p-4 gap-3">
      <a
        className="flex items-center gap-3 min-w-0 hover:underline"
        href={`https://accounts.booth.pm/orders/${o.id}`}
        target="_blank"
      >
        <img src={o.image} alt={o.name} className="h-10 w-10 rounded-full" />
        <div className="min-w-0">
          <div
            className="font-medium text-sm text-gray-900 truncate"
            title={o.name}
          >
            {o.name}
          </div>
          <div className="text-xs text-gray-500">
            {o.createdAt.toISOString().split("T")[0]}
          </div>
        </div>
      </a>
      <div className="text-right whitespace-nowrap">
        <div className="font-semibold tabular-nums">
          {fmtJPY.format(o.price)}
        </div>
        {krw !== null && (
          <div className="text-xs text-gray-500">≈ {fmtKRW.format(krw)}</div>
        )}
      </div>
    </div>
  );
}
