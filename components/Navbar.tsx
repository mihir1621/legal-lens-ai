'use client';

import Link from 'next/link';
import { Scale, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    // Auth pages (Login/Signup): Clean navbar + Theme Toggle
    if (['/login', '/signup', '/forgot-password'].includes(pathname)) {
        return (
            <nav className="absolute top-0 z-50 w-full p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Scale className="h-6 w-6 text-primary" />
                    <span>LegalLens</span>
                </Link>
                <div className="z-50">
                    <ThemeToggle />
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
                    <Scale className="h-6 w-6 text-primary" />
                    <span>LegalLens</span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <>
                            <Link href="/upload" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Analyze</Link>
                            <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">History</Link>
                            <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Compare</Link>

                            <div className="h-6 w-px bg-border hidden sm:block" />

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium hidden md:block">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/20 transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Login
                            </button>
                        </Link>
                    )}

                    {/* Theme Toggle - Always Last */}
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
