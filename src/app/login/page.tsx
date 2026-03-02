"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
    const router = useRouter();
    const { locale, setLocale, t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                    if (payload.role === "PATIENT") {
                        router.replace("/patient/dashboard");
                        return;
                    } else if (payload.role === "CAREGIVER") {
                        router.replace("/caregiver/dashboard");
                        return;
                    }
                }
            } catch {
                // Invalid token
            }
        }
        setChecking(false);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            if (data.role === "PATIENT") {
                window.location.href = "/patient/dashboard";
            } else {
                window.location.href = "/caregiver/dashboard";
            }
        } catch {
            setError(t("form.error"));
        } finally {
            setLoading(false);
        }
    };

    const toggleLocale = () => {
        setLocale(locale === "en" ? "th" : "en");
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="animate-pulse text-gray-400">{t("patient.dashboard.loading")}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
            {/* Language Toggle - top right */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleLocale}
                    className="px-3 py-2 rounded-xl bg-white shadow-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    {locale === "en" ? "🇹🇭 ภาษาไทย" : "🇬🇧 English"}
                </button>
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
                        <svg
                            className="w-9 h-9 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t("login.title")}</h1>
                    <p className="text-gray-500 mt-1">{t("login.subtitle")}</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        {t("login.heading")}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("login.email")}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t("login.emailPlaceholder")}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t("login.password")}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={t("login.passwordPlaceholder")}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t("login.submitting") : t("login.submit")}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center mb-3">
                            {t("login.demoTitle")}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                                <span>{t("login.patient")}:</span>
                                <span className="font-mono text-gray-700">patient1@demo.com</span>
                            </div>
                            <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                                <span>{t("login.caregiver")}:</span>
                                <span className="font-mono text-gray-700">caregiver@demo.com</span>
                            </div>
                            <p className="text-xs text-center text-gray-400">
                                {t("login.demoPassword")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
