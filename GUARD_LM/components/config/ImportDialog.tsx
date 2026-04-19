"use client";

import { AlertCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { buttonClasses } from "../ui/Button";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  onTryAgain: () => void;
}

export function ImportDialog({ isOpen, onClose, errors, onTryAgain }: ImportDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-line bg-field p-6 shadow-guard animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-cloud/40 hover:text-cloud transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 text-ember">
          <AlertCircle size={24} />
          <h2 className="text-xl font-black">Import Failed</h2>
        </div>

        <p className="mt-4 text-sm text-cloud/60 leading-relaxed">
          The JSON file you attempted to import is invalid or does not match the Nova Rule schema. 
          Please fix the following errors and try again:
        </p>

        <div className="mt-4 max-h-[200px] overflow-y-auto rounded-lg bg-ink/50 p-4 border border-line">
          <ul className="space-y-2">
            {errors.map((error, idx) => (
              <li key={idx} className="text-xs font-mono text-ember/80 flex gap-2">
                <span className="opacity-50">•</span> {error}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onTryAgain}
            className={cn(buttonClasses("primary"), "flex-1")}
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className={cn(buttonClasses("secondary"), "flex-1")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
