'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Scale, 
    Zap, 
    Lock, 
    ChevronLeft, 
    ShieldCheck, 
    Sparkles, 
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

/**
 * PREMIUM "COMING SOON" PLACEHOLDER
 * High-fidelity design to maintain Legallens aesthetic.
 */

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-blue-500/30 overflow-hidden relative">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <main className="container mx-auto px-6 pt-24 pb-32 max-w-4xl flex flex-col items-center justify-center relative z-10">
                
                {/* 1. Icon Stack */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mb-10"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-2xl shadow-blue-500/10">
                        <div className="w-full h-full rounded-3xl bg-[#0a0a0a] flex items-center justify-center">
                            <Scale className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.5, 1]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-1 -right-1 p-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"
                    >
                        <Lock className="w-3 h-3 text-white" />
                    </motion.div>
                </motion.div>

                {/* 2. Headline Area */}
                <div className="text-center space-y-6 max-w-2xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.25em] uppercase"
                    >
                        <Sparkles className="w-3 h-3" />
                        Coming Soon
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]"
                    >
                        Case <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">Comparison</span> <br /> 
                        is on its way.
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500 text-base md:text-lg font-medium max-w-lg mx-auto leading-relaxed"
                    >
                        We're currently scaling our AI tokens to handle complex legal side-by-side logic. This feature will be unlocked in the next deployment.
                    </motion.p>
                </div>

                {/* 3. Action Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 flex flex-col sm:flex-row items-center gap-4"
                >
                    <Link href="/">
                        <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm">
                            <ChevronLeft className="w-4 h-4" />
                            Return Home
                        </button>
                    </Link>
                    <Link href="/how-it-works">
                        <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95 group text-sm">
                            View Roadmap
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </motion.div>

                {/* 4. Feature Teaser Cards */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full"
                >
                    {[
                        { icon: ShieldCheck, title: "Risk Check", desc: "Identify conflicting clauses automatically." },
                        { icon: Zap, title: "Rapid Compare", desc: "Compare 100+ pages of legal text in seconds." },
                        { icon: Sparkles, title: "AI Verdict", desc: "Get strategic outcome predictions per scenario." }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:border-blue-500/20 transition-all text-center">
                            <item.icon className="w-6 h-6 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-bold mb-2 tracking-tight text-sm">{item.title}</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* 5. Progress Indicator */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "200px" }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                    className="absolute bottom-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-30"
                />
            </main>

            {/* Subtle Gradient Glow at Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/[0.02] blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
}
