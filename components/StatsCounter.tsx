'use client';

import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { FileText, ShieldAlert, Zap, BookOpen } from "lucide-react";

interface StatItemProps {
    value: number;
    suffix?: string;
    label: string;
    icon: any;
    description: string;
    delay: number;
}

function StatItem({ value, suffixContent, label, icon: Icon, description, delay }: any) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    const displayValue = useTransform(springValue, (latest) =>
        Math.floor(latest).toLocaleString()
    );

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(value);
            }, delay * 1000);
        }
    }, [isInView, motionValue, value, delay]);

    const handleHover = () => {
        motionValue.set(0);
        setTimeout(() => {
            motionValue.set(value);
        }, 20);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={handleHover}
            transition={{ duration: 0.6, delay: delay * 0.2 }}
            className="relative group p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.05] cursor-default transition-all duration-500 overflow-hidden"
        >
            {/* Decorative Gradient Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Icon className="h-7 w-7" />
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                    <motion.span className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                        {displayValue}
                    </motion.span>
                    <span className="text-3xl md:text-4xl font-black text-primary">{suffixContent}</span>
                </div>

                <h3 className="text-lg font-bold text-foreground/90 mb-3">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                    {description}
                </p>
            </div>

            {/* Hover line animation */}
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-700 ease-in-out" />
        </motion.div>
    );
}

export default function StatsCounter() {
    const stats = [
        {
            value: 500,
            suffixContent: "+",
            label: "Legal Documents",
            description: "Successfully simplified with 99.8% semantic accuracy.",
            icon: FileText,
            delay: 0.1
        },
        {
            value: 5000,
            suffixContent: "+",
            label: "Clauses Analyzed",
            description: "Deep-learning breakdown of complex legal obligations.",
            icon: BookOpen,
            delay: 0.3
        },
        {
            value: 2500,
            suffixContent: "+",
            label: "Risks Identified",
            description: "Protecting users from hidden penalties and traps.",
            icon: ShieldAlert,
            delay: 0.5
        },
        {
            value: 10,
            suffixContent: "s",
            label: "Avg. Speed",
            description: "Powered by Groq for near-instant legal intelligence.",
            icon: Zap,
            delay: 0.7
        }
    ];

    return (
        <section className="w-full py-24 relative overflow-hidden">
            {/* Abstract design elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[500px] w-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-primary/10 blur-[100px] rounded-full -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-widest uppercase mb-4"
                    >
                        Platform Performance
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black tracking-tight mb-6"
                    >
                        Trust in Every <span className="text-primary italic">Word</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Our AI engine doesn't just read documents; it understands the weight of every sentence to give you the most accurate summarizations.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <StatItem key={index} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    );
}