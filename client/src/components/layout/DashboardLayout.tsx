import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
