"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

const SYMPTOMS = [
    "None", "Headache", "Fatigue", "Dizziness", "Chest Pain",
    "Shortness of Breath", "Nausea", "Fever", "Cough", "Body Aches",
];

export default function HealthForm() {
    const router = useRouter();
    const { locale, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        riskLevel: string; probability: number; explanation: string;
    } | null>(null);
    const [countdown, setCountdown] = useState(10);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (result && !isPaused && countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (result && !isPaused && countdown === 0) {
            router.push("/patient/dashboard");
        }
    }, [result, countdown, isPaused, router]);

    const [form, setForm] = useState({
        temperature: "", heartRate: "", systolic: "", diastolic: "", symptom: "None",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const recordRes = await fetch("/api/records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperature: parseFloat(form.temperature),
                    heartRate: parseInt(form.heartRate),
                    systolic: parseInt(form.systolic),
                    diastolic: parseInt(form.diastolic),
                    symptom: form.symptom,
                }),
            });

            if (!recordRes.ok) throw new Error("Failed to save record");
            const record = await recordRes.json();

            const predictRes = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ healthRecordId: record.id, lang: locale }),
            });

            if (!predictRes.ok) throw new Error("Failed to get assessment");
            const prediction = await predictRes.json();

            setResult({
                riskLevel: prediction.riskLevel,
                probability: prediction.probability,
                explanation: prediction.explanation,
            });

            setCountdown(10);
            setIsPaused(false);
        } catch (err) {
            console.error(err);
            alert(t("form.error"));
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        const bgColor = result.riskLevel === "high" ? "bg-red-50 border-red-200" : result.riskLevel === "medium" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";
        const textColor = result.riskLevel === "high" ? "text-red-800" : result.riskLevel === "medium" ? "text-amber-800" : "text-emerald-800";

        return (
            <div className={`rounded-2xl border-2 p-8 text-center ${bgColor}`}>
                <div className="mb-4">
                    <svg className={`mx-auto h-16 w-16 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>{t("form.assessmentComplete")}</h3>
                <p className={`text-lg font-semibold mb-1 capitalize ${textColor}`}>
                    {t("form.healthStatus")}: {result.riskLevel} {t("form.risk")}
                </p>
                <p className="text-gray-600 mb-4">{result.explanation}</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={() => router.push("/patient/dashboard")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${bgColor} ${textColor} hover:bg-opacity-50 transition-colors`}>
                        {t("form.goToDashboard")}
                    </button>
                    <button onClick={() => setIsPaused(!isPaused)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${bgColor} ${textColor} hover:bg-opacity-50 transition-colors`}>
                        {isPaused ? t("form.resumeRedirect") : t("form.pauseRedirect")}
                    </button>
                </div>
                {!isPaused && (
                    <p className="mt-4 text-sm text-gray-500">
                        {t("form.redirectingIn")} {countdown} {t("form.seconds")}
                    </p>
                )}
                {isPaused && (
                    <p className="mt-4 text-sm text-gray-500">
                        {t("form.redirectPaused")}
                    </p>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("form.temperature")}</label>
                    <input type="number" name="temperature" value={form.temperature} onChange={handleChange} step="0.1" min="35" max="42" required placeholder={t("form.temperaturePlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("form.heartRate")}</label>
                    <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} min="40" max="200" required placeholder={t("form.heartRatePlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("form.systolic")}</label>
                    <input type="number" name="systolic" value={form.systolic} onChange={handleChange} min="70" max="250" required placeholder={t("form.systolicPlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("form.diastolic")}</label>
                    <input type="number" name="diastolic" value={form.diastolic} onChange={handleChange} min="40" max="150" required placeholder={t("form.diastolicPlaceholder")}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("form.symptom")}</label>
                <select name="symptom" value={form.symptom} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white">
                    {SYMPTOMS.map((s) => (<option key={s} value={s}>{t(`symptom.${s}`)}</option>))}
                </select>
            </div>

            <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("form.analyzing")}
                    </span>
                ) : t("form.submit")}
            </button>
        </form>
    );
}
