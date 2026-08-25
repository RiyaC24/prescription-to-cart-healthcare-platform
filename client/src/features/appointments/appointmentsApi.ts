import { api } from "@/lib/axios";
import type {
  Appointment,
  AvailabilitySlot,
  BookAppointmentPayload,
  CreateSlotPayload,
  Doctor,
} from "@/types/appointments";

export async function fetchDoctors(): Promise<Doctor[]> {
  const { data } = await api.get<{ doctors: Doctor[] }>("/appointments/doctors");
  return data.doctors;
}

export async function fetchAvailableSlots(doctorId: string): Promise<AvailabilitySlot[]> {
  const { data } = await api.get<{ slots: AvailabilitySlot[] }>("/appointments/slots", {
    params: { doctorId },
  });
  return data.slots;
}

export async function fetchMySlots(): Promise<AvailabilitySlot[]> {
  const { data } = await api.get<{ slots: AvailabilitySlot[] }>("/appointments/slots/mine");
  return data.slots;
}

export async function createSlot(payload: CreateSlotPayload): Promise<AvailabilitySlot> {
  const { data } = await api.post<{ slot: AvailabilitySlot }>("/appointments/slots", payload);
  return data.slot;
}

export async function deleteSlot(slotId: string): Promise<void> {
  await api.delete(`/appointments/slots/${slotId}`);
}

export async function bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post<{ appointment: Appointment }>("/appointments", payload);
  return data.appointment;
}

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<{ appointments: Appointment[] }>("/appointments/mine");
  return data.appointments;
}

export async function fetchAllAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<{ appointments: Appointment[] }>("/appointments");
  return data.appointments;
}

export async function updateAppointmentStatus(
  id: string,
  status: "CONFIRMED" | "COMPLETED",
  notes?: string
): Promise<Appointment> {
  const { data } = await api.patch<{ appointment: Appointment }>(`/appointments/${id}/status`, {
    status,
    notes,
  });
  return data.appointment;
}

export async function cancelAppointment(id: string, cancelReason?: string): Promise<Appointment> {
  const { data } = await api.patch<{ appointment: Appointment }>(`/appointments/${id}/cancel`, {
    cancelReason,
  });
  return data.appointment;
}
