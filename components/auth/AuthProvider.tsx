'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user && !PUBLIC_PATHS.includes(pathname)) {
                router.push('/login');
            } else if (user && PUBLIC_PATHS.includes(pathname)) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // If user is null but we are on a protected route, we render nothing while redirecting
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}
