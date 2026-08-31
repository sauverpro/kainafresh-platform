import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./Modal.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseIcon?: boolean;
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "cf-modal--sm",
  md: "cf-modal--md",
  lg: "cf-modal--lg",
  xl: "cf-modal--xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseIcon = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="cf-modal-root" role="dialog" aria-modal="true">
      <div
        className="cf-modal-backdrop"
        onClick={() => closeOnBackdrop && onClose()}
      />
      <div className={`cf-modal-panel ${sizeMap[size]}`}>
        <div className="cf-modal-header">
          <div className="cf-modal-title">{title}</div>
          {showCloseIcon && (
            <button
              type="button"
              className="cf-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="cf-modal-body">{children}</div>
        {footer && <div className="cf-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
