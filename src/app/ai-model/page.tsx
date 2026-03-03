"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { motion } from "framer-motion";

interface ModelMetrics {
    selected_model: string;
    dataset_size: number;
    test_size: number;
    feature_names: string[];
    feature_importance: Record<string, number>;
    model_comparison: Record<string, { accuracy: number; f1_score: number; cv_mean: number; cv_std: number }>;
    confusion_matrix: number[][];
    classes: string[];
}

export default function AIModelPage() {
    const { t } = useLanguage();
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/ai-metrics")
            .then((res) => res.json())
            .then((data) => { setMetrics(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const featureLabels: Record<string, string> = {
        temperature: "🌡️ Temperature",
        heart_rate: "💓 Heart Rate",
        systolic: "🔴 Systolic BP",
        diastolic: "🔵 Diastolic BP",
        symptom: "🩺 Symptom",
    };

    const classColors: Record<string, string> = {
        low: "bg-emerald-500",
        medium: "bg-amber-500",
        high: "bg-red-500",
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">🧠 AI Model Architecture</h1>
                    <p className="text-gray-500 mt-2">How SmartCare AI assesses health risk using Explainable AI</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-white rounded-2xl h-40 border border-gray-200" />)}
                    </div>
                ) : !metrics ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">AI service is not running. Start it with: <code className="bg-gray-100 px-2 py-1 rounded">uvicorn main:app --port 8000</code></p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pipeline Overview */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">🔬 ML Pipeline</h2>
                            <div className="flex items-center justify-between gap-2 overflow-x-auto">
                                {["Health Data", "Feature Extraction", "Random Forest", "SHAP Explainer", "Risk + Score"].map((step, i) => (
                                    <div key={step} className="flex items-center gap-2">
                                        <div className={`px-4 py-3 rounded-xl text-sm font-medium text-center min-w-[100px] ${i === 2 ? "bg-blue-600 text-white shadow-lg" : i === 3 ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-gray-100 text-gray-700"}`}>
                                            {step}
                                        </div>
                                        {i < 4 && <span className="text-gray-300 text-xl flex-shrink-0">→</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Model Comparison */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Model Comparison</h2>
                            <p className="text-sm text-gray-500 mb-4">Trained on {metrics.dataset_size} samples, tested on {metrics.test_size}</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-3 font-medium text-gray-500">Model</th>
                                            <th className="text-center py-3 px-3 font-medium text-gray-500">Accuracy</th>
                                            <th className="text-center py-3 px-3 font-medium text-gray-500">F1-Score</th>
                                            <th className="text-center py-3 px-3 font-medium text-gray-500">CV Mean (5-fold)</th>
                                            <th className="text-center py-3 px-3 font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(metrics.model_comparison).map(([name, m]) => (
                                            <tr key={name} className={`border-b border-gray-100 ${name === metrics.selected_model ? "bg-blue-50" : ""}`}>
                                                <td className="py-3 px-3 font-medium text-gray-900">{name}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`font-bold ${name === metrics.selected_model ? "text-blue-600" : "text-gray-700"}`}>
                                                        {(m.accuracy * 100).toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center text-gray-700">{m.f1_score.toFixed(4)}</td>
                                                <td className="py-3 px-3 text-center text-gray-700">{m.cv_mean.toFixed(4)} ± {m.cv_std.toFixed(4)}</td>
                                                <td className="py-3 px-3 text-center">
                                                    {name === metrics.selected_model ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">✅ Selected</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Feature Importance */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">📈 Feature Importance</h2>
                            <div className="space-y-4">
                                {Object.entries(metrics.feature_importance)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([feature, importance], i) => (
                                        <motion.div key={feature}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">{featureLabels[feature] || feature}</span>
                                                <span className="text-sm font-bold text-blue-600">{(importance * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${importance * 100}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        </motion.div>

                        {/* Confusion Matrix */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Confusion Matrix</h2>
                            <p className="text-sm text-gray-500 mb-4">How well the model classifies each risk level</p>
                            <div className="overflow-x-auto">
                                <table className="mx-auto text-sm">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4"></th>
                                            {metrics.classes.map((c) => (
                                                <th key={c} className="py-2 px-4 text-center font-medium text-gray-500 capitalize">
                                                    Pred: {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.confusion_matrix.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-2 px-4 font-medium text-gray-700 capitalize">Actual: {metrics.classes[i]}</td>
                                                {row.map((val, j) => (
                                                    <td key={j} className="py-2 px-4 text-center">
                                                        <span className={`inline-block w-14 py-2 rounded-lg font-bold ${i === j
                                                            ? `${classColors[metrics.classes[i]]} text-white`
                                                            : val > 0 ? "bg-red-100 text-red-700" : "bg-gray-50 text-gray-400"
                                                            }`}>
                                                            {val}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* SHAP Explainability */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
                            <h2 className="text-lg font-bold text-purple-800 mb-3">🧪 SHAP Explainability</h2>
                            <p className="text-sm text-purple-700 leading-relaxed mb-4">
                                Every prediction includes <strong>SHAP (SHapley Additive exPlanations)</strong> values
                                that show exactly which health factors contributed to the risk assessment.
                                This provides transparency and trust in AI-driven decisions.
                            </p>
                            <div className="grid sm:grid-cols-3 gap-3">
                                <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                                    <p className="font-bold text-purple-800 mb-1">TreeExplainer</p>
                                    <p className="text-xs text-purple-600">Exact SHAP values for tree-based models</p>
                                </div>
                                <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                                    <p className="font-bold text-purple-800 mb-1">Per-Feature</p>
                                    <p className="text-xs text-purple-600">Shows contribution of each vital sign</p>
                                </div>
                                <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                                    <p className="font-bold text-purple-800 mb-1">Bilingual</p>
                                    <p className="text-xs text-purple-600">Explanations in English & Thai</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
