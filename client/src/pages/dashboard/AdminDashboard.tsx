import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";

interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ users: AdminUserRow[] }>("/users")
      .then((res) => setUsers(res.data.users))
      .catch(() => setError("Could not load users. Is the backend running?"));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        All registered users (admin-only endpoint).
      </p>

      <Link
        to="/admin/appointments"
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        View all appointments →
      </Link>

      {error && <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>}

      {!error && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 font-medium">Email</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-100 text-slate-700 dark:border-slate-800/60 dark:text-slate-300"
              >
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.role}</td>
                <td className="py-2">{u.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
