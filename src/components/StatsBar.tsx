import { fmtJPY, fmtKRW } from "../utils/format";

type Props = {
  totalJPY: number;
  monthly: Array<[string, number]>;
  rate: number;
  onChangeRate: (n: number) => void;
  convert: (n: number) => number | null;
};

export function StatsBar({
  totalJPY,
  monthly,
  rate,
  onChangeRate,
  convert,
}: Props) {
  const totalKRW = convert(totalJPY);
  const valid = Number.isFinite(rate) && rate > 0;

  const handleInput = (e: any) => {
    const v = Number((e.currentTarget as HTMLInputElement).value);
    if (Number.isNaN(v)) return;
    onChangeRate(v);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
        <h2 className="font-semibold mb-1 text-gray-600">전체 주문 금액</h2>
        <div className="text-2xl font-bold">{fmtJPY.format(totalJPY)}</div>
        <div className="text-sm text-gray-500 mt-1">
          {valid && totalKRW !== null ? (
            <>
              ≈ <span className="font-semibold">{fmtKRW.format(totalKRW)}</span>
            </>
          ) : (
            "유효한 환율을 입력하세요"
          )}
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">
            환율 (1 JPY → {rate} KRW)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="w-32 px-2 py-1 rounded border bg-white"
              value={Number.isFinite(rate) ? rate : 0}
              onInput={handleInput}
              aria-label="KRW per 1 JPY"
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow p-4 border border-gray-100">
        <h2 className="font-semibold mb-2 text-gray-600">월별 총액</h2>
        <div className="flex flex-wrap gap-2">
          {monthly.length > 0 ? (
            monthly.map(([m, v]) => {
              const vKrw = convert(v);
              return (
                <span
                  key={m}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm border border-slate-200"
                  title={`Total in ${m}`}
                >
                  <span className="font-mono mr-2">{m}</span>
                  <span className="font-semibold mr-2">{fmtJPY.format(v)}</span>
                  {vKrw !== null && (
                    <span className="text-xs text-slate-500">
                      ≈ {fmtKRW.format(vKrw)}
                    </span>
                  )}
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">데이터 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
