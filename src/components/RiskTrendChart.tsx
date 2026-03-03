"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { useLanguage } from "@/components/LanguageProvider";

interface TrendData {
    date: string;
    high: number;
    medium: number;
    low: number;
}

export default function RiskTrendChart({ data }: { data: TrendData[] }) {
    const { t } = useLanguage();

    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center h-full flex items-center justify-center">
                <p className="text-gray-400">{t("analytics.trendMissing")}</p>
            </div>
        );
    }

    const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {t("analytics.trendTitle")}
                </h3>
                <p className="text-sm text-gray-500">{t("analytics.trendDesc")}</p>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatted} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                        <defs>
                            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} />
                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" strokeWidth={3} dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        <Area type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMedium)" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        <Area type="monotone" dataKey="low" name="Low Risk" stroke="#10b981" fillOpacity={1} fill="url(#colorLow)" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
