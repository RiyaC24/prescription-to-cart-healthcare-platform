interface StatusBadgeProps {
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

const STYLES: Record<StatusBadgeProps["status"], string> = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  CONFIRMED:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  CANCELLED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
