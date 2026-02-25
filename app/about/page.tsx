'use client';

import { Scale, ShieldCheck, Zap, Globe, Cpu, FileText, CheckCircle2, Search } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center">
            {/* --- Hero Section --- */}
            <section className="relative w-full overflow-hidden px-4 pt-20 pb-24 text-center md:pt-32 border-b border-border/40">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

                <div className="container mx-auto max-w-4xl space-y-6">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                        Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        Democratizing Legal <span className="text-primary italic">Intelligence</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                        LegalLens AI was built to bridge the gap between complex legal jargon and everyday understanding. We believe everyone deserves to know exactly what they are signing.
                    </p>
                </div>
            </section>

            {/* --- What We Do Section --- */}
            <section className="container mx-auto px-4 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">What is LegalLens?</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                LegalLens is an advanced AI-powered legal assistant designed to simplify complex documents in seconds. Whether it's a rental agreement, a corporate contract, or a website's privacy policy, our platform breaks down the "fine print" into clear, actionable insights.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: CheckCircle2, title: "Plain English Summaries", desc: "No more confusing legalese. Get the gist in seconds." },
                                { icon: CheckCircle2, title: "Risk Identification", desc: "We highlight unfair clauses and hidden penalties automatically." },
                                { icon: CheckCircle2, title: "Step-by-Step Guidance", desc: "AI tells you exactly how to obtain required documents." },
                                { icon: CheckCircle2, title: "Multilingual Support", desc: "Translate legal insights into 9+ regional Indian languages." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-card/50">
                                    <item.icon className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30" />
                        <div className="relative rounded-3xl border border-border bg-card p-2 shadow-2xl overflow-hidden">
                            <div className="bg-muted/30 rounded-2xl p-8 aspect-square flex flex-col items-center justify-center text-center">
                                <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                                    <Scale className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Legal AI v12.2</h3>
                                <p className="text-sm text-muted-foreground mb-6">Our most powerful analysis engine yet.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Gemini 2.0', 'Multi-Model Fallback', 'Vision OCR', 'Sentiment Analysis'].map((tech) => (
                                        <span key={tech} className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Technology Stack --- */}
            <section className="w-full bg-muted/30 py-24 border-y border-border/40">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Behind the Intelligence</h2>
                        <p className="text-muted-foreground">We use a world-class technology stack to ensure 100% uptime and accuracy.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-background border border-border shadow-sm">
                            <Cpu className="h-10 w-10 text-primary mb-6" />
                            <h3 className="text-xl font-bold mb-3">Hybrid AI Architecture</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our proprietary "Strategy Chain" utilizes Gemini 2.0 Flash as a core, with an automatic fallback to 7 different high-performance models (Gemma, Qwen, StepFun) via OpenRouter to guarantee analysis even during peak loads.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border shadow-sm">
                            <Zap className="h-10 w-10 text-primary mb-6" />
                            <h3 className="text-xl font-bold mb-3">Deep Vision OCR</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Don't have a digital PDF? No problem. Our system uses advanced OCR and vision models to "see" and understand photos of physical documents, scans, and even low-quality images.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-background border border-border shadow-sm">
                            <Globe className="h-10 w-10 text-primary mb-6" />
                            <h3 className="text-xl font-bold mb-3">Localized for Bharat</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Legal terms hit harder in your native tongue. We've built a multi-stage translation service that provides summaries in Hindi, Marathi, Gujarati, Tamil, Telugu, and more with linguistic nuance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Why LegalLens? --- */}
            <section className="container mx-auto px-4 py-24 max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-12">The LegalLens Edge</h2>
                <div className="grid gap-12 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-xl">Protect Your Rights</h4>
                        <p className="text-muted-foreground">We help you find "hidden" clauses that might trap you into unfair financial or legal liabilities.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-xl">Transparency First</h4>
                        <p className="text-muted-foreground">We provide "Documents Required" notes to help you navigate bureaucratic hurdles with ease.</p>
                    </div>
                </div>

                <div className="mt-20 p-12 rounded-3xl bg-foreground text-background relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity" />
                    <h3 className="text-3xl font-bold mb-6 relative z-10">Ready to simplify your first document?</h3>
                    <Link href="/upload">
                        <button
                            className="rounded-full px-10 py-4 text-base font-bold transition-all hover:scale-105 active:scale-95 relative z-10"
                            style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 8px 25px rgba(249,115,22,0.4)' }}
                        >
                            Start Analyzing Now
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
