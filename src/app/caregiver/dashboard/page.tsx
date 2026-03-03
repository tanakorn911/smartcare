"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import RiskBadge from "@/components/RiskBadge";
import RiskTrendChart from "@/components/RiskTrendChart";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

interface PatientSummary {
    id: string; name: string; email: string; age: number; gender: string;
    latestRiskLevel: string | null; latestProbability: number | null;
}

type SortBy = "name" | "risk";
const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function CaregiverDashboard() {
    const { t } = useLanguage();
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortBy>("risk");
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", email: "", password: "", age: "", gender: "Male" });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");
    const [trendData, setTrendData] = useState<any[]>([]);

    // Toast notification state
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
    const [prevPatientCount, setPrevPatientCount] = useState<number | null>(null);

    const fetchPatients = useCallback(() => {
        Promise.all([
            fetch("/api/patients").then(res => res.json()),
            fetch("/api/analytics").then(res => res.json())
        ])
            .then(([patientsData, analyticsData]) => {
                if (prevPatientCount !== null && Array.isArray(patientsData) && patientsData.length > prevPatientCount) {
                    setToast({ message: t("toast.newRecord"), visible: true });
                    setTimeout(() => setToast({ message: "", visible: false }), 4000);
                }
                setPrevPatientCount(Array.isArray(patientsData) ? patientsData.length : 0);
                setPatients(Array.isArray(patientsData) ? patientsData : []);
                setTrendData(Array.isArray(analyticsData) ? analyticsData : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [prevPatientCount, t]);

    useEffect(() => { fetchPatients(); }, []);

    // Polling every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchPatients, 30000);
        return () => clearInterval(interval);
    }, [fetchPatients]);

    const sorted = [...patients].sort((a, b) => {
        if (sortBy === "risk") {
            return (riskOrder[b.latestRiskLevel || ""] || 0) - (riskOrder[a.latestRiskLevel || ""] || 0);
        }
        return a.name.localeCompare(b.name);
    });

    // Analytics
    const highCount = patients.filter(p => p.latestRiskLevel === "high").length;
    const mediumCount = patients.filter(p => p.latestRiskLevel === "medium").length;
    const lowCount = patients.filter(p => p.latestRiskLevel === "low").length;
    const noDataCount = patients.filter(p => !p.latestRiskLevel).length;
    const total = patients.length;

    // Pie chart percentages (calculated only from patients with assessments)
    const totalAssessed = highCount + mediumCount + lowCount;
    const highPct = totalAssessed > 0 ? (highCount / totalAssessed) * 100 : 0;
    const mediumPct = totalAssessed > 0 ? (mediumCount / totalAssessed) * 100 : 0;
    const lowPct = totalAssessed > 0 ? (lowCount / totalAssessed) * 100 : 0;

    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError("");
        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddError(res.status === 409 ? t("mgmt.emailExists") : data.error);
                return;
            }
            setShowAdd(false);
            setAddForm({ name: "", email: "", password: "", age: "", gender: "Male" });
            fetchPatients();
        } catch { setAddError("Error"); } finally { setAddLoading(false); }
    };

    // Conic gradient for pie chart
    const conicGradient = total > 0
        ? `conic-gradient(
            #ef4444 0% ${highPct}%,
            #f59e0b ${highPct}% ${highPct + mediumPct}%,
            #22c55e ${highPct + mediumPct}% ${highPct + mediumPct + lowPct}%,
            #cbd5e1 ${highPct + mediumPct + lowPct}% 100%
        )`
        : "conic-gradient(#e2e8f0 0% 100%)";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -50, x: "-50%" }}
                        className="fixed top-20 left-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("caregiver.dashboard.title")}</h1>
                        <p className="text-gray-500 mt-1">{t("caregiver.dashboard.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t("caregiver.dashboard.sortBy")}</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                                <option value="risk">{t("caregiver.dashboard.sortRisk")}</option>
                                <option value="name">{t("caregiver.dashboard.sortName")}</option>
                            </select>
                        </div>
                        <button onClick={() => setShowAdd(true)}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("mgmt.addPatient")}
                        </button>
                    </div>
                </div>

                {/* ── Analytics Summary Cards ── */}
                {!loading && patients.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        {/* Total */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all flex flex-col justify-between">
                            <p className="text-sm font-medium text-gray-500 mb-1">{t("analytics.totalPatients")}</p>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">{total}</p>
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">👥</div>
                            </div>
                        </div>
                        {/* High Risk */}
                        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 p-5 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(239,68,68,0.2)] transition-all flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-400 opacity-10 rounded-full -mr-8 -mt-8"></div>
                            <p className="text-sm font-medium text-red-600 mb-1">{t("analytics.highRisk")}</p>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-4xl font-bold text-red-600">{highCount}</p>
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">🚨</div>
                            </div>
                        </div>
                        {/* Medium Risk */}
                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 p-5 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.2)] transition-all flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400 opacity-10 rounded-full -mr-8 -mt-8"></div>
                            <p className="text-sm font-medium text-amber-600 mb-1">{t("analytics.mediumRisk")}</p>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-4xl font-bold text-amber-600">{mediumCount}</p>
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">⚠️</div>
                            </div>
                        </div>
                        {/* Low Risk */}
                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] transition-all flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400 opacity-10 rounded-full -mr-8 -mt-8"></div>
                            <p className="text-sm font-medium text-emerald-600 mb-1">{t("analytics.lowRisk")}</p>
                            <div className="flex items-end justify-between mt-2">
                                <p className="text-4xl font-bold text-emerald-600">{lowCount}</p>
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">✅</div>
                            </div>
                        </div>
                        {/* Line Chart & Pie Chart */}
                        <div className="col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                            <div className="lg:col-span-2 h-[400px]">
                                <RiskTrendChart data={trendData} />
                            </div>
                            <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all h-[400px]">
                                <p className="text-gray-800 font-semibold mb-2">{t("analytics.riskDistribution")}</p>
                                <div className="relative">
                                    <div
                                        className="w-36 h-36 rounded-full shadow-inner"
                                        style={{ background: conicGradient }}
                                    />
                                    <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center flex-col">
                                        <span className="text-xs text-gray-400 font-medium">Total</span>
                                        <span className="text-lg font-bold text-gray-800">{total}</span>
                                    </div>
                                </div>
                                <div className="w-full flex justify-center gap-4 text-xs font-medium text-gray-600 mt-2">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>{Math.round(highPct)}% High</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>{Math.round(mediumPct)}% Med</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>{Math.round(lowPct)}% Low</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Add Patient Modal */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("mgmt.addPatient")}</h2>
                            {addError && <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-600 text-sm">{addError}</div>}
                            <form onSubmit={handleAddPatient} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.name")}</label>
                                    <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.email")}</label>
                                    <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.password")}</label>
                                    <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required minLength={6}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.age")}</label>
                                        <input type="number" value={addForm.age} onChange={(e) => setAddForm({ ...addForm, age: e.target.value })} required min="1" max="150"
                                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.gender")}</label>
                                        <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                                            <option value="Male">{t("mgmt.male")}</option>
                                            <option value="Female">{t("mgmt.female")}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowAdd(false); setAddError(""); }}
                                        className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        {t("mgmt.cancel")}
                                    </button>
                                    <button type="submit" disabled={addLoading}
                                        className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50">
                                        {addLoading ? t("mgmt.creating") : t("mgmt.create")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (<div key={i} className="animate-pulse bg-white rounded-2xl h-20 border border-gray-200" />))}
                    </div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-12"><p className="text-gray-400">{t("caregiver.dashboard.noPatients")}</p></div>
                ) : (
                    <>
                        {/* Critical Alerts Section */}
                        {sorted.filter(p => p.latestRiskLevel === "high").length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    {t("mgmt.criticalAlerts")}
                                </h2>
                                <div className="space-y-3">
                                    {sorted.filter(p => p.latestRiskLevel === "high").map((patient) => (
                                        <motion.div
                                            key={`alert-${patient.id}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-red-50 rounded-2xl border-2 border-red-200 p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-200 text-red-700 rounded-full flex items-center justify-center">
                                                        <span className="font-semibold text-lg">{patient.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                                        <p className="text-sm text-red-600 font-medium">Requires immediate attention</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <RiskBadge level={patient.latestRiskLevel || "unknown"} size="md" />
                                                    <Link href={`/caregiver/patients/${patient.id}`}
                                                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all">
                                                        {t("caregiver.dashboard.viewDetail")}
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Patients */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t("mgmt.allPatients")}</h2>
                            <div className="space-y-3">
                                {sorted.map((patient, idx) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold text-lg">{patient.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                                    <p className="text-sm text-gray-500">{patient.age} {t("caregiver.dashboard.years")} • {patient.gender}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <RiskBadge level={patient.latestRiskLevel || "unknown"} size="md" />
                                                <Link href={`/caregiver/patients/${patient.id}`}
                                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all">
                                                    {t("caregiver.dashboard.viewDetail")}
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
