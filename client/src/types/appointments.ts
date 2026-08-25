export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string | null;
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  slot: AvailabilitySlot;
  doctor?: { firstName: string; lastName: string; specialization: string | null };
  patient?: { firstName: string; lastName: string; phone?: string | null };
}

export interface CreateSlotPayload {
  startTime: string;
  endTime: string;
}

export interface BookAppointmentPayload {
  slotId: string;
  reason?: string;
}
