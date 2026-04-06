'use client';

import Link from 'next/link';
import { Scale, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
// import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Wait for animation to finish before signing out
        setTimeout(async () => {
            sessionStorage.removeItem("welcome_shown"); // Reset welcome message for next login
            await signOut(auth);
            setIsLoggingOut(false);
        }, 600);
    };

    // Auth pages (Login/Signup): Clean navbar 
    if (['/login', '/signup', '/forgot-password'].includes(pathname)) {
        return (
            <nav className="absolute top-0 z-50 w-full p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Scale className="h-6 w-6 text-primary" />
                    <span>LegalLens</span>
                </Link>
                {/* Theme Toggle commented out for now */}
                {/* <div className="z-50">
                    <ThemeToggle />
                </div> */}
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
                            <motion.div
                                className="flex items-center gap-4 sm:gap-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Link href="/" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 active:scale-95 hidden sm:block">Home</Link>
                                <Link href="/upload" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 active:scale-95 hidden sm:block">Analyze</Link>
                                <Link href="/history" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 active:scale-95 hidden sm:block">History</Link>
                                <Link href="/compare" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 active:scale-95 hidden sm:block">Compare</Link>
                                <Link href="/about" className="text-sm font-medium hover:text-primary transition-all hover:scale-105 active:scale-95 hidden sm:block">About</Link>

                                <div className="h-6 w-px bg-border hidden sm:block" />

                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium hidden md:block">
                                        {user.displayName || user.email?.split('@')[0]}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className={`
                                            group relative rounded-full border border-red-500/20 px-4 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 
                                            bg-gradient-to-r from-red-500/10 via-transparent to-red-500/5
                                            transition-all duration-500 ease-out
                                            hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 hover:border-red-500/40
                                            active:scale-95 flex items-center gap-1.5 overflow-hidden
                                            ${isLoggingOut ? 'opacity-0 scale-x-50 blur-sm delay-300 pointer-events-none' : 'opacity-100 scale-100'}
                                        `}
                                    >
                                        <LogOut className={`h-3.5 w-3.5 transition-all duration-500 ease-out ${isLoggingOut ? 'translate-x-8 opacity-0' : 'group-hover:translate-x-1'}`} />
                                        <span className={`transition-all duration-500 ease-out delay-75 ${isLoggingOut ? 'translate-x-12 opacity-0' : 'group-hover:translate-x-1'}`}>Logout</span>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block mr-2">About</Link>
                            <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">Login</Link>
                            <Link href="/signup">
                                <motion.button
                                    className="rounded-full px-6 py-2 text-sm font-black transition-all flex items-center gap-2 bg-primary text-white shadow-lg shadow-primary/25"
                                    whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(249,115,22,0.45)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign Up
                                </motion.button>
                            </Link>
                        </>
                    )}

                    {/* Theme Toggle - Commented out for light-only mode */}
                    {/* <ThemeToggle /> */}
                </div>
            </div>
        </nav>
    );
}
