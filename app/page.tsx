'use client';
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, FileText, Search, Clock, ChevronRight, ChevronDown, Lock, ShieldAlert, Cpu, FolderX, Database, EyeOff, Sparkles, Zap, MessageSquare, PencilLine, FileCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import MagnifyingHeroHeading from "@/components/hero/MagnifyingHeroHeading";
import StatsCounter from "@/components/StatsCounter";
import FeedbackSystem from "@/components/FeedbackSystem";

const DOCUMENT_LIST = [
    {
        title: "Rental Agreements",
        description: "Lease terms, deposits, and maintenance clauses.",
        image: "/documents/rental-agreement.png",
        details: ["Security deposit rules", "Maintenance responsibilities", "Early termination penalties", "Renewal & rent escalation"]
    },
    {
        title: "Employment Contracts",
        description: "Offer letters, notice periods, and benefits.",
        image: "/documents/employment-contract.png",
        details: ["Compensation & bonuses", "Non-compete clauses", "Notice period terms", "Termination conditions"]
    },
    {
        title: "Service Agreements",
        description: "Deliverables, payment terms, and timelines.",
        image: "/documents/service-agreement.png",
        details: ["Scope of services", "Payment milestones", "Liability limitations", "Warranty provisions"]
    },
    {
        title: "NDAs & Policies",
        description: "Confidentiality and data protection terms.",
        image: "/documents/nda.png",
        details: ["Confidential info scope", "Duration of obligation", "Permitted disclosures", "Breach consequences"]
    },
    {
        title: "Loan Agreements",
        description: "Interest rates, repayment schedules, and collateral.",
        image: "/documents/loan-agreement.png",
        details: ["Interest rate type", "Repayment schedule", "Collateral requirements", "Default & penalties"]
    },
    {
        title: "Partnership Deeds",
        description: "Profit sharing, roles, and dissolution terms.",
        image: "/documents/partnership.png",
        details: ["Capital contributions", "Profit/loss sharing", "Decision-making rights", "Exit & dissolution"]
    },
    {
        title: "IP Agreements",
        description: "Copyrights, trademarks, and ownership rights.",
        image: "/documents/ip-agreement.png",
        details: ["Ownership transfer", "License scope & limits", "Royalty terms", "Infringement remedies"]
    },
    {
        title: "Consulting Contracts",
        description: "Scope of work, hourly rates, and deliverables.",
        image: "/documents/consulting.png",
        details: ["Engagement scope", "Fee structure", "Intellectual property", "Confidentiality terms"]
    },
    {
        title: "Privacy Policies",
        description: "Data collection, user rights, and tracking terms.",
        image: "/documents/privacy-policy.png",
        details: ["Data collected types", "Third-party sharing", "User opt-out rights", "Retention periods"]
    },
    {
        title: "Operating Agreements",
        description: "Business ownership, roles, and voting rights.",
        image: "/documents/operating-agreement.png",
        details: ["Member responsibilities", "Voting procedures", "Profit distribution", "Amendment process"]
    },
    {
        title: "SaaS Agreements",
        description: "Service limits, data ownership, and SLAs.",
        image: "/documents/saas-service.png",
        details: ["Uptime guarantees", "Data portability", "Usage limitations", "Auto-renewal traps"]
    },
    {
        title: "Real Estate Sale",
        description: "Purchase terms, deadlines, and contingencies.",
        image: "/documents/real-estate.png",
        details: ["Purchase price terms", "Inspection deadlines", "Financing contingencies", "Closing conditions"]
    },
    {
        title: "Wills & Trusts",
        description: "Estate planning, beneficiaries, and authority.",
        image: "/documents/will-trust.png",
        details: ["Beneficiary details", "Asset distribution", "Executor powers", "Trust conditions"]
    },
    {
        title: "Non-Compete Agreements",
        description: "Restrictive covenants, duration, and scope.",
        image: "/documents/non-compete.png",
        details: ["Geographic restrictions", "Duration limits", "Industry scope", "Enforcement penalties"]
    },
    {
        title: "Power of Attorney",
        description: "Authority grants, limitations, and revocation.",
        image: "/documents/power-of-attorney.png",
        details: ["Powers granted", "Effective conditions", "Revocation process", "Agent limitations"]
    },
    {
        title: "Vendor Contracts",
        description: "Supply terms, pricing, and delivery schedules.",
        image: "/documents/vendor-contract.png",
        details: ["Pricing & discounts", "Delivery timelines", "Quality standards", "Dispute resolution"]
    }
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${open
        ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/5'
        : 'border-border bg-card hover:border-primary/20 hover:shadow-sm'
        }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${open ? 'bg-gradient-to-b from-primary via-primary/70 to-primary/30' : 'bg-transparent'
        }`} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 pl-6 text-left cursor-pointer group"
      >
        <span className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all duration-300 ${open
          ? 'bg-primary text-white scale-110'
          : 'bg-primary/10 text-primary group-hover:bg-primary/20'
          }`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`flex-1 font-semibold transition-colors duration-300 ${open ? 'text-primary' : 'text-foreground'
          }`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronDown className={`h-5 w-5 shrink-0 transition-colors duration-300 ${open ? 'text-primary' : 'text-muted-foreground'
            }`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pl-[4.5rem] pb-5 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
    const [showGreeting, setShowGreeting] = useState(false);
    const [userName, setUserName] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const hasShown = sessionStorage.getItem("welcome_shown");
                if (!hasShown) {
                    setUserName(user.displayName || user.email?.split('@')[0] || "User");
                    setShowGreeting(true);
                    sessionStorage.setItem("welcome_shown", "true");
                    const timer = setTimeout(() => setShowGreeting(false), 3500);
                    return () => clearTimeout(timer);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary bg-grain relative overflow-x-hidden group">
            {/* Dynamic Cursor Spotlight Effect */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 pointer-events-none mix-blend-screen hidden dark:block"
                animate={{
                    background: `radial-gradient(800px at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.08), transparent 80%)`,
                }}
            />

            {/* --- Welcome Overlay --- */}
            <AnimatePresence>
                {showGreeting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
                    >
                        <div className="absolute inset-0 flex flex-col items-center pt-32 px-4 space-y-8 opacity-10 pointer-events-none">
                            <div className="h-8 w-64 bg-primary/20 rounded-full animate-pulse" />
                            <div className="h-16 w-3/4 max-w-2xl bg-foreground/10 rounded-xl animate-pulse" />
                            <div className="h-12 w-1/2 max-w-xl bg-foreground/10 rounded-xl animate-pulse" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="text-center z-10"
                        >
                            <h1 className="text-5xl font-black tracking-tight mb-2">Welcome back,</h1>
                            <span className="text-6xl text-primary font-black block">{userName}</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Background Mesh + Noise */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <main className="flex-1 relative">
                {/* HERO SECTION */}
                <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
                    <div className="container mx-auto text-center z-10 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.div
                                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary tracking-widest uppercase mb-8 shadow-sm shadow-primary/10"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(249, 115, 22, 0.15)" }}
                            >
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Interactive Legal Intelligence
                            </motion.div>

                            <MagnifyingHeroHeading />

                            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed">
                                Don't let complex legal jargon hold you back. LegalLens AI transforms dense contracts into <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4 pointer-events-auto hover:text-primary transition-colors cursor-help">clear, actionable intelligence</span> in seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 px-4">
                                <Link href="/upload" className="w-full sm:w-auto">
                                    <motion.div 
                                        className="relative group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-orange-400 to-primary rounded-full blur-lg opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                        <button className="relative flex h-16 w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-primary to-orange-500 px-10 text-base font-black text-white transition-all shadow-2xl shadow-primary/40 border border-white/20">
                                            Analyze Your Case Now
                                            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                                        </button>
                                    </motion.div>
                                </Link>
                                <Link href="/how-it-works" className="w-full sm:w-auto">
                                    <motion.button 
                                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-16 w-full sm:w-auto inline-flex items-center justify-center rounded-full border-2 border-primary/30 bg-background/50 px-10 text-base font-black text-foreground backdrop-blur-xl transition-all hover:border-primary/60 group/demo shadow-xl"
                                    >
                                        <Sparkles className="mr-3 h-5 w-5 text-primary animate-pulse" />
                                        Try AI Legal Assistant
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Counter Section */}
                <StatsCounter />

                {/* Features Section - Bento SaaS Style */}
                <motion.section
                    className="max-w-[1400px] mx-auto px-4 py-32 relative overflow-visible"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
                    
                    <div className="text-center mb-24 space-y-4">
                        <motion.div 
                            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Proprietary Engine
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">Your AI <span className="text-primary italic font-serif">Legal Guard</span></h2>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed font-medium">Complex tools for professionals, simplified for everyone.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 auto-rows-auto">
                        {/* PRIMARY FEATURE - LARGE CARD */}
                        <motion.div
                            className="md:col-span-8 bg-card/40 dark:bg-white/[0.02] border border-border/40 rounded-[3rem] p-10 flex flex-col lg:flex-row gap-12 group overflow-hidden relative"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] scale-150 rotate-12 group-hover:scale-125 transition-all duration-700 pointer-events-none">
                                <FileText className="h-64 w-64 text-primary" />
                            </div>
                            
                            <div className="flex-1 space-y-8 relative z-10">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                                        Instant <br /><span className="text-primary italic font-serif">Plain English Summary</span>
                                    </h3>
                                    <p className="text-muted-foreground text-lg max-w-sm leading-relaxed mb-4">
                                        Stop squinting at 50-page contracts. We turn long legal jargon into a <span className="text-foreground font-bold underline decoration-primary/30">2-minute read</span> so you know exactly what you're signing.
                                    </p>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground italic leading-relaxed">
                                        <strong className="text-primary not-italic">Example:</strong> Reading the CliffNotes of a 30-page rental lease to instantly find out if pets are actually allowed.
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {["Simple Language", "Key Dates", "Your Duties", "Next Steps"].map(t => (
                                        <div key={t} className="flex items-center gap-2 group/item">
                                            <div className="h-1 w-4 rounded-full bg-primary/20 group-hover/item:w-6 transition-all duration-300" />
                                            <span className="text-xs font-black uppercase tracking-wider opacity-60 group-hover/item:opacity-100 group-hover/item:text-primary transition-all underline decoration-transparent group-hover/item:decoration-primary/30 underline-offset-4 font-mono">{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive Transformation UI Mockup */}
                            <div className="hidden lg:flex flex-col justify-center w-80 relative group/mockup">
                                <div className="absolute inset-x-0 top-[-20%] bottom-[-20%] bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                                
                                <div className="space-y-6 relative">
                                    {/* Raw Jargon Text Layer */}
                                    <div className="bg-white/5 dark:bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden transition-all duration-700 group-hover:blur-[2px] group-hover:opacity-30 group-hover:scale-95">
                                        <div className="flex gap-1.5 mb-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-500/30" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-500/30" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-500/30" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-slate-500/10 rounded-full" />
                                            <div className="h-2 w-[90%] bg-slate-500/10 rounded-full" />
                                            <div className="h-2 w-[95%] bg-slate-500/10 rounded-full" />
                                            <div className="h-2 w-[70%] bg-slate-500/10 rounded-full" />
                                        </div>
                                        <div className="mt-4 text-[9px] font-mono text-slate-500/60 leading-relaxed italic">
                                            "Notwithstanding anything to the contrary in Clause 14.2.1, the Indemnifying Party shall hold harmless the Indemnified..."
                                        </div>
                                    </div>

                                    {/* Scanning Neural Line */}
                                    <motion.div 
                                        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent z-20 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                                        animate={{ top: ['10%', '90%', '10%'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    />

                                    <div className="flex justify-center -my-3 group-hover:scale-110 transition-transform duration-500">
                                        <motion.div 
                                            className="bg-primary/20 p-2 rounded-full border border-primary/30 backdrop-blur-xl"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        >
                                            <ArrowRight className="h-4 w-4 text-primary rotate-90" />
                                        </motion.div>
                                    </div>

                                    {/* AI Result Layer - The "Decoded" Version */}
                                    <motion.div 
                                        className="bg-primary shadow-2xl shadow-primary/40 rounded-[2rem] p-6 border border-white/20 relative z-30 transform -rotate-1 group-hover:rotate-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary/60"
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <ShieldCheck className="h-12 w-12 text-white" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            </div>
                                            <div className="h-2 w-24 bg-white/30 rounded-full" />
                                        </div>
                                        <p className="text-[13px] font-black text-white leading-[1.4] tracking-tight">
                                            "You can cancel anytime without penalty. Full protection on data leaks included."
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                            <div className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-white/80 uppercase tracking-tighter border border-white/5">Verified Safe</div>
                                            <div className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black text-white/80 uppercase tracking-tighter border border-white/5">Plain English</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* SECONDARY FEATURE - TALL CARD */}
                        <motion.div
                            className="md:col-span-4 bg-muted/40 border border-border/40 rounded-[3rem] p-10 flex flex-col justify-between group relative overflow-hidden"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-6 relative z-10">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight leading-tight">Smart <br />Risk Detector</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">We scan every sentence to find hidden "gotchas," unfair fees, or tricky cancellation rules that companies hope you'll miss.</p>
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-muted-foreground italic leading-relaxed">
                                    <strong className="text-emerald-500 not-italic">Example:</strong> It flags a gym contract that tries to charge you $500 just for cancelling your membership early.
                                </div>
                            </div>
                            <div className="mt-12 bg-card/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Risk Detected</span>
                                    <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-500 font-bold">Severity: High</span>
                                </div>
                                <div className="h-2 w-full bg-red-500/10 rounded-full mb-3">
                                    <div className="h-full w-[85%] bg-red-500 rounded-full" />
                                </div>
                                <p className="text-[11px] font-bold text-foreground italic">"Automatic renewal with 100% price hike..."</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="md:col-span-12 bg-background border-2 border-primary/10 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-stretch gap-16 group relative overflow-hidden mt-12 shadow-2xl shadow-primary/5 border-dashed min-h-[600px]"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
                            <div className="relative h-[480px] w-full md:w-1/2 bg-muted/40 rounded-[3rem] border border-border/40 overflow-hidden shadow-inner flex items-center justify-center group/comparison bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] self-stretch">
                                {/* Mockup of Document Comparison with real examples */}
                                <div className="relative flex items-center justify-center scale-90 md:scale-110">
                                    {/* Card 1: Rental Agreement (v1) */}
                                    <motion.div 
                                        className="absolute -translate-x-16 translate-y-6 rotate-[-15deg] w-32 h-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden opacity-60 group-hover/comparison:opacity-80 transition-opacity"
                                        animate={{ x: [-64, -72, -64], y: [24, 18, 24] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Image 
                                            src="/documents/rental-agreement.png" 
                                            alt="Rental Agreement v1" 
                                            fill 
                                            className="object-cover opacity-50 grayscale"
                                        />
                                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                                    </motion.div>

                                    {/* Card 2: Employment Contract (v2) */}
                                    <motion.div 
                                        className="absolute translate-x-16 translate-y-4 rotate-[15deg] w-32 h-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden opacity-60 group-hover/comparison:opacity-80 transition-opacity"
                                        animate={{ x: [64, 72, 64], y: [16, 22, 16] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    >
                                        <Image 
                                            src="/documents/employment-contract.png" 
                                            alt="Employment Contract v1" 
                                            fill 
                                            className="object-cover opacity-50 grayscale"
                                        />
                                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                                    </motion.div>

                                    {/* Card 3: NDA Policy (Active Comparison Target) */}
                                    <motion.div 
                                        className="z-10 w-44 h-60 bg-card border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden group-hover/comparison:border-primary/40 transition-colors"
                                        whileHover={{ scale: 1.05, rotate: -2 }}
                                    >
                                        <div className="relative w-full h-full p-1 bg-background/50">
                                            <Image 
                                                src="/documents/nda.png" 
                                                alt="NDA Policy Final" 
                                                fill 
                                                className="object-cover"
                                            />
                                            {/* AI Scanning Overlay */}
                                            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
                                            {/* Labels for "Realism" */}
                                            <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md p-2 rounded-lg border border-border/50 text-[10px] font-bold tracking-wider text-primary uppercase text-center shadow-xl">
                                                Comparing Version 4.2
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Comparison Highlight Line (The "Diff" scanner) */}
                                    <motion.div 
                                        className="absolute z-20 left-1/2 top-[30%] -translate-x-1/2 h-1 w-0 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                                        animate={{ 
                                            width: ["0%", "90%", "0%"],
                                            top: ["15%", "85%", "15%"] 
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-10 relative z-20 flex flex-col justify-center">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-500/5 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-500/20">
                                        <Search className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-5xl font-black tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-500">Document <span className="text-blue-500 italic font-serif">Comparison</span></h3>
                                </div>
                                <p className="text-muted-foreground text-lg leading-relaxed">Instantly see every single word that changed between two versions of a contract. We highlight exactly what was added, removed, or "sneaked in."</p>
                                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-sm text-muted-foreground italic leading-relaxed max-w-lg">
                                    <strong className="text-blue-500 not-italic uppercase tracking-widest text-[10px] block mb-1">Real-World Case:</strong> 
                                    See if your landlord added a new "cleaning fee" in the second draft of your apartment lease that wasn't there in the first one.
                                </div>
                                <button className="text-sm font-black text-primary flex items-center gap-2 group/btn uppercase tracking-[0.2em] hover:opacity-80 transition-all">
                                    Get Instant Legal Insights <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-2" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Documents We Simplify Section */}
                <motion.section
                    className="w-full bg-muted/20 py-32 border-y border-border/40"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Documents We <span className="text-primary italic font-serif">Simplify</span></h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From lease agreements to complex SaaS terms, we've got you covered.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {DOCUMENT_LIST.map((doc, i) => (
                                <motion.div
                                    key={i}
                                    className="flip-card h-48 sm:h-64 rounded-2xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="flip-card-inner">
                                        {/* FRONT */}
                                        <div className="flip-card-front">
                                            <Image
                                                src={doc.image}
                                                alt={doc.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                className="object-cover"
                                                priority={i < 4}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                                                <h4 className="text-lg font-bold text-white mb-1">{doc.title}</h4>
                                                <p className="text-sm text-white/80 line-clamp-2">{doc.description}</p>
                                            </div>
                                        </div>

                                        {/* BACK */}
                                        <div className="flip-card-back flip-back-doc flex flex-col justify-center items-center p-5 text-center">
                                            <h4 className="text-base sm:text-lg font-bold mb-3">{doc.title}</h4>
                                            <ul className="space-y-1.5 text-left w-full px-2">
                                                {doc.details.map((detail, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-xs sm:text-sm">
                                                        <span className="dot-accent mt-0.5 h-1.5 w-1.5 rounded-full shrink-0" />
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>


                {/* Trust & Security Section */}
                <motion.section
                    className="w-full py-32 bg-background relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.03),transparent_50%)]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-20 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest mb-4">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                100% Secure & Private
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Your Privacy is our <br /><span className="text-primary italic font-serif">Top Priority</span></h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic leading-relaxed">Legal documents are sensitive. We've built LegalLens with security at every layer.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: FolderX,
                                    title: "Zero Storage Policy",
                                    desc: "Your files are your own. Documents are processed in real-time and purged from our servers immediately after analysis.",
                                    color: "text-red-500",
                                    bg: "bg-red-500/10"
                                },
                                {
                                    icon: EyeOff,
                                    title: "Privacy-Controlled Engine",
                                    desc: "All document analysis happens within a secure, short-lived session. Once you're done, the session is digitally shredded, leaving zero digital footprints.",
                                    color: "text-blue-500",
                                    bg: "bg-blue-500/10"
                                },
                                {
                                    icon: Cpu,
                                    title: "Isolated AI Processing",
                                    desc: "Our private AI models never learn from your data. Your private documents are never used for training third-party AI systems.",
                                    color: "text-primary",
                                    bg: "bg-primary/10"
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="p-10 rounded-[3rem] bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl group/sec"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className={`h-16 w-16 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mb-8 border border-white/5 shadow-inner transition-transform duration-500 group-hover/sec:scale-110 group-hover/sec:rotate-3`}>
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-muted-foreground leading-relaxed text-sm font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* FAQ Section - Clean SaaS UI */}
                <motion.section
                    className="container mx-auto px-4 py-32"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl font-black mb-6 leading-tight">Your Questions, <br /><span className="text-primary italic">Answered.</span></h2>
                            <p className="text-muted-foreground text-lg mb-8">Everything you need to know about LegalLens AI and our intelligent document engine.</p>
                            <div className="p-8 rounded-[2rem] bg-muted/50 border border-border/40">
                                <p className="text-sm font-bold mb-2">Still have questions?</p>
                                <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed">Our legal tech specialists are here to help you navigate the future of contracts.</p>
                                <button className="text-xs font-black uppercase text-primary tracking-[0.2em]">Contact Support</button>
                            </div>
                        </div>
                        <div className="md:w-2/3 space-y-4">
                            {[
                                {
                                    q: "Is LegalLens AI a substitute for a lawyer?",
                                    a: "No. LegalLens provides AI-powered summaries and risk detection for informational purposes only. It is a powerful tool to understand your documents, but always consult a qualified attorney for critical legal decisions."
                                },
                                {
                                    q: "What types of documents can I upload?",
                                    a: "We support PDF, DOCX, TXT, and image files. Our AI is capable of processing long-form contracts, small snippets, and even scanned documents via visual OCR."
                                },
                                {
                                    q: "Is my document data stored or shared?",
                                    a: "Privacy is our priority. Documents are processed in real-time and analysis results are private to your account. We never sell your data or use it to train public models without consent."
                                },
                                {
                                    q: "How accurate is the AI analysis?",
                                    a: "Powered by Gemini 1.5 Pro and Flash, our analysis is highly accurate for standard contract archetypes. It identifies critical terms with human-like semantic understanding."
                                }
                            ].map((faq, i) => (
                                <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
                            ))}
                        </div>
                    </div>
                </motion.section>
            </main>

            <FeedbackSystem />
        </div>
    );
}
