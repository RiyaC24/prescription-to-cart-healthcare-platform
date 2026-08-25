import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">403 — Not authorized</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        You don't have permission to view this page.
      </p>
      <Link to="/login" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        Back to login
      </Link>
    </div>
  );
}
