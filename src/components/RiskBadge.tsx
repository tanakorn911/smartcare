"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface RiskBadgeProps {
    level: string;
    size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
    const { t } = useLanguage();
    const normalized = level?.toLowerCase() || "unknown";

    const colors: Record<string, string> = {
        low: "bg-emerald-100 text-emerald-800 border-emerald-300",
        medium: "bg-amber-100 text-amber-800 border-amber-300",
        high: "bg-red-100 text-red-800 border-red-300",
        unknown: "bg-gray-100 text-gray-600 border-gray-300",
    };

    const labelKeys: Record<string, string> = {
        low: "risk.low",
        medium: "risk.medium",
        high: "risk.high",
        unknown: "risk.unknown",
    };

    const sizes: Record<string, string> = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base font-semibold",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border font-medium ${colors[normalized] || colors.unknown
                } ${sizes[size]}`}
        >
            <span
                className={`mr-1.5 h-2 w-2 rounded-full ${normalized === "low"
                        ? "bg-emerald-500"
                        : normalized === "medium"
                            ? "bg-amber-500"
                            : normalized === "high"
                                ? "bg-red-500"
                                : "bg-gray-400"
                    }`}
            />
            {t(labelKeys[normalized] || labelKeys.unknown)}
        </span>
    );
}
