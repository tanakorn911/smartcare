import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

enum Role {
    PATIENT = "PATIENT",
    CAREGIVER = "CAREGIVER",
}

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    await prisma.prediction.deleteMany();
    await prisma.healthRecord.deleteMany();
    await prisma.note.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create caregiver
    const caregiver = await prisma.user.create({
        data: {
            name: "Dr. Sarah Johnson",
            email: "caregiver@demo.com",
            password: hashedPassword,
            role: Role.CAREGIVER,
        },
    });
    console.log(`Created caregiver: ${caregiver.email}`);

    // Create patients
    const patientsData = [
        { name: "Alice Chen", email: "patient1@demo.com", age: 34, gender: "Female" },
        { name: "Bob Smith", email: "patient2@demo.com", age: 58, gender: "Male" },
        { name: "Carol Davis", email: "patient3@demo.com", age: 45, gender: "Female" },
    ];

    for (const p of patientsData) {
        const user = await prisma.user.create({
            data: {
                name: p.name,
                email: p.email,
                password: hashedPassword,
                role: Role.PATIENT,
                patient: {
                    create: {
                        age: p.age,
                        gender: p.gender,
                    },
                },
            },
            include: { patient: true },
        });

        const patientId = user.patient!.id;

        // Create sample health records (last 7 days)
        const symptoms = ["None", "Headache", "Fatigue", "Dizziness", "Cough"];
        const riskLevels = ["low", "low", "medium", "low", "medium", "high", "low"];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const isHighRisk = riskLevels[6 - i] === "high";
            const isMedium = riskLevels[6 - i] === "medium";

            const record = await prisma.healthRecord.create({
                data: {
                    patientId,
                    date,
                    temperature: isHighRisk
                        ? +(38.5 + Math.random() * 0.8).toFixed(1)
                        : isMedium
                            ? +(37.3 + Math.random() * 0.5).toFixed(1)
                            : +(36.3 + Math.random() * 0.5).toFixed(1),
                    heartRate: isHighRisk
                        ? 100 + Math.floor(Math.random() * 20)
                        : isMedium
                            ? 85 + Math.floor(Math.random() * 15)
                            : 65 + Math.floor(Math.random() * 15),
                    systolic: isHighRisk
                        ? 145 + Math.floor(Math.random() * 20)
                        : isMedium
                            ? 130 + Math.floor(Math.random() * 10)
                            : 110 + Math.floor(Math.random() * 15),
                    diastolic: isHighRisk
                        ? 92 + Math.floor(Math.random() * 10)
                        : isMedium
                            ? 85 + Math.floor(Math.random() * 8)
                            : 70 + Math.floor(Math.random() * 10),
                    symptom: isHighRisk
                        ? "Chest Pain"
                        : symptoms[Math.floor(Math.random() * symptoms.length)],
                },
            });

            // Create prediction
            const risk = riskLevels[6 - i];
            await prisma.prediction.create({
                data: {
                    healthRecordId: record.id,
                    riskLevel: risk,
                    probability: risk === "high" ? 0.85 : risk === "medium" ? 0.65 : 0.9,
                    explanation:
                        risk === "high"
                            ? "Multiple health indicators suggest elevated risk. Close monitoring is recommended."
                            : risk === "medium"
                                ? "Some health indicators are slightly outside the normal range. Regular monitoring is advised."
                                : "Health indicators are within the normal range. Continue regular monitoring.",
                },
            });
        }

        console.log(`Created patient: ${p.email} with 7 health records`);
    }

    console.log("\nSeed completed!");
    console.log("\nDemo accounts:");
    console.log("  Caregiver: caregiver@demo.com / password123");
    console.log("  Patient 1: patient1@demo.com / password123");
    console.log("  Patient 2: patient2@demo.com / password123");
    console.log("  Patient 3: patient3@demo.com / password123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
