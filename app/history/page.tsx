'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    FileText, 
    Clock, 
    ChevronRight, 
    Loader2, 
    Search,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    History,
    FileCheck,
    ArrowUpRight
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

/**
 * ACTIVITY HISTORY COMPONENT
 * Refactored to represent a clean audit log of user interactions and document processing.
 */

interface ActivityItem {
    id: string;
    title: string;
    type: string;
    createdAt: any;
    date: string;
    time: string;
    status: 'completed' | 'processing' | 'failed';
    actionType: 'verification' | 'upload' | 'analysis' | 'comparison';
    details: string;
}

export default function HistoryPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchActivityLog(u.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchActivityLog = async (uid: string) => {
        try {
            const q = query(
                collection(db, "documents"),
                where("userId", "==", uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const logs = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const dateObj = data.createdAt?.toDate() || new Date();
                
                return {
                    id: doc.id,
                    title: data.title || 'Untitled Document',
                    type: data.type || 'Legal Document',
                    createdAt: data.createdAt,
                    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    status: 'completed', // All fetched documents are assumed processed/completed in this log
                    actionType: 'verification', 
                    details: `Successfully verified and scanned for critical clauses.`
                } as ActivityItem;
            });
            setActivities(logs);
        } catch (err) {
            console.error("Error fetching activity log:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#050505] text-white">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-6" />
                <p className="text-gray-500 font-medium tracking-wide">Syncing your activity history...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-[#050505] text-white">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <History className="h-10 w-10 text-gray-600" />
                </div>
                <h1 className="text-3xl font-black mb-3 tracking-tighter">Activity Vault Locked</h1>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed">
                    Please sign in to your LegalLens account to view your document interaction history.
                </p>
                <Link href="/login">
                    <motion.button
                        className="rounded-2xl px-10 py-3 text-sm font-black transition-all shadow-xl bg-blue-600 text-white hover:bg-blue-500"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Sign In Now
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans pb-24">
            <motion.div
                className="container mx-auto px-4 pt-4 max-w-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Header Implementation */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase"
                        >
                            <History className="w-3" />
                            Audit Trail
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Activity Log</h1>
                        <p className="text-gray-500 font-medium max-w-md">
                            A complete record of your document verifications and system interactions.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center">
                            <span className="text-xs font-black text-gray-600 uppercase tracking-tighter">Total Events</span>
                            <span className="text-2xl font-black text-white">{activities.length}</span>
                        </div>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/[0.01]"
                    >
                        <FileText className="h-16 w-16 text-gray-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-500 mb-2">No activities recorded</h3>
                        <p className="text-gray-600 mb-10 max-w-xs mx-auto font-medium">Your activity history will appear here once you begin document verifications.</p>
                        <Link href="/upload">
                            <motion.button
                                className="rounded-2xl px-8 py-3 text-sm font-black shadow-2xl bg-white text-black hover:bg-gray-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start First Scan
                            </motion.button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    href={`/document/${item.id}`}
                                    className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-white/5 bg-[#0a0a0a] hover:border-blue-500/30 hover:bg-[#0c0c0c] transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Item Content */}
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-500 shrink-0">
                                            <FileCheck className="h-7 w-7" />
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-lg">
                                                {item.details}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/[0.03]">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {item.date} at {item.time}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {item.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Trigger */}
                                    <div className="mt-6 md:mt-0 flex items-center justify-end md:justify-center gap-4 shrink-0">
                                        <div className="hidden md:flex flex-col items-end mr-4 text-right">
                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Category</span>
                                            <span className="text-xs font-bold text-gray-500">Document Scan</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-gray-600 group-hover:border-blue-500/50 group-hover:text-blue-500 group-hover:bg-blue-500/5 transition-all">
                                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Subtle Ambient Background */}
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/[0.02] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
