import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../../store/useCartStore";
import productPlaceholder from "../../assets/images/placeholder.png";

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: number | string, quantity: number) => void;
  onRemove: (productId: number | string) => void;
}

export default function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  const { product, quantity } = item;
  const unit = product.unit_symbol ?? product.unit_code ?? "";
  const img = product.product_image ?? productPlaceholder;
  const subtotal = Number(product.price) * quantity;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          {product.unit_name ?? "Organic"}
        </p>
        <h3 className="truncate text-base font-bold text-gray-900">
          {product.name}
        </h3>
        <p className="mt-0.5 text-sm font-semibold text-brand-700">
          RWF {Number(product.price).toLocaleString()}
          {unit && <span className="ml-1 font-medium text-gray-400">/ {unit}</span>}
        </p>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1">
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-brand-700 disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-gray-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-brand-700"
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>

        <span className="w-24 text-right text-base font-extrabold text-gray-900">
          RWF {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>

        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Remove item"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
