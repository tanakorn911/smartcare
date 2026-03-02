"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface NavItem {
    label: string;
    href: string;
}

function parseToken(): { role: string; email: string; patientId?: string } | null {
    if (typeof document === "undefined") return null;
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
            role: payload.role,
            email: payload.email,
            patientId: payload.patientId,
        };
    } catch {
        return null;
    }
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { locale, setLocale, t } = useLanguage();
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const parsed = parseToken();
        if (parsed) {
            setRole(parsed.role);
            setUserName(parsed.email?.split("@")[0] || "User");
        }
    }, [pathname]);

    const handleLogout = () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
            window.location.href = "/";
        });
    };

    const toggleLocale = () => {
        setLocale(locale === "en" ? "th" : "en");
    };

    const navItems: NavItem[] =
        role === "PATIENT"
            ? [
                { label: t("nav.dashboard"), href: "/patient/dashboard" },
                { label: t("nav.recordHealth"), href: "/patient/new-record" },
            ]
            : role === "CAREGIVER"
                ? [{ label: t("nav.dashboard"), href: "/caregiver/dashboard" }]
                : [];

    if (!mounted) return null;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href={
                            role === "PATIENT"
                                ? "/patient/dashboard"
                                : role === "CAREGIVER"
                                    ? "/caregiver/dashboard"
                                    : "/login"
                        }
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
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
                        <span className="text-lg font-bold text-gray-900">SmartCare</span>
                    </Link>

                    {/* Nav Links + Language + Logout */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLocale}
                            className="ml-2 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                            title={locale === "en" ? "Switch to Thai" : "เปลี่ยนเป็นภาษาอังกฤษ"}
                        >
                            {locale === "en" ? "🇹🇭 TH" : "🇬🇧 EN"}
                        </button>

                        {role && (
                            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    {userName}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 transition-colors font-medium"
                                >
                                    {t("nav.logout")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
