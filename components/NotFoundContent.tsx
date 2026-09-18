import Link from "next/link";

export function NotFoundContent({
  title,
  body,
  back,
  backHref,
  dir,
}: {
  title: string;
  body: string;
  back: string;
  backHref: string;
  dir: "rtl" | "ltr";
}) {
  return (
    <div dir={dir} className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="mt-2 text-[15px] text-gray-600 dark:text-gray-400">{body}</p>
      <Link
        href={backHref}
        className="mt-6 inline-flex h-10 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
      >
        {back}
      </Link>
    </div>
  );
}
