'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, ChevronRight, Loader2, Search } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
                    <button
                        className="rounded-full px-8 py-2 text-sm font-semibold transition-all"
                        style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 4px 14px rgba(249,115,22,0.30)' }}
                    >
                        Login to Continue
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Analysis History</h1>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {history.length} Documents
                </span>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-6">Start by uploading your first legal document for analysis.</p>
                    <Link href="/upload">
                        <button
                            className="rounded-full px-6 py-2 text-sm font-semibold transition-all"
                            style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 4px 14px rgba(249,115,22,0.30)' }}
                        >
                            Upload Document
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => {
                        const risk = item.analysis?.key_clauses?.find((c: any) => c.risk === 'High') ? 'High' :
                            item.analysis?.key_clauses?.find((c: any) => c.risk === 'Medium') ? 'Medium' : 'Low';

                        return (
                            <Link
                                key={item.id}
                                href={`/document/${item.id}`}
                                className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary transition-colors" />

                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
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
                                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-sm ${risk === 'High' ? 'bg-red-500/10 text-red-600' :
                                            risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-emerald-500/10 text-emerald-600'
                                        }`}>
                                        {risk} Risk
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
