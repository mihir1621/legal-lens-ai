'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, GitCompare, ShieldAlert, Zap, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CompareTeaserPage() {
    const features = [
        {
            icon: <GitCompare className="w-6 h-6 text-primary" />,
            title: "Side-by-Side Analysis",
            description: "Upload two or more contracts to instantly see differences in plain English, mapped across both documents."
        },
        {
            icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
            title: "Conflict Detection",
            description: "Our AI automatically flags contradictory clauses, missing terms, and inconsistent deadlines between agreements."
        },
        {
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            title: "Version Intelligence",
            description: "Compare V1 to V2 of your negotiations and identify exactly what changed without manual proofreading."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col items-center pt-4 px-6 relative overflow-hidden">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none animate-pulse-subtle" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

            <main className="relative z-10 max-w-4xl w-full text-center space-y-12">
                
                {/* Header Section */}
                <div className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                    >
                        <Zap className="w-3 h-3 animate-pulse" />
                        Next Horizon
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight"
                    >
                        Compare <br /><span className="text-primary italic font-serif">Engine</span>
                    </motion.h1>
                </div>

                {/* Versions Selector - Untouchable / Coming Soon */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-md mx-auto p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6 relative group overflow-hidden transition-all duration-500 hover:border-primary/30 shadow-2xl hover:shadow-primary/5"
                >
                    {/* Full-Card Locked Overlay - SLIDE-IN ANIMATION */}
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-[8px] z-20 flex flex-col items-center justify-center cursor-not-allowed border border-primary/40 rounded-3xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            className="text-center space-y-3"
                        >
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-2 border border-white/10 ring-4 ring-primary/20">
                                <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xl font-black uppercase tracking-[0.4em] block drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
                                Feature Locked
                            </span>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto" />
                            <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.15em] block">
                                Multi-Version Engine Coming Soon
                            </span>
                        </motion.div>
                    </motion.div>

                    <div className="flex justify-between items-center px-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Documents to Compare</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/60">
                            <CheckCircle2 className="w-3 h-3" />
                            Multi-Sync Enabled
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[2, 3, 4].map((num) => (
                            <div 
                                key={num} 
                                className={`relative aspect-video rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                    num === 2 
                                    ? 'border-primary/40 bg-primary/5 opacity-80' 
                                    : 'border-white/10 bg-white/5 opacity-40 grayscale'
                                }`}
                            >
                                <span className={`text-2xl font-black ${num === 2 ? 'text-primary' : 'text-white'}`}>{num}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-tighter ${num === 2 ? 'text-primary/70' : 'text-gray-400'}`}>Versions</span>
                                
                                {num === 2 && (
                                    <div className="absolute -top-1 px-1.5 py-0.5 bg-primary text-white text-[6px] font-black uppercase tracking-tighter rounded-full shadow-sm">
                                        Default
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[10px] text-gray-600 font-medium italic">
                        * Our engine will support parallel analysis of up to 4 legal versions simultaneously.
                    </p>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
                >
                    We are building the world's most intuitive way to bridge the gap between multiple legal versions.
                </motion.p>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-left space-y-4 group hover:border-primary/30 transition-all duration-500"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-16"
                >
                    <Link href="/">
                        <button className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-bold shadow-2xl">
                            <ChevronLeft className="w-4 h-4" />
                            Return to Dashboard
                        </button>
                    </Link>
                    <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 cursor-wait opacity-60">
                        Stay Notified
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Subtle Interactive Element */}
                <motion.div 
                    className="pt-20 opacity-20 pointer-events-none"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <div className="flex justify-center items-center gap-8">
                        <FileText className="w-8 h-8" />
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent" />
                        <GitCompare className="w-10 h-10 text-primary" />
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent" />
                        <FileText className="w-8 h-8" />
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
