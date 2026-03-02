import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const patients = await prisma.patient.findMany({
            include: {
                user: { select: { name: true, email: true } },
                healthRecords: {
                    orderBy: { date: "desc" },
                    take: 1,
                    include: { prediction: true },
                },
            },
        });

        const result = patients.map((p) => ({
            id: p.id,
            name: p.user.name,
            email: p.user.email,
            age: p.age,
            gender: p.gender,
            latestRecord: p.healthRecords[0] || null,
            latestRiskLevel: p.healthRecords[0]?.prediction?.riskLevel || null,
            latestProbability: p.healthRecords[0]?.prediction?.probability || null,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Get patients error:", error);
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }
}

// Create new patient (caregiver only)
export async function POST(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { name, email, password, age, gender } = await request.json();

        if (!name || !email || !password || !age || !gender) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if email exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "PATIENT",
                patient: {
                    create: { age: parseInt(age), gender },
                },
            },
            include: { patient: true },
        });

        return NextResponse.json({
            id: user.patient!.id,
            name: user.name,
            email: user.email,
            age: user.patient!.age,
            gender: user.patient!.gender,
        }, { status: 201 });
    } catch (error) {
        console.error("Create patient error:", error);
        return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
    }
}
