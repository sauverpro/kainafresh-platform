/**
 * ============================================================================
 * KainaFresh Organic Platform — Custom Loading Indicator
 * ============================================================================
 *
 * A self-contained, centered loading indicator for data-fetching states.
 *
 * Unlike the legacy full-screen PageLoader overlay, this component mounts
 * inline inside the page content area (not over the whole viewport), so the
 * surrounding layout (navbar/sidebar/header) stays visible and stable while
 * backend data loads — giving a clean, graceful render once it resolves.
 */

import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
}

export default function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4"
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-brand-500" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
}
