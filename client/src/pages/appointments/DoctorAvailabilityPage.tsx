import { useEffect, useState } from "react";
import { createSlot, deleteSlot, fetchMySlots } from "@/features/appointments/appointmentsApi";
import type { AvailabilitySlot } from "@/types/appointments";
import { formatTimeRange } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { TextField } from "@/components/ui/TextField";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  });
  const [end, setEnd] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return toLocalInputValue(d);
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadSlots() {
    try {
      const data = await fetchMySlots();
      setSlots(data);
    } catch {
      setError("Could not load your availability slots.");
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      await createSlot({
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
      });
      setSuccess("Availability slot added.");
      await loadSlots();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create this slot.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setSuccess(null);
    try {
      await deleteSlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not delete this slot.");
    }
  }

  const upcoming = slots.filter((s) => new Date(s.startTime) > new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Manage Availability</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Open up time slots that patients can book.
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

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Start time"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <TextField
            label="End time"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} isLoading={creating} className="mt-4 w-fit">
          Add slot
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upcoming Slots</h2>
        {upcoming.length === 0 && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No upcoming availability slots yet.
          </p>
        )}
        <ul className="mt-3 flex flex-col gap-2">
          {upcoming.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
            >
              <span className="text-slate-700 dark:text-slate-300">
                {formatTimeRange(slot.startTime, slot.endTime)}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    slot.isBooked
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {slot.isBooked ? "Booked" : "Open"}
                </span>
                {!slot.isBooked && (
                  <Button variant="secondary" onClick={() => handleDelete(slot.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
