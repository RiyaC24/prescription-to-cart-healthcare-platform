import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404 — Page not found</h1>
      <Link to="/login" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        Back to login
      </Link>
    </div>
  );
}
