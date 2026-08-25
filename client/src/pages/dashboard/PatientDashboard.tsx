import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function PatientDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Patient Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Welcome, {user?.email}. Prescription and pharmacy/cart features arrive in later phases.
      </p>

      <Link
        to="/patient/appointments"
        className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Book &amp; manage appointments →
      </Link>
    </div>
  );
}
