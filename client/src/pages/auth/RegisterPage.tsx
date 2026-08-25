import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { register } from "@/features/auth/authSlice";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { roleToDashboardPath } from "@/lib/navigation";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PATIENT" as "PATIENT" | "DOCTOR",
  });

  const isLoading = status === "loading";

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      navigate(roleToDashboardPath(result.payload.role));
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Patients and doctors can self-register
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <Alert message={error} />}

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="First name"
              name="firstName"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            <TextField
              label="Last name"
              name="lastName"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>

          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">I am a</label>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              value={form.role}
              onChange={(e) => update("role", e.target.value as "PATIENT" | "DOCTOR")}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
