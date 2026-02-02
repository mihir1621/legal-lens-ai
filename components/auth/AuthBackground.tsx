'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SearchingLens from '@/components/SearchingLens';

function FloatingElements() {
    const [mounted, setMounted] = useState(false);
    const [elements, setElements] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        setElements([...Array(6)].map(() => ({
            initialX: Math.random() * 1000 - 500,
            initialY: Math.random() * 1000 - 500,
            targetX: Math.random() * 1000 - 500,
            targetY: Math.random() * 1000 - 500,
            duration: 20 + Math.random() * 10,
            width: Math.random() * 400 + 200,
            height: Math.random() * 400 + 200,
        })));
    }, []);

    if (!mounted) return null;

    return (
        <>
            {elements.map((el, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-primary/10 blur-3xl"
                    initial={{
                        x: el.initialX,
                        y: el.initialY,
                        scale: 0.5,
                        opacity: 0.3
                    }}
                    animate={{
                        x: [null, el.targetX],
                        y: [null, el.targetY],
                        scale: [0.5, 1.5, 0.5],
                        rotate: [0, 180, 360],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: el.width,
                        height: el.height,
                    }}
                />
            ))}
        </>
    );
}

export default function AuthBackground({ children }: { children: React.ReactNode }) {

    function BackgroundKeywords() {
        const words = [
            { text: "Legal Analysis", top: "12%", left: "5%" },
            { text: "AI Protection", top: "8%", right: "12%" },
            { text: "Rent Agreement", top: "25%", left: "15%" }, // New
            { text: "Sale Deed", top: "30%", right: "8%" },      // New
            { text: "Contract Review", bottom: "12%", left: "8%" },
            { text: "Risk Detection", bottom: "18%", right: "5%" },
            { text: "NDA Check", bottom: "25%", left: "20%" }, // New
            { text: "Privacy Policy", bottom: "8%", right: "25%" }, // New
            { text: "Smart Insights", top: "45%", right: "2%" },
            { text: "Instant Summary", top: "50%", left: "2%" },
            { text: "Affidavit", top: "5%", left: "40%" },       // New
            { text: "Lease Deed", bottom: "5%", left: "45%" },   // New
        ];

        return (
            <>
                {words.map((word, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-gray-700 dark:text-gray-500 font-bold text-3xl md:text-5xl whitespace-nowrap select-none pointer-events-none z-0"
                        style={{ top: word.top, left: word.left, right: word.right, bottom: word.bottom }}
                        initial={{ opacity: 0 }}
                        animate={{ y: [0, -15, 0], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    >
                        {word.text}
                    </motion.div>
                ))}
            </>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background transition-colors duration-300">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 z-0 opacity-40"
                animate={{
                    background: [
                        "radial-gradient(circle at 0% 0%, #8b5cf6 0%, transparent 50%)", // Violet 500
                        "radial-gradient(circle at 100% 0%, #d946ef 0%, transparent 50%)", // Fuchsia 500
                        "radial-gradient(circle at 100% 100%, #06b6d4 0%, transparent 50%)", // Cyan 500
                        "radial-gradient(circle at 0% 100%, #a855f7 0%, transparent 50%)", // Purple 500
                        "radial-gradient(circle at 0% 0%, #8b5cf6 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Floating Elements & Keywords */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <BackgroundKeywords />
                <FloatingElements />

                {/* Searching Animations in Background */}
                {/* Searching Animations in Background - roaming edge to edge */}
                <motion.div
                    className="absolute z-0 opacity-80 dark:opacity-20 pointer-events-none"
                    animate={{
                        top: ["10%", "80%", "20%", "85%", "15%", "90%", "10%"],
                        left: ["10%", "15%", "85%", "20%", "80%", "50%", "10%"]
                    }}
                    transition={{
                        duration: 45,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]
                    }}
                >
                    <div className="scale-[5] transform-gpu">
                        <SearchingLens className="m-0" />
                    </div>
                </motion.div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 w-full flex justify-center items-center p-4">
                {children}
            </div>
        </div>
    );
}
