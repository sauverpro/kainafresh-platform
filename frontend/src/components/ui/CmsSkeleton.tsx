export default function CmsSkeleton() {
  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-7 w-48 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-32 rounded-md" />
        </div>
        <div className="skeleton-shimmer h-10 w-28 rounded-full" />
      </div>

      <div className="space-y-4">
        <div className="skeleton-shimmer h-12 w-full rounded-xl" />
        <div className="skeleton-shimmer h-24 w-full rounded-xl" />
        <div className="skeleton-shimmer h-12 w-full rounded-xl" />
        <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
