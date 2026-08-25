import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function DoctorDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Doctor Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Welcome, {user?.email}. Prescription-writing tools arrive in a later phase.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to="/doctor/availability"
          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Manage availability →
        </Link>
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          View appointments →
        </Link>
      </div>
    </div>
  );
}
