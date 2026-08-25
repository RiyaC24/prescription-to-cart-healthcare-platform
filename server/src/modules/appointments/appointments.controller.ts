import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as appointmentsService from "./appointments.service";

export const getDoctors = asyncHandler(async (_req: Request, res: Response) => {
  const doctors = await appointmentsService.listDoctors();
  res.status(200).json({ doctors });
});

export const createSlot = asyncHandler(async (req: Request, res: Response) => {
  const slot = await appointmentsService.createSlot(req.user!.sub, req.body);
  res.status(201).json({ slot });
});

export const listMySlots = asyncHandler(async (req: Request, res: Response) => {
  const slots = await appointmentsService.listMySlots(req.user!.sub);
  res.status(200).json({ slots });
});

export const listAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const slots = await appointmentsService.listAvailableSlotsForDoctor(req.query.doctorId as string);
  res.status(200).json({ slots });
});

export const deleteSlot = asyncHandler(async (req: Request, res: Response) => {
  await appointmentsService.deleteSlot(req.user!.sub, req.params.id);
  res.status(204).send();
});

export const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.bookAppointment(req.user!.sub, req.body);
  res.status(201).json({ appointment });
});

export const listMyAppointments = asyncHandler(async (req: Request, res: Response) => {
  const role = req.user!.role as "PATIENT" | "DOCTOR";
  const appointments = await appointmentsService.listMyAppointments(req.user!.sub, role);
  res.status(200).json({ appointments });
});

export const listAllAppointments = asyncHandler(async (_req: Request, res: Response) => {
  const appointments = await appointmentsService.listAllAppointments();
  res.status(200).json({ appointments });
});

export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.updateAppointmentStatus(
    req.user!.sub,
    req.params.id,
    req.body
  );
  res.status(200).json({ appointment });
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const role = req.user!.role as "PATIENT" | "DOCTOR";
  const appointment = await appointmentsService.cancelAppointment(
    req.user!.sub,
    role,
    req.params.id,
    req.body
  );
  res.status(200).json({ appointment });
});
