'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchHistory(u.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchHistory = async (uid: string) => {
        try {
            const q = query(
                collection(db, "documents"),
                where("userId", "==", uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Recently'
            }));
            setHistory(docs);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your analysis history...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Please Login</h1>
                <p className="text-muted-foreground mb-6">You need to be logged in to view your analysis history.</p>
                <Link href="/login">
                    <motion.button
                        className="rounded-full px-8 py-2 text-sm font-semibold transition-all shadow-md"
                        style={{ background: '#f97316', color: '#ffffff' }}
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(249,115,22,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login to Continue
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-16 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                <motion.span
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                    whileHover={{ scale: 1.05, backgroundColor: "var(--primary)", color: "#fff" }}
                >
                    {history.length} Documents
                </motion.span>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-6">Start by uploading your first legal document for analysis.</p>
                    <Link href="/upload">
                        <motion.button
                            className="rounded-full px-8 py-2.5 text-sm font-semibold shadow-lg"
                            style={{ background: '#f97316', color: '#ffffff' }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(249, 115, 22, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Upload Document
                        </motion.button>
                    </Link>
                </div>
            ) : (
                <motion.div
                    className="space-y-4"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    initial="hidden"
                    animate="show"
                >
                    {history.map((item) => {
                        const risk = item.analysis?.key_clauses?.find((c: any) => c.risk === 'High') ? 'High' :
                            item.analysis?.key_clauses?.find((c: any) => c.risk === 'Medium') ? 'Medium' : 'Low';

                        return (
                            <motion.div
                                key={item.id}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    show: { opacity: 1, x: 0 }
                                }}
                            >
                                <Link
                                    href={`/document/${item.id}`}
                                    className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary transition-colors" />

                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{item.date}</span>
                                                </div>
                                                <span>•</span>
                                                <span className="capitalize">{item.type || 'Document'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <motion.span
                                            className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-sm ${risk === 'High' ? 'bg-red-500/10 text-red-600' :
                                                risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                                    'bg-emerald-500/10 text-emerald-600'
                                                }`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {risk} Risk
                                        </motion.span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
