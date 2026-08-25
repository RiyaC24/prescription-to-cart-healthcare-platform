import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  createSlotSchema,
  deleteSlotSchema,
  listAvailableSlotsSchema,
  updateAppointmentStatusSchema,
} from "./appointments.schema";
import {
  bookAppointment,
  cancelAppointment,
  createSlot,
  deleteSlot,
  getDoctors,
  listAllAppointments,
  listAvailableSlots,
  listMyAppointments,
  listMySlots,
  updateAppointmentStatus,
} from "./appointments.controller";

const router = Router();

router.use(authenticate);

// Doctor directory — any authenticated user can browse doctors to book with.
router.get("/doctors", getDoctors);

// Availability slots
router.post("/slots", authorize("DOCTOR"), validate(createSlotSchema), createSlot);
router.get("/slots/mine", authorize("DOCTOR"), listMySlots);
router.get("/slots", validate(listAvailableSlotsSchema), listAvailableSlots);
router.delete("/slots/:id", authorize("DOCTOR"), validate(deleteSlotSchema), deleteSlot);

// Appointments
router.post("/", authorize("PATIENT"), validate(bookAppointmentSchema), bookAppointment);
router.get("/mine", authorize("PATIENT", "DOCTOR"), listMyAppointments);
router.get("/", authorize("ADMIN"), listAllAppointments);
router.patch(
  "/:id/status",
  authorize("DOCTOR"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);
router.patch(
  "/:id/cancel",
  authorize("PATIENT", "DOCTOR"),
  validate(cancelAppointmentSchema),
  cancelAppointment
);

export default router;
