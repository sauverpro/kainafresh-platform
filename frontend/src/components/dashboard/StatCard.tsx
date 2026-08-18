import { Users, Package, ArrowUp, ArrowDown } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, IconType> = {
  customers: Users,
  orders: Package,
};

interface Props {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function StatCard({ id, label, value, change, trend }: Props) {
  const Icon = ICONS[id] ?? Users;
  const isUp = trend === "up";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
        <Icon className="h-5.5 w-5.5 text-gray-700 dark:text-gray-300" />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
            {value}
          </p>
        </div>

        <span
          className={[
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
            isUp
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
              : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
          ].join(" ")}
        >
          {isUp ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {change}
        </span>
      </div>
    </div>
  );
}
