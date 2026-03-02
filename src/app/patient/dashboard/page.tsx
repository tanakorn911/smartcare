"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RiskBadge from "@/components/RiskBadge";
import ChartPanel from "@/components/ChartPanel";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

interface PatientData {
    latestRiskLevel: string | null;
    latestExplanation: string | null;
    records: Array<{
        date: string; temperature: number; heartRate: number;
        systolic: number; diastolic: number; symptom: string; riskLevel: string | null;
    }>;
}

export default function PatientDashboard() {
    const { t } = useLanguage();
    const [data, setData] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
        if (token) {
            try { setPatientId(JSON.parse(atob(token.split(".")[1])).patientId); } catch { }
        }
    }, []);

    useEffect(() => {
        if (!patientId) return;
        fetch(`/api/patients/${patientId}`)
            .then((res) => res.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [patientId]);

    const totalPages = data?.records ? Math.ceil(data.records.length / ITEMS_PER_PAGE) : 0;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedRecords = data?.records?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{t("patient.dashboard.title")}</h1>
                    <p className="text-gray-500 mt-1">{t("patient.dashboard.subtitle")}</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <div className="animate-pulse bg-white rounded-2xl h-40 border border-gray-200" />
                        <div className="animate-pulse bg-white rounded-2xl h-72 border border-gray-200" />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">{t("patient.dashboard.healthStatus")}</h2>
                                {data?.latestRiskLevel && <RiskBadge level={data.latestRiskLevel} size="lg" />}
                            </div>
                            {data?.latestExplanation ? (
                                <p className="text-gray-600 text-sm">{data.latestExplanation}</p>
                            ) : (
                                <p className="text-gray-400 text-sm">{t("patient.dashboard.noAssessment")}</p>
                            )}
                        </div>

                        <Link href="/patient/new-record"
                            className="block w-full rounded-2xl bg-blue-600 px-6 py-5 text-center text-lg font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all mb-8">
                            <span className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {t("patient.dashboard.recordButton")}
                            </span>
                        </Link>

                        {data?.records && data.records.length > 0 && (
                            <ChartPanel data={data.records.slice(0, 14).reverse().map((r) => ({
                                date: r.date, temperature: r.temperature, heartRate: r.heartRate, systolic: r.systolic, diastolic: r.diastolic,
                            }))} />
                        )}

                        {data?.records && data.records.length > 0 && (
                            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("patient.dashboard.recentRecords")}</h3>
                                <div className="space-y-3">
                                    {paginatedRecords.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                                <p className="text-xs text-gray-400">HR: {r.heartRate} | BP: {r.systolic}/{r.diastolic} | {t(`symptom.${r.symptom}`)}</p>
                                            </div>
                                            {r.riskLevel && <RiskBadge level={r.riskLevel} size="sm" />}
                                        </div>
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {t("patient.dashboard.prev")}
                                        </button>
                                        <span className="text-sm text-gray-500">
                                            {t("patient.dashboard.page")} {page} {t("patient.dashboard.of")} {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {t("patient.dashboard.next")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
