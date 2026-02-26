'use client';
import Link from "next/link";
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
              description: "Get concise, plain English explanations of complex legal jargon and clauses."
            },
            {
              icon: ShieldCheck,
              title: "Risk Detection",
              description: "Identify hidden clauses, non-refundable deposits, and unfair liability terms."
            },
            {
              icon: Search,
              title: "Smart Comparison",
              description: "Compare two contracts side-by-side to see differences in terms and penalties."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-all overflow-hidden"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
