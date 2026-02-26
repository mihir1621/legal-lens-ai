'use client';

import { Scale, Plus, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ComparePage() {
    return (
        <motion.div
            className="container mx-auto px-4 py-16 text-center max-w-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <motion.div
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-6"
                    whileHover={{ scale: 1.05 }}
                >
                    Multi-Document Comparison
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
                    Compare Contracts <span className="text-primary">Side-by-Side</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Instantly identify differences in clauses, risk profiles, and financial terms between two legal documents.
                </p>

                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background font-bold text-sm shadow-xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                    BETA FEATURE RELEASING SOON
                </motion.div>
            </motion.div>

            <motion.div
                className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative px-4"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background border-4 border-border items-center justify-center font-bold text-primary shadow-lg hover:scale-110 transition-transform cursor-help">
                    VS
                </div>

                {/* Left Card */}
                <motion.div
                    className="relative group border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] bg-card cursor-pointer overflow-hidden shadow-sm backdrop-blur-sm"
                    whileHover={{ y: -8, borderColor: "var(--primary)", scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                        <FileText className="h-8 w-8" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Original Contract</h3>
                    <p className="text-sm text-muted-foreground mb-8">Base version for comparison</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-4 w-4" /> Select File
                    </button>
                </motion.div>

                {/* Right Card */}
                <motion.div
                    className="relative group border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] bg-card cursor-pointer overflow-hidden shadow-sm backdrop-blur-sm"
                    whileHover={{ y: -8, borderColor: "var(--primary)", scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                        <FileText className="h-8 w-8" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">New Revision</h3>
                    <p className="text-sm text-muted-foreground mb-8">Modified or target version</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-4 w-4" /> Select File
                    </button>
                </motion.div>
            </motion.div>

            <motion.div
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                {[
                    { icon: ShieldCheck, title: "Difference Detection", desc: "AI highlights which clauses were added, removed, or modified." },
                    { icon: Scale, title: "Risk Variance", desc: "See how the risk profile changed between different versions." },
                    { icon: ArrowRight, title: "Summary of Changes", desc: "Get a clear table of every term change and its legal impact." }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300"
                        whileHover={{ y: -5, backgroundColor: "var(--card)" }}
                    >
                        <item.icon className="h-8 w-8 text-primary mb-4 transition-transform group-hover:scale-110" />
                        <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="mt-12 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <Link href="/upload">
                    <motion.button
                        className="rounded-full px-10 py-3.5 text-base font-bold transition-all"
                        style={{ background: '#f97316', color: '#ffffff' }}
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(249,115,22,0.45)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Analyze Single Document Instead
                    </motion.button>
                </Link>
            </motion.div>
        </motion.div>
    );
}
