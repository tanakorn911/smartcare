"use client";

import Navbar from "@/components/Navbar";
import HealthForm from "@/components/HealthForm";
import { useLanguage } from "@/components/LanguageProvider";

export default function NewRecordPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{t("form.title")}</h1>
                    <p className="text-gray-500 mt-1">{t("form.subtitle")}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                    <HealthForm />
                </div>
            </main>
        </div>
    );
}
