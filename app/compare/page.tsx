'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * ULTRA-MINIMALIST "COMING SOON" 
 * Pure, clean placeholder as requested.
 */

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col items-center justify-center p-6 text-center">
            
            {/* Subtle Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/[0.03] blur-[100px] rounded-full pointer-events-none" />

            <main className="relative z-10 space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black text-white tracking-tighter"
                >
                    Coming Soon
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 text-lg md:text-xl font-medium tracking-wide uppercase"
                >
                    We are working on it.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-10"
                >
                    <Link href="/">
                        <button className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all text-sm font-medium">
                            <ChevronLeft className="w-4 h-4" />
                            Return Home
                        </button>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
