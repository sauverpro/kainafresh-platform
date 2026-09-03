interface ProductSkeletonProps {
  count?: number;
}

export default function ProductSkeleton({ count = 8 }: ProductSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-gray-900"
        >
          {/* Image Placeholder */}
          <div className="skeleton-shimmer h-48 w-full rounded-2xl mb-4" />

          {/* Category Pill Placeholder */}
          <div className="skeleton-shimmer h-4 w-20 rounded-full mb-3" />

          {/* Title Placeholder */}
          <div className="skeleton-shimmer h-5 w-3/4 rounded-lg mb-2" />

          {/* Subtitle / Unit Placeholder */}
          <div className="skeleton-shimmer h-3.5 w-1/2 rounded-lg mb-4" />

          {/* Price & Action Button Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
            <div className="skeleton-shimmer h-6 w-24 rounded-lg" />
            <div className="skeleton-shimmer h-9 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
