export default function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="skeleton-shimmer h-4 w-16 rounded-md" />
        <div className="skeleton-shimmer h-4 w-4 rounded-full" />
        <div className="skeleton-shimmer h-4 w-24 rounded-md" />
        <div className="skeleton-shimmer h-4 w-4 rounded-full" />
        <div className="skeleton-shimmer h-4 w-32 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-4">
          <div className="skeleton-shimmer h-96 sm:h-[450px] w-full rounded-3xl" />
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-20 w-20 rounded-2xl" />
            <div className="skeleton-shimmer h-20 w-20 rounded-2xl" />
            <div className="skeleton-shimmer h-20 w-20 rounded-2xl" />
          </div>
        </div>

        {/* Right Column: Product Specs & Buy Controls */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="skeleton-shimmer h-6 w-28 rounded-full" />
            <div className="skeleton-shimmer h-9 w-3/4 rounded-xl" />
            <div className="skeleton-shimmer h-4 w-1/3 rounded-lg" />
            
            <div className="skeleton-shimmer h-10 w-44 rounded-2xl my-4" />

            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <div className="skeleton-shimmer h-4 w-full rounded-md" />
              <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
              <div className="skeleton-shimmer h-4 w-4/6 rounded-md" />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="skeleton-shimmer h-12 w-32 rounded-full" />
              <div className="skeleton-shimmer h-12 flex-1 rounded-full" />
            </div>
            <div className="skeleton-shimmer h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
