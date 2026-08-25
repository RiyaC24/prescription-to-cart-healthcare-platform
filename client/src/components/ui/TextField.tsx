import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            error ? "border-red-400 dark:border-red-500/60" : "border-slate-300 dark:border-slate-700"
          }`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  }
);

TextField.displayName = "TextField";
