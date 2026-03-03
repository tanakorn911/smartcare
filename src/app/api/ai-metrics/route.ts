import { NextResponse } from "next/server";

export async function GET() {
    try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${aiServiceUrl}/metrics`, {
            // Keep it fast, fail quickly if AI service is down
            signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) {
            throw new Error(`AI service returned ${response.status}`);
        }

        const metrics = await response.json();
        return NextResponse.json(metrics);

    } catch (error) {
        console.error("Failed to fetch AI metrics:", error);
        return NextResponse.json(
            { error: "AI service metrics unavailable" },
            { status: 503 }
        );
    }
}
