import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginUser, logoutUser, refreshTokens, registerUser } from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await refreshTokens(req.body.refreshToken);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logoutUser(req.body.refreshToken);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.user!;
  res.status(200).json({ user: { id: payload.sub, email: payload.email, role: payload.role } });
});
