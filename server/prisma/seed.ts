import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD ?? "DevPass123!";
const SALT_ROUNDS = 10;

async function upsertUser(params: {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}) {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      email: params.email,
      passwordHash,
      role: params.role,
    },
  });

  if (params.role === "PATIENT") {
    await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: params.firstName,
        lastName: params.lastName,
      },
    });
  }

  if (params.role === "DOCTOR") {
    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: params.firstName,
        lastName: params.lastName,
        specialization: "General Medicine",
        licenseNumber: "DEV-LICENSE-0001",
      },
    });
  }

  return user;
}

async function main() {
  console.log("Seeding database...");

  await upsertUser({
    email: "admin@prescriptiontocart.com",
    role: Role.ADMIN,
    firstName: "Ada",
    lastName: "Admin",
  });

  await upsertUser({
    email: "doctor@prescriptiontocart.com",
    role: Role.DOCTOR,
    firstName: "Dana",
    lastName: "Doctor",
  });

  await upsertUser({
    email: "patient@prescriptiontocart.com",
    role: Role.PATIENT,
    firstName: "Pat",
    lastName: "Patient",
  });

  console.log("Seed complete. Dev password for all seeded users:", DEV_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
