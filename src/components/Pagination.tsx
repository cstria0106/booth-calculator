type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({ page, pageCount, onPrev, onNext }: Props) {
  return (
    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
      <button
        className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={page <= 1}
        onClick={onPrev}
      >
        이전
      </button>
      <span className="text-sm">
        페이지 {page} / {pageCount}
      </span>
      <button
        className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={page >= pageCount}
        onClick={onNext}
      >
        다음
      </button>
    </div>
  );
}
