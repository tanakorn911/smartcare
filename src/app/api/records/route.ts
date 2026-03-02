import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const patientId = request.headers.get("x-patient-id");

        if (!patientId) {
            return NextResponse.json(
                { error: "Patient ID not found" },
                { status: 400 }
            );
        }

        const { temperature, heartRate, systolic, diastolic, symptom } =
            await request.json();

        if (!temperature || !heartRate || !systolic || !diastolic || !symptom) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const record = await prisma.healthRecord.create({
            data: {
                patientId,
                temperature,
                heartRate,
                systolic,
                diastolic,
                symptom,
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error("Create record error:", error);
        return NextResponse.json(
            { error: "Failed to create record" },
            { status: 500 }
        );
    }
}
