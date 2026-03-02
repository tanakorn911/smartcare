"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import RiskBadge from "@/components/RiskBadge";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

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

    const fetchPatients = () => {
        fetch("/api/patients")
            .then((res) => res.json())
            .then((data) => { setPatients(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchPatients(); }, []);

    const sorted = [...patients].sort((a, b) => {
        if (sortBy === "risk") {
            return (riskOrder[b.latestRiskLevel || ""] || 0) - (riskOrder[a.latestRiskLevel || ""] || 0);
        }
        return a.name.localeCompare(b.name);
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
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

                {/* Add Patient Modal */}
                {showAdd && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
                        </div>
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
                                        <div key={`alert-${patient.id}`} className="bg-red-50 rounded-2xl border-2 border-red-200 p-5 hover:shadow-md transition-shadow">
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Patients */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t("mgmt.allPatients")}</h2>
                            <div className="space-y-3">
                                {sorted.map((patient) => (
                                    <div key={patient.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
