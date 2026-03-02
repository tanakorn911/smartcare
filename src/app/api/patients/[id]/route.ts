import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const role = request.headers.get("x-user-role");
        const patientIdFromToken = request.headers.get("x-patient-id");

        if (role === "PATIENT" && patientIdFromToken !== id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                healthRecords: {
                    orderBy: { date: "desc" },
                    take: 30,
                    include: { prediction: true },
                },
                notes: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
            },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const latestPrediction = patient.healthRecords[0]?.prediction || null;

        return NextResponse.json({
            id: patient.id,
            name: patient.user.name,
            email: patient.user.email,
            age: patient.age,
            gender: patient.gender,
            latestRiskLevel: latestPrediction?.riskLevel || null,
            latestProbability: latestPrediction?.probability || null,
            latestExplanation: latestPrediction?.explanation || null,
            records: patient.healthRecords.map((r) => ({
                id: r.id,
                date: r.date,
                temperature: r.temperature,
                heartRate: r.heartRate,
                systolic: r.systolic,
                diastolic: r.diastolic,
                symptom: r.symptom,
                riskLevel: r.prediction?.riskLevel || null,
                probability: r.prediction?.probability || null,
            })),
            notes: patient.notes.map((n) => ({
                id: n.id,
                content: n.content,
                createdAt: n.createdAt,
            })),
        });
    } catch (error) {
        console.error("Get patient error:", error);
        return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
    }
}

// Edit patient info (name, age, gender)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { name, age, gender } = await request.json();

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Update patient fields
        if (age !== undefined || gender !== undefined) {
            await prisma.patient.update({
                where: { id },
                data: {
                    ...(age !== undefined ? { age } : {}),
                    ...(gender !== undefined ? { gender } : {}),
                },
            });
        }

        // Update user name
        if (name) {
            await prisma.user.update({
                where: { id: patient.userId },
                data: { name },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update patient error:", error);
        return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
    }
}
