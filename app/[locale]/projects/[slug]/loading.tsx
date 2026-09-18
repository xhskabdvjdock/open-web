export default function ProjectsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="جارٍ تحميل المشروع">
      <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="mt-8 aspect-video animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}
