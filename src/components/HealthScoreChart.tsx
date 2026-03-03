"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface ScoreData {
    date: string;
    score: number;
}

export default function HealthScoreChart({ data }: { data: ScoreData[] }) {
    const { t } = useLanguage();

    if (!data || data.length === 0 || data.every(d => d.score === 0)) {
        return null;
    }

    const formatted = data.map((d) => ({
        ...d,
        fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        shortDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        displayDate: "",
    }));

    // To prevent overlapping full dates, we show the Date for the first record of the day,
    // and just the Time for subsequent records on that same day.
    let lastSeenDate = "";
    formatted.forEach((item) => {
        if (item.shortDate !== lastSeenDate) {
            item.displayDate = item.shortDate;
            lastSeenDate = item.shortDate;
        } else {
            item.displayDate = new Date(item.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        }
    });

    return (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                    📈 {t("patient.dashboard.scoreTrend")}
                </h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {t("patient.dashboard.overallProgress")}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-6">{t("patient.dashboard.scoreDesc")}</p>

            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
                        formatter={(value: any) => [`${value} / 100`, t("healthScore.title")]}
                        labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate || _label}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreColor)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
