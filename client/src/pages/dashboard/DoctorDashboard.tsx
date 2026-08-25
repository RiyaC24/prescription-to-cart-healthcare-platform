import { useAppSelector } from "@/app/hooks";

export default function DoctorDashboard() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Doctor Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Welcome, {user?.email}. Appointment and prescription-writing tools arrive in later
        phases.
      </p>
    </div>
  );
}
