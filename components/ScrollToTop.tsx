'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (!entry.isIntersecting && window.scrollY === 0) {
                    setIsScrolling(false);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(footer);
        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
        setIsScrolling(true);
        const duration = 2500; // 2.5 seconds for a majestic, deliberate feel
        const start = window.pageYOffset;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Ease out cubic function for smoother finish
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, start * (1 - easeOutCubic));

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                setTimeout(() => setIsScrolling(false), 200); // Quick fade out delay
            }
        };

        requestAnimationFrame(animateScroll);
    };

    return (
        <>
            {/* Subtle blur overlay during active scroll to top */}
            <AnimatePresence>
                {isScrolling && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="fixed inset-0 z-[9998] pointer-events-none backdrop-blur-[6px] bg-white/5"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        whileHover={{ 
                            scale: 1.1,
                            boxShadow: '0 0 25px rgba(249, 115, 22, 0.6)',
                        }}
                        whileTap={{ 
                            scale: 0.8,
                            borderRadius: '100%',
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-[9999] p-4 rounded-full border-2 border-orange-500/80 text-orange-500 bg-background/80 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300 group"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-6 w-6 stroke-[2px] transition-transform duration-300 group-hover:-translate-y-1" />
                        
                        {/* Subtle orange glow animation */}
                        <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulse opacity-20 pointer-events-none" />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
}
