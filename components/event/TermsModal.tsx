"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function TermsModal({ isOpen, onClose, title, children }: TermsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="terms-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-black/5 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 id="terms-modal-title" className="font-semibold text-primary text-sm font-Helvetica-Neue">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-primary/40 transition-colors hover:bg-black/5 hover:text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 text-primary  text-sm leading-relaxed">
          {children}
        </div>

        <div className="shrink-0 border-t border-black/5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-black/10 py-2.5 font-medium font-Helvetica-Neue text-primary text-sm transition-colors hover:bg-black/5"
          >
            დახურვა
          </button>
        </div>
      </div>
    </div>
  );
}
