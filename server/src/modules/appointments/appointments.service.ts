import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../middleware/errorHandler";
import {
  BookAppointmentInput,
  CancelAppointmentInput,
  CreateSlotInput,
  UpdateAppointmentStatusInput,
} from "./appointments.schema";

async function getDoctorProfileByUserId(userId: string) {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, "Doctor profile not found for this account");
  }
  return profile;
}

async function getPatientProfileByUserId(userId: string) {
  const profile = await prisma.patientProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, "Patient profile not found for this account");
  }
  return profile;
}

// --- Doctors directory (so patients can pick who to book with) ----------

export async function listDoctors() {
  const doctors = await prisma.doctorProfile.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialization: true,
    },
    orderBy: { firstName: "asc" },
  });
  return doctors;
}

// --- Availability slots ---------------------------------------------------

export async function createSlot(doctorUserId: string, input: CreateSlotInput) {
  const doctor = await getDoctorProfileByUserId(doctorUserId);

  const overlapping = await prisma.availabilitySlot.findFirst({
    where: {
      doctorId: doctor.id,
      startTime: { lt: new Date(input.endTime) },
      endTime: { gt: new Date(input.startTime) },
    },
  });
  if (overlapping) {
    throw new ApiError(409, "This slot overlaps with an existing availability slot");
  }

  return prisma.availabilitySlot.create({
    data: {
      doctorId: doctor.id,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
    },
  });
}

export async function listMySlots(doctorUserId: string) {
  const doctor = await getDoctorProfileByUserId(doctorUserId);
  return prisma.availabilitySlot.findMany({
    where: { doctorId: doctor.id },
    orderBy: { startTime: "asc" },
  });
}

export async function listAvailableSlotsForDoctor(doctorId: string) {
  return prisma.availabilitySlot.findMany({
    where: { doctorId, isBooked: false, startTime: { gt: new Date() } },
    orderBy: { startTime: "asc" },
  });
}

export async function deleteSlot(doctorUserId: string, slotId: string) {
  const doctor = await getDoctorProfileByUserId(doctorUserId);

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.doctorId !== doctor.id) {
    throw new ApiError(404, "Availability slot not found");
  }
  if (slot.isBooked) {
    throw new ApiError(409, "Cannot delete a slot that already has a booking");
  }

  await prisma.availabilitySlot.delete({ where: { id: slotId } });
}

// --- Appointments ----------------------------------------------------------

export async function bookAppointment(patientUserId: string, input: BookAppointmentInput) {
  const patient = await getPatientProfileByUserId(patientUserId);

  return prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findUnique({ where: { id: input.slotId } });
    if (!slot) {
      throw new ApiError(404, "Availability slot not found");
    }
    if (slot.isBooked) {
      throw new ApiError(409, "This slot has already been booked");
    }
    if (slot.startTime <= new Date()) {
      throw new ApiError(409, "This slot is no longer in the future");
    }

    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return tx.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: slot.doctorId,
        slotId: slot.id,
        reason: input.reason,
        status: AppointmentStatus.PENDING,
      },
      include: { slot: true, doctor: true },
    });
  });
}

export async function listMyAppointments(userId: string, role: "PATIENT" | "DOCTOR") {
  if (role === "PATIENT") {
    const patient = await getPatientProfileByUserId(userId);
    return prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        slot: true,
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const doctor = await getDoctorProfileByUserId(userId);
  return prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    include: {
      slot: true,
      patient: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllAppointments() {
  return prisma.appointment.findMany({
    include: {
      slot: true,
      doctor: { select: { firstName: true, lastName: true, specialization: true } },
      patient: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateAppointmentStatus(
  doctorUserId: string,
  appointmentId: string,
  input: UpdateAppointmentStatusInput
) {
  const doctor = await getDoctorProfileByUserId(doctorUserId);

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    throw new ApiError(404, "Appointment not found");
  }
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    throw new ApiError(409, `Cannot update an appointment that is already ${appointment.status.toLowerCase()}`);
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: input.status, notes: input.notes },
    include: { slot: true },
  });
}

export async function cancelAppointment(
  userId: string,
  role: "PATIENT" | "DOCTOR",
  appointmentId: string,
  input: CancelAppointmentInput
) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (role === "PATIENT") {
    const patient = await getPatientProfileByUserId(userId);
    if (appointment.patientId !== patient.id) {
      throw new ApiError(403, "You can only cancel your own appointments");
    }
  } else {
    const doctor = await getDoctorProfileByUserId(userId);
    if (appointment.doctorId !== doctor.id) {
      throw new ApiError(403, "You can only cancel your own appointments");
    }
  }

  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    throw new ApiError(409, `Appointment is already ${appointment.status.toLowerCase()}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: input.cancelReason,
      },
      include: { slot: true },
    });

    // Free the slot back up so it can be rebooked.
    await tx.availabilitySlot.update({
      where: { id: appointment.slotId },
      data: { isBooked: false },
    });

    return updated;
  });
}
