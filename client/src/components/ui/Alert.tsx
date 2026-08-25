interface AlertProps {
  message: string;
  variant?: "error" | "success";
}

export function Alert({ message, variant = "error" }: AlertProps) {
  const styles =
    variant === "error"
      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30"
      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30";

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`} role="alert">
      {message}
    </div>
  );
}
