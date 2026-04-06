import Link from 'next/link';
import { Scale, ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-card py-24 relative overflow-hidden">
            {/* Subtle trust background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.03),transparent_40%)]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-foreground group">
                            <Scale className="h-8 w-8 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6" />
                            <span>LegalLens<span className="text-primary italic font-serif ml-1">AI</span></span>
                        </Link>
                        <p className="max-w-xs text-sm text-muted-foreground leading-relaxed font-medium">
                            The world's most secure AI legal assistant. We empower you to understand every clause, identify every risk, and sign with absolute confidence.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">AI Summary</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Risk Detector</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Diff Engine</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Legal</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors font-bold">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors font-bold">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary transition-colors font-bold">Cookie Preference</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 rounded-[3rem] bg-muted/40 border border-border/40 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h5 className="text-xs font-black uppercase tracking-tighter">Enterprise Trust</h5>
                                    <p className="text-[10px] text-muted-foreground">Highest privacy standards.</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                LegalLens provides informational analysis only. It is not a law firm or a substitute for professional legal advice.
                            </p>
                        </div>
                    </div>
                </div>


            </div>

            {/* Absolute bottom copyright */}
            <div className="mt-20 py-10 border-t border-border/40 bg-muted/20 text-center">
                <p className="text-[11px] text-foreground font-black font-mono tracking-[0.1em] uppercase">
                    © {new Date().getFullYear()} LEGALLENS AI. BUILT FOR THE SECURE FUTURE OF LAW.
                </p>
            </div>
        </footer>
    );
}
