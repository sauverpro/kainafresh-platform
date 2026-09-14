export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 font-sans pb-16 animate-fade-in-up">
      {/* Top Header Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-32 rounded-md" />
          <div className="skeleton-shimmer h-8 w-64 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-10 w-32 rounded-full" />
          <div className="skeleton-shimmer h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* Bento Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900"
          >
            <div className="skeleton-shimmer h-11 w-11 rounded-xl mb-4" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-24 rounded-md" />
              <div className="skeleton-shimmer h-7 w-36 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
            <div className="skeleton-shimmer h-6 w-44 rounded-lg" />
            <div className="skeleton-shimmer h-8 w-28 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-64 w-full rounded-2xl" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <div className="skeleton-shimmer h-6 w-36 rounded-lg pb-4 border-b border-gray-100 dark:border-white/5" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="skeleton-shimmer h-4 w-28 rounded-md" />
                <div className="skeleton-shimmer h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
