'use client';

import Link from "next/link";
import { ArrowLeft, Scale, AlertTriangle, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
    {
        icon: FileCheck,
        title: "What We Do",
        content: "LegalLens uses AI to simplify legal documents. We give you plain-English summaries and flag risks. By using the app, you agree to these terms."
    },
    {
        icon: AlertTriangle,
        title: "Not Legal Advice",
        content: "Our AI analysis is for information only. It is not legal counsel. Always consult a lawyer for important decisions."
    },
    {
        icon: Scale,
        title: "Your Responsibility",
        content: "Only upload documents you have permission to share. Don't misuse the service. We may suspend accounts that break these rules."
    }
];

export default function TermsOfService() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto max-w-3xl px-4 py-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10 group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
                        <Scale className="h-3 w-3" /> Fair & Transparent
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: February 2026</p>
                </motion.div>

                <div className="space-y-5">
                    {sections.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <section.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{section.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
