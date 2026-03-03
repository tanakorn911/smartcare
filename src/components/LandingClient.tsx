"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, ShieldCheck, HeartPulse, BrainCircuit, Globe2, ArrowRight, ClipboardList, Sparkles, BarChart3 } from "lucide-react";

const stats = [
    { value: "500+", label: "landing.stats.patients", icon: HeartPulse },
    { value: "2,000+", label: "landing.stats.assessments", icon: BrainCircuit },
    { value: "2", label: "landing.stats.languages", icon: Globe2 },
    { value: "99.9%", label: "landing.stats.uptime", icon: Activity },
];

const steps = [
    { icon: ClipboardList, color: "bg-blue-100 text-blue-600", titleKey: "landing.step1Title", descKey: "landing.step1Desc", number: "01" },
    { icon: BrainCircuit, color: "bg-purple-100 text-purple-600", titleKey: "landing.step2Title", descKey: "landing.step2Desc", number: "02" },
    { icon: BarChart3, color: "bg-emerald-100 text-emerald-600", titleKey: "landing.step3Title", descKey: "landing.step3Desc", number: "03" },
];

const techStack = [
    { name: "Next.js 16", desc: "React Framework" },
    { name: "React 19", desc: "UI Library" },
    { name: "Python FastAPI", desc: "AI Backend" },
    { name: "PostgreSQL", desc: "Database" },
    { name: "Prisma ORM", desc: "Data Layer" },
    { name: "scikit-learn", desc: "ML Model" },
    { name: "SHAP", desc: "Explainable AI" },
    { name: "Tailwind CSS", desc: "Styling" },
];

export default function LandingClient() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-200">

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <HeartPulse className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                            SmartCare
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                            Try Demo
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Decorative background blurs */}
                <div className="absolute top-0 right-0 -m-32 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -m-32 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="text-center relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center gap-2 mb-6"
                    >
                        <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                            Frostbyte Hackathon 2026
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                            Healthcare & BioTech
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                            Explainable AI
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
                    >
                        AI-Powered <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                            Patient Monitoring
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Empowering caregivers with <strong>SHAP-powered Explainable AI</strong> risk assessments
                        and enabling patients to easily track their daily health vitals with multi-language support.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-200/50">
                            <Activity className="w-5 h-5" />
                            Patient Demo
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:border-slate-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100">
                            <ShieldCheck className="w-5 h-5" />
                            Caregiver Demo
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12 border-t border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="text-center"
                        >
                            <stat.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500 mt-1">{stat.label.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-24 sm:py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why SmartCare?</h2>
                        <p className="mt-4 text-lg text-slate-500">Built to solve real-world healthcare monitoring workflows</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.0 }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <BrainCircuit className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">SHAP Explainable AI</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Not just predictions — our model uses <strong>SHAP (SHapley Additive exPlanations)</strong> to show exactly which health factors contribute to each risk assessment.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Caregiver Command Center</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Real-time analytics dashboard with risk distribution charts, critical alerts, and patient management tools all in one place.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Globe2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Bilingual (EN & TH)</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Fully localized interface for Thai and English users, including AI-generated medical explanations and all UI elements.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-slate-50 py-24 relative">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
                        <p className="mt-4 text-lg text-slate-500">Three simple steps to AI-powered health insights</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="relative"
                            >
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-shadow h-full">
                                    <span className="text-5xl font-black text-slate-100 absolute top-4 right-6">{step.number}</span>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${step.color}`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.titleKey.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                    <p className="text-slate-600 leading-relaxed">{step.descKey.split('.').pop()}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="w-8 h-8 text-slate-300" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tech Stack Section */}
            <div className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Powered By</h2>
                        <p className="mt-4 text-lg text-slate-500">Modern, proven technologies for reliability and performance</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center hover:shadow-md hover:border-blue-200 transition-all"
                            >
                                <p className="font-bold text-slate-900">{tech.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Sparkles className="w-10 h-10 text-blue-200 mx-auto mb-4" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Start Monitoring Today</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Experience the future of remote patient monitoring powered by SHAP Explainable AI.
                        </p>
                        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                            Go to Login
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 py-8 text-center">
                <p className="text-slate-400 text-sm">
                    Built with ❤️ for <span className="text-blue-400 font-semibold">Frostbyte Hackathon 2026</span> •
                    Healthcare & BioTech Theme •
                    By Tanakorn Kaewmai
                </p>
            </div>
        </div>
    );
}
