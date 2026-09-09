import { useState } from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";

interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  unit?: string;
  size?: "sm" | "md";
}

const snap = (value: number, min: number): number => {
  const m = Math.max(1, min);
  return Math.max(m, Math.round(Math.floor(value) / m) * m || m);
};

export default function QtyStepper({
  value,
  onChange,
  min,
  unit = "unit",
  size = "md",
}: QtyStepperProps) {
  const minQty = Math.max(1, min);
  const [text, setText] = useState<string>(String(value));
  const [warning, setWarning] = useState<string | null>(null);

  const parsed = parseInt(text, 10);

  const handleChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, "");
    setText(digits);
    const p = parseInt(digits, 10);
    if (Number.isFinite(p) && p > 0) {
      setWarning(
        p < minQty
          ? `Minimum quantity is ${minQty} ${unit}(s).`
          : p % minQty !== 0
            ? `Quantity must be a multiple of ${minQty} ${unit}(s).`
            : null,
      );
      onChange(snap(p, minQty));
    } else {
      setWarning(null);
    }
  };

  const commit = () => {
    const next = Number.isFinite(parsed) ? snap(parsed, minQty) : snap(value, minQty);
    setText(String(next));
    setWarning(
      Number.isFinite(parsed) && parsed >= minQty && snap(parsed, minQty) !== parsed
        ? `Adjusted to ${next} (multiple of ${minQty}).`
        : null,
    );
    onChange(next);
  };

  const step = (delta: number) => {
    const base = snap(delta < 0 ? parsed : parsed || minQty, minQty);
    const next = snap(base + delta, minQty);
    setText(String(next));
    setWarning(null);
    onChange(next);
  };

  const compact = size === "sm";
  const inputW = compact ? "w-10 min-w-[32px] text-xs" : "min-w-[52px] text-sm";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex items-center gap-1.5 rounded-full ${
          compact ? "bg-[#f4faf7] px-2 py-1 border border-[#076935]/15" : "bg-gray-100 p-1 w-fit"
        }`}
      >
        <button
          type="button"
          className={`rounded-full border-0 bg-white font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${
            compact
              ? "w-6 h-6 text-[#076935] hover:bg-[#076935] hover:text-white"
              : "w-8 h-8 hover:bg-[#076935] hover:text-white"
          }`}
          onClick={() => step(-minQty)}
          disabled={parsed <= minQty}
          aria-label="Decrease quantity"
        >
          <Minus size={14} className="mx-auto" />
        </button>
        <input
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commit}
          inputMode="numeric"
          className={`font-bold bg-transparent text-center outline-none ${inputW}`}
          style={{ fontFamily: "var(--font-heading)" }}
        />
        <button
          type="button"
          className={`rounded-full border-0 bg-white font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${
            compact
              ? "w-6 h-6 text-[#076935] hover:bg-[#076935] hover:text-white"
              : "w-8 h-8 hover:bg-[#076935] hover:text-white"
          }`}
          onClick={() => step(minQty)}
          aria-label="Increase quantity"
        >
          <Plus size={14} className="mx-auto" />
        </button>
      </div>
      {warning && (
        <p
          className={`text-[#dc2626] font-medium flex items-center gap-1 ${
            compact ? "text-[10px] max-w-[240px] text-right" : "text-[11px]"
          }`}
        >
          <AlertCircle size={size === "sm" ? 11 : 13} /> {warning}
        </p>
      )}
    </div>
  );
}
