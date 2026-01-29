import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Scale className="h-6 w-6" />
                    <span>LegalLens</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/upload" className="text-sm font-medium hover:text-primary transition-colors">Analyze</Link>
                    <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">History</Link>
                    <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">Compare</Link>
                    {/* Auth placeholder */}
                    <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25">
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
}
