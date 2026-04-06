'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    BarChart3, 
    Users, 
    MessageSquare, 
    LogOut,
    ShieldCheck,
    Zap,
    X,
    Layout,
    Clock,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const ADMIN_NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Feedback', icon: MessageSquare, href: '/admin/feedback' },
];

const STANDARD_NAV_ITEMS = [
    { name: 'Home', icon: Layout, href: '/' },
    { name: 'Analyze', icon: Zap, href: '/upload' },
    { name: 'History', icon: Clock, href: '/history' },
    { name: 'Compare', icon: BarChart3, href: '/compare' },
    { name: 'About', icon: ShieldCheck, href: '/about' },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const isAdmin = user?.email === 'admin@gmail.com';
    const isShowingAdminNav = isAdmin && pathname.startsWith('/admin');
    const navItems = isShowingAdminNav ? ADMIN_NAV_ITEMS : STANDARD_NAV_ITEMS;

    const handleLogout = async () => {
        await signOut(auth);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
                    />

                    <motion.aside 
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-screen w-72 bg-card border-r border-border/40 z-[60] flex flex-col p-6 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 mb-12">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                    {isShowingAdminNav ? <ShieldCheck className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h1 className="font-black tracking-tighter text-lg leading-none">
                                        {isShowingAdminNav ? 'Admin' : 'Legal'}<span className="text-primary italic font-serif ml-1">{isShowingAdminNav ? 'Panel' : 'Lens'}</span>
                                    </h1>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                        {isShowingAdminNav ? 'v2.0 Control Center' : 'Global Intelligence'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 lg:hidden text-muted-foreground hover:text-primary transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="px-4 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 font-mono">
                                {isShowingAdminNav ? 'Command Suite' : 'Main Menu'}
                            </div>
                            {navItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link key={item.name} href={item.href} onClick={() => onClose()}>
                                        <motion.div
                                            className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative ${
                                                active 
                                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                            whileHover={{ x: 8 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {active && (
                                                <motion.div 
                                                    layoutId="sidebar-active-pill"
                                                    className="absolute left-0 w-1 h-6 bg-primary rounded-full" 
                                                />
                                            )}
                                            <item.icon className={`h-5 w-5 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:rotate-12'}`} />
                                            <span className="text-sm font-bold">{item.name}</span>
                                        </motion.div>
                                    </Link>
                                );
                            })}

                            {!isShowingAdminNav && isAdmin && (
                                <>
                                    <div className="mt-8 px-4 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 font-mono">Master Mode</div>
                                    <Link href="/admin" onClick={() => onClose()}>
                                        <motion.div
                                            className="group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-primary hover:bg-primary/10"
                                            whileHover={{ x: 8 }}
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                            <span className="text-sm font-bold">Admin Dashboard</span>
                                        </motion.div>
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Footer */}
                        <div className="pt-6 border-t border-border/40 mt-auto">
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                            >
                                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold">Sign Out</span>
                            </button>
                            
                            <div className="mt-4 px-4 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure session Active</span>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
