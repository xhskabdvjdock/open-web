export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="جارٍ تحميل المشاريع">
      <div className="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="aspect-video animate-pulse bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
