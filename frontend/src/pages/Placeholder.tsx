interface Props {
  title: string;
}

export default function Placeholder({ title }: Props) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-white/10 dark:bg-gray-900">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        This page's content hasn't been built yet.
      </p>
    </div>
  );
}
