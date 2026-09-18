"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold">حدث خطأ ما</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {error.message || "تعذر الوصول إلى قاعدة البيانات. يرجى المحاولة مجدداً."}
      </p>
      <button
        onClick={reset}
        className="mt-5 inline-flex h-10 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
