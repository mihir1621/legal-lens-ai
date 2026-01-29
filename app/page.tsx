import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 pt-20 pb-32 text-center md:pt-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Legal Simplification
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Understand Legal Documents <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              In Seconds, Not Hours
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Upload rental agreements, contracts, or policies. Get clear summaries, risk detection, and actionable advice instantly.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
            <Link
              href="/upload"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              Analyze Document
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/50 px-8 text-base font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-24">
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
            <div key={i} className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
