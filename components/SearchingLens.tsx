'use client';

import { motion } from 'framer-motion';

export default function SearchingLens({ className = "mb-6" }: { className?: string }) {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Orbital Rings/Ripple Effect */}
                <motion.div
                    className="absolute inset-0 border-2 border-primary/20 rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />

                {/* The Magnifying Glass Container - Floats around */}
                <motion.div
                    className="relative z-10"
                    animate={{
                        x: [-15, 15, -5, 10, -15],
                        y: [-10, 5, 15, -5, -10],
                        rotate: [0, 10, -5, 5, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1]
                    }}
                >
                    {/* Glass Circle */}
                    <div className="w-16 h-16 rounded-full border-4 border-slate-900 dark:border-white/90 bg-slate-400/50 dark:bg-white/10 backdrop-blur-sm overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {/* Gradient Reflection */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent dark:from-white/20 rounded-t-full" />

                        {/* Scanning Line Animation Inside */}
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_8px_var(--primary)]"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Grid Pattern Inside (to look like scanning data) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30" />
                    </div>

                    {/* Handle */}
                    <div className="absolute top-[85%] left-[85%] w-4 h-12 bg-gradient-to-b from-slate-800 to-slate-950 dark:from-slate-300 dark:to-slate-500 -z-10 rounded-full -rotate-45 origin-top-left border border-black/20 dark:border-white/20 shadow-lg" />
                </motion.div>

                {/* Glow behind the lens */}
                <motion.div
                    className="absolute w-16 h-16 bg-primary/40 rounded-full blur-xl"
                    animate={{
                        x: [-15, 15, -5, 10, -15],
                        y: [-10, 5, 15, -5, -10]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1]
                    }}
                />
            </div>
        </div>
    );
}
