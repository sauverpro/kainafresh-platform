export default function PageShellSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col justify-between p-6 sm:p-12 space-y-12 animate-fade-in-up">
      {/* Top Navbar Placeholder */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
        <div className="skeleton-shimmer h-8 w-36 rounded-xl" />
        <div className="hidden sm:flex gap-6">
          <div className="skeleton-shimmer h-5 w-20 rounded-md" />
          <div className="skeleton-shimmer h-5 w-20 rounded-md" />
          <div className="skeleton-shimmer h-5 w-20 rounded-md" />
        </div>
        <div className="skeleton-shimmer h-10 w-10 rounded-full" />
      </div>

      {/* Hero Section Placeholder */}
      <div className="max-w-4xl mx-auto w-full space-y-6 text-center">
        <div className="skeleton-shimmer h-6 w-36 rounded-full mx-auto" />
        <div className="skeleton-shimmer h-12 w-3/4 rounded-2xl mx-auto" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-lg mx-auto" />
      </div>

      {/* Grid Content Placeholder */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl space-y-4 shadow-xs"
          >
            <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
