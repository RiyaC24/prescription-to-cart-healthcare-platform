import { useEffect, useState } from "react";
import {
  cancelAppointment,
  fetchMyAppointments,
  updateAppointmentStatus,
} from "@/features/appointments/appointmentsApi";
import type { Appointment } from "@/types/appointments";
import { formatTimeRange } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchMyAppointments();
      setAppointments(data);
    } catch {
      setError("Could not load your appointments.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatus(id: string, status: "CONFIRMED" | "COMPLETED") {
    setBusyId(id);
    setError(null);
    setSuccess(null);
    try {
      await updateAppointmentStatus(id, status);
      setSuccess(`Appointment marked ${status.toLowerCase()}.`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not update this appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(id: string) {
    setBusyId(id);
    setError(null);
    setSuccess(null);
    try {
      await cancelAppointment(id);
      setSuccess("Appointment cancelled.");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not cancel this appointment.");
    } finally {
      setBusyId(null);
    }
  }

  const active = appointments.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED");
  const past = appointments.filter((a) => a.status === "CANCELLED" || a.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Appointments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Confirm, complete, or cancel bookings from your patients.
        </p>

        {error && (
          <div className="mt-4">
            <Alert message={error} variant="error" />
          </div>
        )}
        {success && (
          <div className="mt-4">
            <Alert message={success} variant="success" />
          </div>
        )}

        {active.length === 0 && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No active appointments.</p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {active.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {a.patient?.firstName} {a.patient?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatTimeRange(a.slot.startTime, a.slot.endTime)}
                </p>
                {a.reason && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reason: {a.reason}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
                {a.status === "PENDING" && (
                  <Button
                    isLoading={busyId === a.id}
                    onClick={() => handleStatus(a.id, "CONFIRMED")}
                  >
                    Confirm
                  </Button>
                )}
                {a.status === "CONFIRMED" && (
                  <Button
                    isLoading={busyId === a.id}
                    onClick={() => handleStatus(a.id, "COMPLETED")}
                  >
                    Mark completed
                  </Button>
                )}
                <Button
                  variant="secondary"
                  isLoading={busyId === a.id}
                  onClick={() => handleCancel(a.id)}
                >
                  Cancel
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {past.length > 0 && (
          <>
            <h2 className="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-400">History</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {past.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800/60"
                >
                  <div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {a.patient?.firstName} {a.patient?.lastName}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      {formatTimeRange(a.slot.startTime, a.slot.endTime)}
                    </span>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
