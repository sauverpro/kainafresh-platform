import type { ReactNode } from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: ReactNode;
  iconBg?: string;
  badgeText?: string;
  badgeColor?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  subtext,
  icon,
  iconBg = "bg-[#076935]/10 text-[#076935]",
  badgeText,
  badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[#076935]/10 bg-white p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between">
      {/* Top Header: Icon + Pill Badge */}
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {badgeText && (
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Content: Label, Value, Subtext */}
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span
            className="text-3xl font-extrabold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold uppercase text-gray-500">{unit}</span>
          )}
        </div>
        {subtext && (
          <p className="mt-1 text-xs text-gray-400 font-normal">{subtext}</p>
        )}
      </div>
    </div>
  );
}
