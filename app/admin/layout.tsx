'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ShieldAlert, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useSidebar } from '@/context/SidebarContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } = useSidebar();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === '/login';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                if (!isLoginPage) router.push('/login');
                setAuthorized(false);
                setLoading(false);
                return;
            }

            if (user.email === 'admin@gmail.com') {
                setAuthorized(true);
                if (isLoginPage) router.push('/admin');
            } else {
                setAuthorized(false);
                if (!isLoginPage) router.push('/login');
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, isLoginPage]);

    // Enhanced Loading / Safety State
    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-black tracking-widest uppercase opacity-40 font-mono">Syncing Master Identity...</p>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!authorized) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-black tracking-widest uppercase opacity-40 font-mono">Redirecting to Secure Gate...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-background relative transition-all duration-500 ease-in-out">
            <div className="p-4 md:p-8 pb-20 relative">
                {children}
            </div>
        </div>
    );
}
