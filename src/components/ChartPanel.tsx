"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface HealthData {
    date: string;
    temperature: number;
    heartRate: number;
    systolic: number;
    diastolic: number;
}

interface ChartPanelProps {
    data: HealthData[];
}

export default function ChartPanel({ data }: ChartPanelProps) {
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                <p className="text-gray-400">{t("chart.noData")}</p>
            </div>
        );
    }

    const formatted = data.map((d) => ({
        ...d,
        fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        shortDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        displayDate: "",
    }));

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
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t("chart.title")}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} stroke="#9ca3af" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate || _label}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name={t("chart.heartRate")} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="systolic" stroke="#3b82f6" name={t("chart.systolic")} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#8b5cf6" name={t("chart.diastolic")} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
