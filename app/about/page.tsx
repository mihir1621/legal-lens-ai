'use client';

import { Scale, ShieldCheck, Zap, Globe, Cpu, FileText, CheckCircle2, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
};

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center overflow-x-hidden">
            {/* --- Hero Section --- */}
            <section className="relative w-full overflow-hidden px-4 pt-4 pb-24 text-center md:pt-6 border-b border-border/40">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

                <motion.div
                    className="container mx-auto max-w-4xl space-y-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
                >
                    <motion.div
                        className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-4"
                        whileHover={{ scale: 1.05 }}
                    >
                        Our Mission
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        Democratizing Legal <span className="text-primary italic inline-block">Intelligence</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                        LegalLens AI was built to bridge the gap between complex legal fine print and everyday understanding. We believe everyone deserves to know exactly what they are signing.
                    </p>
                </motion.div>
            </section>

            {/* --- What We Do Section --- */}
            <section className="container mx-auto px-4 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        className="space-y-8"
                        {...fadeInUp}
                    >
                        <div>
                            <h2 className="text-3xl font-bold mb-4">What is LegalLens?</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                LegalLens is an advanced AI-powered legal assistant designed to simplify complex documents in seconds. Whether it's a rental agreement, a corporate contract, or a website's privacy policy, our platform breaks down the "fine print" into clear, actionable insights.
                            </p>
                        </div>

                        <motion.div
                            className="space-y-4"
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="whileInView"
                            viewport={{ once: true }}
                        >
                            {[
                                { icon: CheckCircle2, title: "Plain English Summaries", desc: "No more confusing legalese. Get the gist in seconds." },
                                { icon: CheckCircle2, title: "Risk Identification", desc: "We highlight unfair clauses and hidden penalties automatically." },
                                { icon: CheckCircle2, title: "Step-by-Step Guidance", desc: "AI tells you exactly how to obtain required documents." },
                                { icon: CheckCircle2, title: "Multilingual Support", desc: "Translate legal insights into 9+ regional Indian languages." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="flex gap-4 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card hover:shadow-md transition-all group"
                                    variants={fadeInUp}
                                    whileHover={{ x: 5 }}
                                >
                                    <item.icon className="h-6 w-6 text-primary shrink-0 transition-transform group-hover:scale-110" />
                                    <div>
                                        <h4 className="font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30 animate-pulse" />
                        <motion.div
                            className="relative rounded-3xl border border-border bg-card p-2 shadow-2xl overflow-hidden"
                            whileHover={{ y: -10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="bg-muted/30 rounded-2xl p-8 aspect-square flex flex-col items-center justify-center text-center">
                                <motion.div
                                    className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                >
                                    <Scale className="h-10 w-10" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-2">Legal AI v12.7</h3>
                                <p className="text-sm text-muted-foreground mb-6">Our most powerful analysis engine yet.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Gemini 2.0', 'Multi-Model Fallback', 'Vision OCR', 'Sentiment Analysis'].map((tech) => (
                                        <motion.span
                                            key={tech}
                                            className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold uppercase tracking-wider"
                                            whileHover={{ scale: 1.1, backgroundColor: 'var(--primary)', color: '#fff' }}
                                        >
                                            {tech}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- Technology Stack --- */}
            <section className="w-full bg-muted/30 py-24 border-y border-border/40">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-3xl font-bold mb-4">Behind the Intelligence</h2>
                        <p className="text-muted-foreground">We use a world-class technology stack to ensure 100% uptime and accuracy.</p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Cpu, title: "Hybrid AI Architecture", desc: "Our proprietary \"Strategy Chain\" utilizes Gemini 2.0 Flash as a core, with an automatic fallback to 7 different high-performance models via OpenRouter." },
                            { icon: Zap, title: "Deep Vision OCR", desc: "Our system uses advanced OCR and vision models to \"see\" and understand photos of physical documents, scans, and even low-quality images." },
                            { icon: Globe, title: "Localized for Bharat", desc: "We've built a multi-stage translation service that provides legal insights in Hindi, Marathi, Gujarati, Tamil, Telugu, and more with linguistic nuance." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                                variants={fadeInUp}
                            >
                                <item.icon className="h-10 w-10 text-primary mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- Why LegalLens? --- */}
            <section className="container mx-auto px-4 py-24 max-w-4xl text-center">
                <motion.h2
                    className="text-3xl font-bold mb-12"
                    {...fadeInUp}
                >
                    The LegalLens Edge
                </motion.h2>
                <motion.div
                    className="grid gap-12 sm:grid-cols-2"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                >
                    <motion.div className="space-y-4" variants={fadeInUp}>
                        <motion.div
                            className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ShieldCheck className="h-6 w-6" />
                        </motion.div>
                        <h4 className="font-bold text-xl">Protect Your Rights</h4>
                        <p className="text-muted-foreground">We help you find "hidden" clauses that might trap you into unfair financial or legal liabilities.</p>
                    </motion.div>
                    <motion.div className="space-y-4" variants={fadeInUp}>
                        <motion.div
                            className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Search className="h-6 w-6" />
                        </motion.div>
                        <h4 className="font-bold text-xl">Transparency First</h4>
                        <p className="text-muted-foreground">We provide "Documents Required" notes to help you navigate bureaucratic hurdles with ease.</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="mt-20 p-12 rounded-3xl bg-foreground text-background relative overflow-hidden group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <h3 className="text-3xl font-bold mb-6 relative z-10">Ready to simplify your first document?</h3>
                    <Link href="/upload">
                        <motion.button
                            className="rounded-full px-10 py-4 text-base font-bold transition-all relative z-10"
                            style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 8px 25px rgba(249,115,22,0.4)' }}
                            whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(249,115,22,0.6)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Analyzing Now
                        </motion.button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
