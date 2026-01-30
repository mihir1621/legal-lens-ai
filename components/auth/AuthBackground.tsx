'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 z-0 opacity-40"
                animate={{
                    background: [
                        "radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 50%)",
                        "radial-gradient(circle at 100% 0%, #0ea5e9 0%, transparent 50%)",
                        "radial-gradient(circle at 100% 100%, #6366f1 0%, transparent 50%)",
                        "radial-gradient(circle at 0% 100%, #8b5cf6 0%, transparent 50%)",
                        "radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Floating Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <FloatingElements />
            </div>

            {/* Content Wrapper with Glass Effect */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-4"
            >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="relative p-8 md:p-10">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
