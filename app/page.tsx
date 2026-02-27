'use client';
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, FileText, Search, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import MagnifyingHeroHeading from "@/components/hero/MagnifyingHeroHeading";

export default function Home() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Check if we've already shown the welcome message in this session
        const hasShown = sessionStorage.getItem("welcome_shown");
        if (!hasShown) {
          setUserName(user.displayName || user.email?.split('@')[0] || "User");
          setShowGreeting(true);
          sessionStorage.setItem("welcome_shown", "true");

          // Keep visible for 3.5 seconds
          const timer = setTimeout(() => {
            setShowGreeting(false);
          }, 3500);
          return () => clearTimeout(timer);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center relative">
      {/* --- Welcome Overlay --- */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            {/* Skeleton Background (Behind Greeting) */}
            <div className="absolute inset-0 flex flex-col items-center pt-32 px-4 space-y-8 opacity-20 pointer-events-none">
              {/* Hero Skeleton */}
              <div className="h-8 w-64 bg-primary/20 rounded-full animate-pulse" />
              <div className="h-16 w-3/4 max-w-2xl bg-foreground/10 rounded-xl animate-pulse" />
              <div className="h-16 w-1/2 max-w-xl bg-foreground/10 rounded-xl animate-pulse" />
              <div className="h-4 w-96 max-w-lg bg-muted-foreground/20 rounded-lg animate-pulse mt-4" />
              <div className="flex gap-4 mt-8">
                <div className="h-12 w-40 bg-primary/20 rounded-full animate-pulse" />
                <div className="h-12 w-40 bg-foreground/5 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Greeting Text */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="z-10 text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Welcome to LegalLens, <br />
                <span className="text-primary">{userName}</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 pt-20 pb-32 text-center md:pt-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <motion.div
          className="container mx-auto max-w-4xl space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Legal Simplification
          </motion.div>

          <MagnifyingHeroHeading />

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Upload rental agreements, contracts, or policies. Get clear summaries, risk detection, and actionable advice instantly.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold transition-all relative overflow-hidden group shadow-lg"
              style={{ background: '#f97316', color: '#ffffff' }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              />
              <span className="relative z-10 flex items-center">
                Analyze Document
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/50 px-8 text-base font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              See How It Works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <motion.section
        id="features"
        className="container mx-auto px-4 py-24"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything You Need to Sign With Confidence
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Instant Summaries",
              description: "Get concise, plain English explanations of complex legal jargon and clauses.",
              details: ["Breaks down complex clauses", "Plain English translations", "Key obligations highlighted", "Action items extracted"]
            },
            {
              icon: ShieldCheck,
              title: "Risk Detection",
              description: "Identify hidden clauses, non-refundable deposits, and unfair liability terms.",
              details: ["Flags unfair terms", "Spots hidden penalties", "Liability analysis", "Risk severity scoring"]
            },
            {
              icon: Search,
              title: "Smart Comparison",
              description: "Compare two contracts side-by-side to see differences in terms and penalties.",
              details: ["Side-by-side diff view", "Clause-level matching", "Penalty comparison", "Missing terms detection"]
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="flip-card h-64 rounded-2xl"
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flip-card-inner">
                {/* FRONT */}
                <div className="flip-card-front border border-border bg-card p-8 flex flex-col justify-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>

                {/* BACK */}
                <div className="flip-card-back flip-back-feature flex flex-col justify-center items-center p-8 text-center">
                  <div className="icon-wrap mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-4">{feature.title}</h4>
                  <ul className="space-y-2 text-left w-full px-2">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="dot-accent mt-1 h-1.5 w-1.5 rounded-full shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32">
          <h3 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Documents We Simplify for You
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
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
            ].map((doc, i) => (
              <motion.div
                key={i}
                className="flip-card h-48 sm:h-64 rounded-2xl"
                initial={{ opacity: 1, y: 20 }}
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
    </div>
  );
}
