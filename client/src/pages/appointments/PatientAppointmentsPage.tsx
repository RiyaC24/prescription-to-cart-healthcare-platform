import { useEffect, useState } from "react";
import {
  bookAppointment,
  cancelAppointment,
  fetchAvailableSlots,
  fetchDoctors,
  fetchMyAppointments,
} from "@/features/appointments/appointmentsApi";
import type { Appointment, AvailabilitySlot, Doctor } from "@/types/appointments";
import { formatTimeRange } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function PatientAppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reason, setReason] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadAppointments() {
    try {
      const data = await fetchMyAppointments();
      setAppointments(data);
    } catch {
      setError("Could not load your appointments.");
    }
  }

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .catch(() => setError("Could not load the doctor directory."));
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlotId(null);
    fetchAvailableSlots(selectedDoctorId)
      .then(setSlots)
      .catch(() => setError("Could not load available slots for this doctor."))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId]);

  async function handleBook() {
    if (!selectedSlotId) return;
    setBooking(true);
    setError(null);
    setSuccess(null);
    try {
      await bookAppointment({ slotId: selectedSlotId, reason: reason.trim() || undefined });
      setSuccess("Appointment booked — it's pending doctor confirmation.");
      setReason("");
      setSelectedSlotId(null);
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
      await loadAppointments();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not book this slot.");
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(appointmentId: string) {
    setError(null);
    setSuccess(null);
    try {
      await cancelAppointment(appointmentId);
      setSuccess("Appointment cancelled.");
      await loadAppointments();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not cancel this appointment.");
    }
  }

  const upcoming = appointments.filter((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED");
  const past = appointments.filter((a) => a.status === "CANCELLED" || a.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Book an Appointment</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pick a doctor, choose an open slot, and confirm.
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

        <div className="mt-4 flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select a doctor…</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.firstName} {d.lastName}
                {d.specialization ? ` — ${d.specialization}` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedDoctorId && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Available slots</p>
            {loadingSlots && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading slots…</p>
            )}
            {!loadingSlots && slots.length === 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No open slots for this doctor right now.
              </p>
            )}
            {!loadingSlots && slots.length > 0 && (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedSlotId === slot.id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedSlotId && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Reason for visit (optional)
              </label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Follow-up on blood pressure"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <Button onClick={handleBook} isLoading={booking} className="w-fit">
              Confirm booking
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Appointments</h2>

        {upcoming.length === 0 && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No upcoming appointments.</p>
        )}
        <ul className="mt-3 flex flex-col gap-3">
          {upcoming.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatTimeRange(a.slot.startTime, a.slot.endTime)}
                </p>
                {a.reason && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reason: {a.reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                <Button variant="secondary" onClick={() => handleCancel(a.id)}>
                  Cancel
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {past.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-400">History</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {past.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800/60"
                >
                  <div>
                    <span className="text-slate-700 dark:text-slate-300">
                      Dr. {a.doctor?.firstName} {a.doctor?.lastName}
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
