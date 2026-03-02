import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    try {
        const { healthRecordId, lang } = await request.json();

        if (!healthRecordId) {
            return NextResponse.json(
                { error: "healthRecordId is required" },
                { status: 400 }
            );
        }

        const record = await prisma.healthRecord.findUnique({
            where: { id: healthRecordId },
        });

        if (!record) {
            return NextResponse.json(
                { error: "Health record not found" },
                { status: 404 }
            );
        }

        let prediction;

        try {
            // Call Python AI service
            const aiResponse = await fetch(`${AI_SERVICE_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperature: record.temperature,
                    heart_rate: record.heartRate,
                    systolic: record.systolic,
                    diastolic: record.diastolic,
                    symptom: record.symptom,
                    lang: lang || "en",
                }),
            });

            if (aiResponse.ok) {
                prediction = await aiResponse.json();
            } else {
                throw new Error("AI service returned error");
            }
        } catch {
            // Fallback: simple rule-based assessment if AI service is down
            prediction = fallbackPrediction(record);
        }

        // Save prediction to database
        const saved = await prisma.prediction.create({
            data: {
                healthRecordId,
                riskLevel: prediction.risk_level,
                probability: prediction.probability,
                explanation: prediction.explanation,
            },
        });

        return NextResponse.json({
            riskLevel: saved.riskLevel,
            probability: saved.probability,
            explanation: saved.explanation,
        });
    } catch (error) {
        console.error("Predict error:", error);
        return NextResponse.json(
            { error: "Failed to get prediction" },
            { status: 500 }
        );
    }
}

// Fallback when AI service is unavailable
function fallbackPrediction(record: {
    temperature: number;
    heartRate: number;
    systolic: number;
    diastolic: number;
    symptom: string;
}) {
    let score = 0;

    if (record.temperature > 38.5) score += 2;
    else if (record.temperature > 37.5) score += 1;

    if (record.heartRate > 100) score += 2;
    else if (record.heartRate > 90) score += 1;

    if (record.systolic > 140) score += 2;
    else if (record.systolic > 130) score += 1;

    if (record.diastolic > 90) score += 2;
    else if (record.diastolic > 85) score += 1;

    const severeSymptoms = ["Chest Pain", "Shortness of Breath"];
    const moderateSymptoms = ["Dizziness", "Fever", "Nausea"];

    if (severeSymptoms.includes(record.symptom)) score += 3;
    else if (moderateSymptoms.includes(record.symptom)) score += 1;

    let risk_level: string;
    let probability: number;
    let explanation: string;

    if (score >= 5) {
        risk_level = "high";
        probability = Math.min(0.7 + score * 0.03, 0.95);
        explanation =
            "Multiple health indicators suggest elevated risk. Close monitoring is recommended.";
    } else if (score >= 2) {
        risk_level = "medium";
        probability = 0.4 + score * 0.05;
        explanation =
            "Some health indicators are slightly outside the normal range. Regular monitoring is advised.";
    } else {
        risk_level = "low";
        probability = 0.8 + score * 0.05;
        explanation =
            "Health indicators are within the normal range. Continue regular monitoring.";
    }

    return { risk_level, probability, explanation };
}
