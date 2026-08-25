import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../config/prisma";

// Simple placement-interview-friendly examples showing role separation.
// Deeper business logic (appointments, prescriptions, etc.) comes in later phases.

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: { patientProfile: true, doctorProfile: true },
  });
  res.status(200).json({ user });
});

export const listAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json({ users });
});
