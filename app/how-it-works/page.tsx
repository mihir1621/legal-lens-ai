'use client';

import { motion } from 'framer-motion';
import { 
    MessageSquare, 
    Cpu, 
    FileCheck, 
    Zap, 
    ArrowRight, 
    ShieldCheck, 
    Search, 
    Sparkles,
    ShieldAlert,
    Database,
    Scale
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const STEPS = [
    {
        icon: MessageSquare,
        title: "01. Intake Intelligence",
        subtitle: "The Power of Plain English",
        desc: "You don't need a law degree to start. Simply describe your situation, copy-paste a confusing clause, or upload a document. Our system immediately begins stripping away unnecessary noise, identifying the 'Core Intent' of your input using specialized NLP (Natural Language Processing).",
        highlight: "We process both structured contracts and unstructured conversations with equal precision.",
        color: "from-blue-500 to-indigo-600"
    },
    {
        icon: Cpu,
        title: "02. Neural Logic Scan",
        subtitle: "Cross-Reference & Contextualize",
        desc: "Our engine doesn't just read words—it understands hierarchies. It cross-references your text against a semantic database of thousands of precedents, statutory laws, and industry standards. It looks for hidden traps, unusual cancellation rules, and missing protective clauses that companies hope you won't notice.",
        highlight: "Simulates the scrutiny of a senior legal paralegal in milliseconds.",
        color: "from-primary to-orange-600"
    },
    {
        icon: FileCheck,
        title: "03. Structured Roadmap",
        subtitle: "From Jargon to Action",
        desc: "The final output isn't a long report—it's a tactical dashboard. We categorize results into Risks (Red Flags), Duties (What you must do), and Benefits (Your rights). You get an AI-generated summary that even a 10-year-old could understand, followed by a prioritized list of recommended 'Next Steps'.",
        highlight: "Translate 50 pages of dense legal text into a 3-minute actionable summary.",
        color: "from-emerald-500 to-teal-600"
    }
];

export default function HowItWorksPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Added a secondary background pattern */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_70%)] -z-10 pointer-events-none" />
            
            <main className="flex-1 py-32">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <motion.div 
                        className="text-center max-w-3xl mx-auto mb-32 space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]">
                            <Sparkles className="h-4 w-4" />
                            The Inner Workings
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            Transparency <br />by <span className="text-primary italic font-serif">Design</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                            Most AI tools are 'black boxes'. At LegalLens, we believe you deserve to understand exactly how your legal intelligence is generated.
                        </p>
                    </motion.div>

                    {/* Steps Cascade */}
                    <div className="space-y-40">
                        {STEPS.map((step, i) => (
                            <motion.div 
                                key={i}
                                className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32`}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                {/* Visual Side */}
                                <div className="flex-1 relative group w-full max-w-xl">
                                    <div className={`absolute -inset-4 bg-gradient-to-r ${step.color} rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                                    <div className="relative p-12 rounded-[3.5rem] bg-card border border-border/40 overflow-hidden shadow-2xl h-[400px] flex items-center justify-center">
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
                                        <motion.div 
                                            className={`h-40 w-40 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-2xl relative z-10`}
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        >
                                            <step.icon className="h-16 w-16" />
                                        </motion.div>
                                        
                                        {/* Abstract UI Elements */}
                                        <div className="absolute top-10 left-10 p-4 rounded-2xl bg-muted/30 border border-white/5 backdrop-blur-md opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="h-1 w-12 bg-primary/40 rounded-full mb-2" />
                                            <div className="h-1 w-20 bg-primary/20 rounded-full" />
                                        </div>
                                        <div className="absolute bottom-10 right-10 p-4 rounded-2xl bg-muted/30 border border-white/5 backdrop-blur-md opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="h-1 w-16 bg-primary/30 rounded-full mb-2" />
                                            <div className="h-1 w-8 bg-primary/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Text Side */}
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-primary uppercase tracking-[0.3em] font-mono">{step.title}</h3>
                                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">{step.subtitle}</h2>
                                    </div>
                                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                                        <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
                                        <p className="text-sm font-bold text-foreground leading-relaxed">
                                            {step.highlight}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <motion.div 
                        className="mt-60 p-12 md:p-32 rounded-[4rem] bg-foreground text-background text-center space-y-12 relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.15),transparent_60%)]" />
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none relative z-10">
                            Ready to Decode <br />Your <span className="text-primary italic font-serif">Future?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                            <Link href="/upload">
                                <button className="h-20 px-12 rounded-full bg-primary text-white text-xl font-black shadow-2xl shadow-primary/40 transition-transform hover:scale-105 active:scale-95 flex items-center gap-3 justify-center w-full sm:w-auto">
                                    Start Analysis Now <ArrowRight className="h-6 w-6" />
                                </button>
                            </Link>
                            {user ? (
                                <button 
                                    className="h-20 px-12 rounded-full border-2 border-primary/20 bg-primary/5 text-primary/40 text-sm font-black cursor-not-allowed w-full sm:w-auto flex flex-col items-center justify-center opacity-60"
                                    disabled
                                >
                                    <span>ACCOUNT ACTIVE</span>
                                    <span className="text-[10px] font-mono tracking-tighter opacity-70">LOCKED AS {user.email?.split('@')[0]}</span>
                                </button>
                            ) : (
                                <Link href="/signup">
                                    <button className="h-20 px-12 rounded-full border-2 border-white/20 bg-white/5 text-white text-xl font-black backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/40 w-full sm:w-auto shadow-xl">
                                        Create Account
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
