import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-muted/30 py-8">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                    LegalLens provides informational simplification and is not legal advice.
                </p>
                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                </div>
                <p className="mt-8 text-xs text-muted-foreground/50">
                    © {new Date().getFullYear()} LegalLens AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
