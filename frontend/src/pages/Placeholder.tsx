/**
 * ============================================================================
 * KainaFresh Organic Platform — Generic Route Placeholder Component
 * ============================================================================
 * 
 * Renders a clean dashed placeholder box for dashboard routes undergoing development.
 */

// Interface defining props for Placeholder component
interface Props {
  // Title string displayed inside placeholder box
  title: string;
}

/**
 * Placeholder Component.
 * @param title - Display title header
 */
export default function Placeholder({ title }: Props) {
  return (
    // Centered placeholder container card
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-white/10 dark:bg-gray-900">
      
      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h1>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        This page's content hasn't been built yet.
      </p>
    </div>
  );
}
