"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RiskBadge from "@/components/RiskBadge";
import ChartPanel from "@/components/ChartPanel";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface NoteItem { id: string; content: string; createdAt: string; }

interface PatientDetail {
    id: string; name: string; email: string; age: number; gender: string;
    latestRiskLevel: string | null; latestProbability: number | null; latestExplanation: string | null;
    records: Array<{
        id: string; date: string; temperature: number; heartRate: number;
        systolic: number; diastolic: number; symptom: string; riskLevel: string | null; probability: number | null;
    }>;
    notes: NoteItem[];
}

export default function PatientDetailPage() {
    const params = useParams();
    const { t } = useLanguage();
    const [patient, setPatient] = useState<PatientDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Print setup
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Medical_Report_${patient?.name || "Patient"}`,
    });

    // Edit state
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", age: "", gender: "" });
    const [editLoading, setEditLoading] = useState(false);

    // Notes state
    const [noteText, setNoteText] = useState("");
    const [noteLoading, setNoteLoading] = useState(false);
    // Pagination state
    const [page, setPage] = useState(1);
    const recordsPerPage = 10;
    const totalPages = Math.ceil((patient?.records.length || 0) / recordsPerPage);
    const paginatedRecords = patient?.records.slice((page - 1) * recordsPerPage, page * recordsPerPage) || [];

    const fetchPatient = () => {
        if (!params.id) return;
        fetch(`/api/patients/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                setPatient(data);
                setEditForm({ name: data.name, age: String(data.age), gender: data.gender });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchPatient(); }, [params.id]);

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const res = await fetch(`/api/patients/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editForm.name, age: parseInt(editForm.age), gender: editForm.gender }),
            });
            if (res.ok) {
                setShowEdit(false);
                fetchPatient();
            }
        } catch { } finally { setEditLoading(false); }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setNoteLoading(true);
        try {
            const res = await fetch(`/api/patients/${params.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: noteText }),
            });
            if (res.ok) {
                setNoteText("");
                fetchPatient();
            }
        } catch { } finally { setNoteLoading(false); }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm(t("mgmt.confirmDeleteNote"))) return;
        try {
            const res = await fetch(`/api/patients/${params.id}/notes`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId }),
            });
            if (res.ok) fetchPatient();
        } catch { }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/caregiver/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t("detail.backToList")}
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{patient?.name ? `${patient.name}'s Report` : ""}</h1>
                    {patient && (
                        <button onClick={() => handlePrint()}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            {t("mgmt.exportReport")}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <div className="animate-pulse bg-white rounded-2xl h-40 border border-gray-200" />
                        <div className="animate-pulse bg-white rounded-2xl h-72 border border-gray-200" />
                    </div>
                ) : !patient ? (
                    <div className="text-center py-12"><p className="text-gray-400">{t("detail.notFound")}</p></div>
                ) : (
                    <>
                        {/* Hidden Print UI */}
                        <div style={{ display: "none" }}>
                            <div ref={printRef} className="p-8 bg-white text-black font-sans">
                                <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                                    <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-2">{t("mgmt.exportReport")}</h1>
                                    <p className="text-gray-500">{t("detail.date")}: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-lg font-bold bg-gray-100 p-2 mb-3 text-gray-800 uppercase tracking-wider">{t("mgmt.patientInfo")}</h2>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-semibold text-gray-600">{t("mgmt.name")}:</span> <span className="text-gray-900">{patient.name}</span></div>
                                        <div><span className="font-semibold text-gray-600">{t("mgmt.age")}:</span> <span className="text-gray-900">{patient.age} {t("caregiver.dashboard.years")}</span></div>
                                        <div><span className="font-semibold text-gray-600">{t("mgmt.gender")}:</span> <span className="text-gray-900">{patient.gender}</span></div>
                                        <div><span className="font-semibold text-gray-600">{t("mgmt.email")}:</span> <span className="text-gray-900">{patient.email}</span></div>
                                    </div>
                                </div>

                                {patient.latestExplanation && (
                                    <div className="mb-8">
                                        <h2 className="text-lg font-bold bg-gray-100 p-2 mb-3 text-gray-800 uppercase tracking-wider">{t("form.healthStatus")} / AI Assessment</h2>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-600">{t("detail.risk")}:</span>
                                            <span className="font-bold uppercase text-gray-900">{patient.latestRiskLevel}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 border border-gray-200 rounded-lg">{patient.latestExplanation}</p>
                                    </div>
                                )}

                                {patient.records.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-lg font-bold bg-gray-100 p-2 mb-3 text-gray-800 uppercase tracking-wider">{t("detail.healthRecords")}</h2>
                                        <table className="w-full text-sm border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.date")}</th>
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.temp")}</th>
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.hr")}</th>
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.bp")}</th>
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.symptom")}</th>
                                                    <th className="border border-gray-300 py-2 px-3 text-left font-semibold text-gray-700">{t("detail.risk")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patient.records.slice(0, 15).map((r) => (
                                                    <tr key={`print-${r.id}`}>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800">{r.temperature}°C</td>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800">{r.heartRate}</td>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800">{r.systolic}/{r.diastolic}</td>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800">{t(`symptom.${r.symptom}`)}</td>
                                                        <td className="border border-gray-300 py-2 px-3 text-gray-800 uppercase">{r.riskLevel}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {patient.notes.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-lg font-bold bg-gray-100 p-2 mb-3 text-gray-800 uppercase tracking-wider">{t("mgmt.notes")}</h2>
                                        <div className="space-y-3">
                                            {patient.notes.map((note) => (
                                                <div key={`print-note-${note.id}`} className="border-b border-gray-200 pb-2">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                    <p className="text-sm text-gray-800">{note.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-16 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
                                    <p>Confidential Medical Document • Generated by SmartCare • {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Screen UI */}
                        <div className="bg-transparent">
                            {/* Patient Info */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-xl">{patient.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
                                            <p className="text-sm text-gray-500">{patient.age} {t("caregiver.dashboard.years")} • {patient.gender} • {patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {patient.latestRiskLevel && <RiskBadge level={patient.latestRiskLevel} size="lg" />}
                                        <button onClick={() => setShowEdit(true)}
                                            className="ml-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            {t("mgmt.editPatient")}
                                        </button>
                                    </div>
                                </div>
                                {patient.latestExplanation && (
                                    <p className="mt-4 text-gray-600 text-sm bg-gray-50 rounded-xl p-4">{patient.latestExplanation}</p>
                                )}
                            </div>

                            {/* Edit Modal */}
                            {showEdit && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t("mgmt.editPatient")}</h2>
                                        <form onSubmit={handleEdit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.name")}</label>
                                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.age")}</label>
                                                    <input type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} required min="1" max="150"
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("mgmt.gender")}</label>
                                                    <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                                                        <option value="Male">{t("mgmt.male")}</option>
                                                        <option value="Female">{t("mgmt.female")}</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={() => setShowEdit(false)}
                                                    className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                    {t("mgmt.cancel")}
                                                </button>
                                                <button type="submit" disabled={editLoading}
                                                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50">
                                                    {editLoading ? t("mgmt.saving") : t("mgmt.save")}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Chart */}
                            {patient.records.length > 0 && (
                                <ChartPanel data={patient.records.slice(0, 14).reverse().map((r) => ({
                                    date: r.date, temperature: r.temperature, heartRate: r.heartRate, systolic: r.systolic, diastolic: r.diastolic,
                                }))} />
                            )}

                            {/* Notes */}
                            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("mgmt.notes")}</h3>

                                <div className="flex gap-2 mb-4">
                                    <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                                        placeholder={t("mgmt.notePlaceholder")}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddNote(); }}
                                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                                    <button onClick={handleAddNote} disabled={noteLoading || !noteText.trim()}
                                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50">
                                        {noteLoading ? "..." : t("mgmt.addNote")}
                                    </button>
                                </div>

                                {patient.notes.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">{t("mgmt.noNotes")}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {patient.notes.map((note) => (
                                            <div key={note.id} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between group">
                                                <div>
                                                    <p className="text-sm text-gray-700">{note.content}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                                <button onClick={() => handleDeleteNote(note.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                                                    title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Health Records Table */}
                            {patient.records.length > 0 && (
                                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("detail.healthRecords")}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t("detail.date")}</th>
                                                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t("detail.temp")}</th>
                                                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t("detail.hr")}</th>
                                                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t("detail.bp")}</th>
                                                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t("detail.symptom")}</th>
                                                    <th className="text-left py-2 font-medium text-gray-500">{t("detail.risk")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedRecords.map((r) => (
                                                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                                                        <td className="py-2.5 pr-4 text-gray-700">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                                                        <td className="py-2.5 pr-4 text-gray-700">{r.temperature}°C</td>
                                                        <td className="py-2.5 pr-4 text-gray-700">{r.heartRate}</td>
                                                        <td className="py-2.5 pr-4 text-gray-700">{r.systolic}/{r.diastolic}</td>
                                                        <td className="py-2.5 pr-4 text-gray-700">{t(`symptom.${r.symptom}`)}</td>
                                                        <td className="py-2.5">{r.riskLevel && <RiskBadge level={r.riskLevel} size="sm" />}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                            >
                                                {t("pagination.prev")}
                                            </button>
                                            <span className="text-sm text-gray-500">
                                                {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                            >
                                                {t("pagination.next")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
