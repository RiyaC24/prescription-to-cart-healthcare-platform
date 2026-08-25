import { useEffect, useState } from "react";
import { fetchAllAppointments } from "@/features/appointments/appointmentsApi";
import type { Appointment } from "@/types/appointments";
import { formatTimeRange } from "@/lib/datetime";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAppointments()
      .then(setAppointments)
      .catch(() => setError("Could not load appointments. Is the backend running?"));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Appointments</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Platform-wide view across every doctor and patient.
      </p>

      {error && (
        <div className="mt-4">
          <Alert message={error} variant="error" />
        </div>
      )}

      {!error && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 font-medium">Patient</th>
              <th className="py-2 font-medium">Doctor</th>
              <th className="py-2 font-medium">When</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr
                key={a.id}
                className="border-b border-slate-100 text-slate-700 dark:border-slate-800/60 dark:text-slate-300"
              >
                <td className="py-2">
                  {a.patient?.firstName} {a.patient?.lastName}
                </td>
                <td className="py-2">
                  Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                </td>
                <td className="py-2">{formatTimeRange(a.slot.startTime, a.slot.endTime)}</td>
                <td className="py-2">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!error && appointments.length === 0 && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No appointments booked yet.</p>
      )}
    </div>
  );
}
