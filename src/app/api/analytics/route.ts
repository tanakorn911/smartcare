import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");

        if (role !== "CAREGIVER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get records from the last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const records = await prisma.healthRecord.findMany({
            where: {
                date: { gte: fourteenDaysAgo }
            },
            include: { prediction: true },
            orderBy: { date: "asc" }
        });

        // Group by date (YYYY-MM-DD)
        const dailyCounts: Record<string, { high: number, medium: number, low: number }> = {};

        records.forEach(r => {
            const dateStr = r.date.toISOString().split("T")[0];
            if (!dailyCounts[dateStr]) {
                dailyCounts[dateStr] = { high: 0, medium: 0, low: 0 };
            }
            const risk = r.prediction?.riskLevel;
            if (risk === "high") dailyCounts[dateStr].high++;
            else if (risk === "medium") dailyCounts[dateStr].medium++;
            else if (risk === "low") dailyCounts[dateStr].low++;
        });

        // Convert to array format for Recharts
        const trendData = Object.entries(dailyCounts).map(([date, counts]) => ({
            date,
            ...counts
        }));

        return NextResponse.json(trendData);
    } catch (error) {
        console.error("Get analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
