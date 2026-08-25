import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    await dispatch(logout());
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Prescription-to-Cart</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Phase 1 — Core Platform</p>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.email}</p>
            <span className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {user.role}
            </span>
          </div>
        )}
        <ThemeToggle />
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
