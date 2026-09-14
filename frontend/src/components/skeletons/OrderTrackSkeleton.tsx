export default function OrderTrackSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in-up w-full">
      {/* Top Banner Shell */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-8 w-44 rounded-xl" />
              <div className="skeleton-shimmer h-6 w-24 rounded-full" />
            </div>
            <div className="skeleton-shimmer h-4 w-64 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
            <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
          </div>
        </div>

        {/* Stepper Timeline Placeholder */}
        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between px-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="skeleton-shimmer h-12 w-12 rounded-full" />
                <div className="skeleton-shimmer h-4 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <div className="skeleton-shimmer h-6 w-48 rounded-lg pb-4 border-b border-gray-100 dark:border-white/5" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-50 dark:border-white/5">
                <div className="skeleton-shimmer h-4 w-40 rounded-md" />
                <div className="skeleton-shimmer h-4 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <div className="skeleton-shimmer h-6 w-36 rounded-lg pb-4 border-b border-gray-100 dark:border-white/5" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
