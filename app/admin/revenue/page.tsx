'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
    IndianRupee, 
    ArrowLeft, 
    Loader2,
    CheckCircle2,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface PaymentData {
    id: string;
    userId: string;
    planType: string;
    amount: number;
    currency: string;
    gateway: string;
    paymentId: string;
    status: string;
    createdAt: string;
}

export default function AdminRevenuePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const router = useRouter();

    useEffect(() => {
        let unsubscribePayments: () => void;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user && user.email === 'admin@gmail.com') {
                setIsAdmin(true);
                
                // Real-time synchronization for the ledger
                const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
                unsubscribePayments = onSnapshot(q, (snapshot) => {
                    let total = 0;
                    const fetchedPayments: PaymentData[] = [];
                    
                    snapshot.forEach((doc) => {
                        const data = doc.data() as PaymentData;
                        data.id = doc.id;
                        fetchedPayments.push(data);
                        // Force cast to number to ensure mathematical addition, not concatenation
                        total += Number(data.amount || 0);
                    });

                    setPayments(fetchedPayments);
                    setTotalRevenue(total);
                    setIsLoading(false);
                }, (error) => {
                    console.error("Ledger Sync Error:", error);
                    setIsLoading(false);
                });
            } else {
                setIsAdmin(false);
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribePayments) unsubscribePayments();
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <Loader2 className="animate-spin text-primary w-10 h-10 mb-4"/>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Securely Fetching Ledger...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-8 bg-[#050505] rounded-[3rem]">
                <h1 className="text-4xl text-white font-black tracking-tighter mb-4">ACCESS DENIED</h1>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-24">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin">
                            <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                        </Link>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Financial Ledger
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Revenue <span className="text-emerald-500 italic font-serif underline decoration-emerald-500/30">Operations</span></h1>
                    <p className="text-muted-foreground font-medium">Real-time tracking of processed transactions across all gateways.</p>
                </div>
            </div>

            {/* Revenue Overview Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                
                <div className="space-y-2 z-10 w-full">
                    <div className="flex items-center gap-2 text-emerald-500 font-black tracking-widest uppercase text-xs">
                        <IndianRupee className="h-4 w-4" />
                        Gross Volumetric Revenue
                    </div>
                    <div className="text-5xl md:text-7xl font-black tracking-tighter text-primary">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <p className="text-emerald-500/70 font-bold flex items-center gap-2 mt-4">
                        <TrendingUp className="h-4 w-4" /> All time combined earnings from Stripe & Razorpay.
                    </p>
                </div>
            </motion.div>

            {/* Transactions Ledger Table */}
            <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-border/50">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Recent Transactions
                    </h3>
                </div>
                
                {payments.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground font-medium flex flex-col items-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        No real payments recorded yet!<br/> Make a test payment on the frontend to populate this ledger.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID / Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gateway</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan Purchased</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.map((tx, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={tx.id} 
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-white">{tx.paymentId}</div>
                                            <div className="text-xs text-muted-foreground bg-black/40 inline-flex px-2 py-0.5 rounded mt-1 font-mono">User: {tx.userId.substring(0,8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black ${
                                                tx.gateway.toLowerCase() === 'stripe' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {tx.gateway}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-sm uppercase">{tx.planType}</div>
                                            <div className="text-[10px] text-muted-foreground max-w-xs truncate">{new Date(tx.createdAt).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-white text-lg tracking-tighter">₹{tx.amount.toLocaleString('en-IN')}</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black text-emerald-500">
                                                    <CheckCircle2 className="h-3 w-3" /> Settled
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
