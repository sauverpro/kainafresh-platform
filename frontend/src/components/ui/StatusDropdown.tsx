import * as React from "react";
import { Loader2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";

export interface StatusOption {
  value: string;
  label: string;
  /** Small colored dot shown on the trigger + next to the label. */
  dotClassName?: string;
}

interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  /** Shows a spinner on the trigger while a change is in-flight. */
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  align?: "start" | "center" | "end";
}

function StatusDot({ className }: { className?: string }) {
  return <span className={`h-2 w-2 shrink-0 rounded-full ${className ?? 'bg-gray-400'}`} />;
}

/**
 * Generic, reusable status dropdown built on the shadcn DropdownMenu.
 * Content (options) is fully driven by props, so the same component can be
 * reused for any status-like picker by only changing the `options` array.
 */
export default function StatusDropdown({
  value,
  options,
  onChange,
  loading = false,
  disabled = false,
  placeholder = "Select",
  ariaLabel = "Change status",
  align = "end",
}: StatusDropdownProps) {
  const current = options.find((o) => o.value === value);

  const handleSelect = (next: string) => {
    if (next !== value) onChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || loading}
          aria-label={ariaLabel}
          className={[
            "inline-flex min-h-9 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
            "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "max-w-[9.5rem] sm:max-w-none",
          ].join(" ")}
        >
          {loading ? (
            <Loader2 size={14} className="shrink-0 animate-spin text-brand-600" />
          ) : (
            <StatusDot className={current?.dotClassName} />
          )}
          <span className="truncate">{current?.label ?? placeholder}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-gray-400"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-48">
        {options.map((option, idx) => (
          <React.Fragment key={option.value}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className="gap-2 pr-10"
            >
              <StatusDot className={option.dotClassName} />
              <span className="min-w-0 truncate">{option.label}</span>
              {option.value === value && (
                <Check size={15} className="ml-auto shrink-0 text-brand-600" />
              )}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
