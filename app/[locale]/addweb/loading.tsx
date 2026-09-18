export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جارٍ تحميل لوحة الإدارة">
      <div className="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
            <div className="h-10 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
