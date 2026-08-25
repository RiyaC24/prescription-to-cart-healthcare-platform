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

  const doctor = await upsertUser({
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

  // A few open availability slots over the next few days so the
  // appointments flow has something to book against out of the box.
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctor.id } });
  if (doctorProfile) {
    const existingSlots = await prisma.availabilitySlot.count({
      where: { doctorId: doctorProfile.id },
    });

    if (existingSlots === 0) {
      const now = new Date();
      const slotOffsets = [
        { days: 1, hour: 10 },
        { days: 1, hour: 14 },
        { days: 2, hour: 9 },
        { days: 3, hour: 11 },
      ];

      for (const { days, hour } of slotOffsets) {
        const start = new Date(now);
        start.setDate(start.getDate() + days);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);

        await prisma.availabilitySlot.create({
          data: { doctorId: doctorProfile.id, startTime: start, endTime: end },
        });
      }

      console.log("Seeded 4 sample availability slots for the demo doctor.");
    }
  }

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
