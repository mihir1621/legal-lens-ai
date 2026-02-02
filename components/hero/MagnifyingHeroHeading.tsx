'use client';

import { motion, LayoutGroup } from 'framer-motion';
import { useState, useEffect } from 'react';

const TOP_LINE_TEXT = "Understand Legal Documents";
const WORDS = TOP_LINE_TEXT.split(" ");

export default function MagnifyingHeroHeading() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        // Cycle through words one by one
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % WORDS.length);
        }, 1200); // 1.2s per word (allows for movement + reading pause)

        return () => clearInterval(interval);
    }, []);

    return (
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl relative z-20">
            {/* Top Line with Magnifying Effect */}
            <span className="inline-block relative py-2"> {/* Added vertical padding for lens space */}
                <LayoutGroup>
                    {WORDS.map((word, i) => (
                        <Word
                            key={i}
                            word={word}
                            isActive={i === activeIndex}
                        />
                    ))}
                </LayoutGroup>
            </span>

            <br className="hidden sm:block" />

            {/* Bottom Line - Gradient Text (Static/Preserved) */}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                In Seconds, Not Hours
            </span>
        </h1>
    );
}

const SPRING_TRANSITION = {
    type: "spring",
    stiffness: 160,
    damping: 24,
    mass: 1.4,
    restDelta: 0.001
} as const;

function Word({ word, isActive }: { word: string, isActive: boolean }) {
    return (
        <span className="relative inline-block mx-1.5 sm:mx-2.5 z-10">
            {/* The Text Itself */}
            <motion.span
                layout
                className="inline-block relative z-20" // Z-20 (Below Lens)
                initial={{
                    filter: 'blur(10px)',
                    opacity: 0
                }}
                animate={{
                    scale: isActive ? 1.5 : 1,
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    textShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    y: isActive ? -4 : 0,
                    filter: isActive ? 'blur(0px)' : 'blur(10px)',
                    opacity: isActive ? 1 : 0,
                }}
                transition={SPRING_TRANSITION as any}
            >
                {word}
            </motion.span>

            {/* The Magnifying Lens (Moves via layoutId) */}
            {isActive && (
                <motion.div
                    layoutId="magnifying-lens"
                    className="absolute z-30 pointer-events-none flex items-center justify-center" // Center the glass relative to word
                    style={{
                        top: '-35%',
                        bottom: '-35%',
                        left: '-25%',
                        right: '-25%',
                    }}
                    transition={SPRING_TRANSITION as any}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Glass Body */}
                        <div className="w-full h-full rounded-full border-2 border-slate-900 dark:border-white/20 bg-slate-400/60 dark:bg-white/5 backdrop-blur-[1px] shadow-xl shadow-black/25 dark:shadow-white/5 relative z-10">
                            {/* Shine / Reflection */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                            <div className="absolute top-1 left-1/4 w-1/2 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-[100%] blur-[1px]" />
                        </div>

                        {/* Tiny Realistic Handle */}
                        <div className="absolute top-[88%] left-[88%] w-[15%] h-[40%] bg-gradient-to-br from-slate-800 to-slate-950 dark:from-slate-300 dark:to-slate-600 rounded-full -rotate-45 origin-top-left border border-black/30 dark:border-white/20 shadow-lg" />
                    </div>
                </motion.div>
            )}
        </span>
    );
}
