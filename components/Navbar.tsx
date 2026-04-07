'use client';

import Link from 'next/link';
import { Scale, LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';

export default function Navbar() {
    const { toggle } = useSidebar();
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const isAdmin = user?.email === 'admin@gmail.com';

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
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <button 
                            onClick={toggle}
                            className="p-2 hover:bg-muted rounded-xl transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Scale className="h-6 w-6 text-primary" />
                        <span>LegalLens</span>
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <button 
                            onClick={toggle}
                            className="hidden md:inline-flex p-2 mr-2 hover:bg-muted rounded-xl transition-colors active:scale-95"
                        >
                            <Menu className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                    )}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
                        <Scale className="h-6 w-6 text-primary" />
                        <span>LegalLens</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <>
                            {/* Desktop/Tablet Navigation */}
                            <motion.div
                                className="hidden md:flex items-center gap-4 sm:gap-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {isAdmin && pathname.startsWith('/admin') ? (
                                    <div className="flex items-center gap-4 sm:gap-6 mr-6 transition-all duration-500">
                                        <Link href="/admin" className={`text-base font-black transition-all hover:text-primary ${pathname === '/admin' ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>Dashboard</Link>
                                        <Link href="/admin/analytics" className={`text-base font-black transition-all hover:text-primary ${pathname === '/admin/analytics' ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>Analytics</Link>
                                        <Link href="/admin/users" className={`text-base font-black transition-all hover:text-primary ${pathname === '/admin/users' ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>Users</Link>
                                        <Link href="/admin/feedback" className={`text-base font-black transition-all hover:text-primary ${pathname === '/admin/feedback' ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>Feedback</Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 sm:gap-6 mr-6 transition-all duration-500">
                                        <Link href="/" className={`text-base font-bold transition-all hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}>Home</Link>
                                        <Link href="/upload" className={`text-base font-bold transition-all hover:text-primary ${pathname === '/upload' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}>Analyze</Link>
                                        <Link href="/history" className={`text-base font-bold transition-all hover:text-primary ${pathname === '/history' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}>History</Link>
                                        <Link href="/compare" className={`text-base font-bold transition-all hover:text-primary ${pathname === '/compare' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}>Compare</Link>
                                        <Link 
                                            href={pathname === '/' ? "#pricing" : "/pricing"} 
                                            onClick={(e) => {
                                                if (pathname === '/') {
                                                    e.preventDefault();
                                                    const element = document.querySelector('#pricing');
                                                    if (element) {
                                                        const offset = 80; // Navbar height + gap
                                                        const elementPosition = (element as HTMLElement).offsetTop;
                                                        const offsetPosition = elementPosition - offset;
                                                        window.scrollTo({
                                                            top: offsetPosition,
                                                            behavior: 'smooth'
                                                        });
                                                    }
                                                }
                                            }}
                                            className={`text-base font-bold transition-all hover:text-primary ${pathname === '/pricing' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}
                                        >
                                            Pricing
                                        </Link>
                                        <Link href="/about" className={`text-base font-bold transition-all hover:text-primary ${pathname === '/about' ? 'text-primary' : 'text-muted-foreground hover:scale-105 active:scale-95'}`}>About</Link>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4">
                                    <div className="h-6 w-px bg-border/60 mx-1" />
                                    <span className="text-base font-bold">
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

                            {/* Mobile Navigation Trigger */}
                            <div className="flex md:hidden items-center gap-2">
                                <span className="text-sm font-bold opacity-60 max-w-[80px] truncate">
                                    {user.displayName || user.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={toggle}
                                    className="p-2 bg-primary/10 text-primary rounded-xl transition-all active:scale-95 border border-primary/20"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-base font-bold hover:text-primary transition-colors">Login</Link>
                            <Link href="/signup">
                                <motion.button
                                    className="rounded-full px-6 py-2 text-sm font-black transition-all flex items-center gap-2 bg-primary text-white shadow-lg shadow-primary/25"
                                    whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(249,115,22,0.45)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign Up
                                </motion.button>
                            </Link>
                        </div>
                    )}

                    {/* Theme Toggle - Commented out for light-only mode */}
                    {/* <ThemeToggle /> */}
                </div>
            </div>
        </nav>
    );
}
