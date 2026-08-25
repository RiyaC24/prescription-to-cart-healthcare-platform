import crypto from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../middleware/errorHandler";
import { comparePassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { LoginInput, RegisterInput } from "./auth.schema";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshExpiryDate(): Date {
  // Mirrors JWT_REFRESH_EXPIRES_IN (default 7d). Kept simple for Phase 1.
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function issueTokens(user: { id: string; email: string; role: Role }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role as Role,
      ...(input.role === "PATIENT"
        ? {
            patientProfile: {
              create: { firstName: input.firstName, lastName: input.lastName },
            },
          }
        : {
            doctorProfile: {
              create: { firstName: input.firstName, lastName: input.lastName },
            },
          }),
    },
  });

  const tokens = await issueTokens(user);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token is invalid, expired, or revoked");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Account no longer active");
  }

  // Rotate: revoke the old token, issue a new pair.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(user);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  };
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
