'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useSidebar();
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <>
            <Navbar />
            <AdminSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <main className={`flex-1 transition-all duration-500 ease-in-out ${isAdminPage && isOpen ? 'lg:ml-72' : 'ml-0'}`}>
                {children}
            </main>
            {!isAdminPage && <Footer />}
        </>
    );
}
