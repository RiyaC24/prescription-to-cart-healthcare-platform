import { z } from "zod";

export const createSlotSchema = z.object({
  body: z
    .object({
      startTime: z.string().datetime({ message: "startTime must be an ISO 8601 date-time" }),
      endTime: z.string().datetime({ message: "endTime must be an ISO 8601 date-time" }),
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
      message: "endTime must be after startTime",
      path: ["endTime"],
    })
    .refine((data) => new Date(data.startTime) > new Date(), {
      message: "startTime must be in the future",
      path: ["startTime"],
    }),
});

export const listAvailableSlotsSchema = z.object({
  query: z.object({
    doctorId: z.string().uuid(),
  }),
});

export const bookAppointmentSchema = z.object({
  body: z.object({
    slotId: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(["CONFIRMED", "COMPLETED"]),
    notes: z.string().max(1000).optional(),
  }),
});

export const cancelAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    cancelReason: z.string().max(500).optional(),
  }),
});

export const deleteSlotSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>["body"];
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>["body"];
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>["body"];
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>["body"];
