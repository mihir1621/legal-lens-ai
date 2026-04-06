'use client';

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
    ThumbsUp, 
    ThumbsDown,
    CheckCircle2, 
    XCircle, 
    Zap,
    Loader2,
    Sparkles,
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { 
    PieChart as RePieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer 
} from 'recharts';

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(50));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFeedbacks(data);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to feedback:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Calculate live sentiment
    const sentimentStats = useMemo(() => {
        if (feedbacks.length === 0) return { positivePercent: 0, negativePercent: 0, graphData: [{ name: 'Empty', value: 1, color: '#e2e8f0' }] };
        
        const total = feedbacks.length;
        const upVotes = feedbacks.filter(f => f.rating === 'up').length;
        const downVotes = feedbacks.filter(f => f.rating === 'down').length;
        
        const posPerc = Math.round((upVotes / total) * 100);
        const negPerc = 100 - posPerc;

        return {
            positivePercent: posPerc,
            negativePercent: negPerc,
            graphData: [
                { name: 'Positive', value: upVotes || 0.001, color: '#3b82f6' },
                { name: 'Negative', value: downVotes || 0.001, color: '#f97316' },
            ]
        };
    }, [feedbacks]);

    const unansweredCount = feedbacks.filter(f => !f.answered).length;

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Synchronizing Voice Portal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 italic font-serif">User <span className="text-primary not-italic font-sans">Voice</span></h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-xs">Direct feedback and sentiment summary analysis.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-highlight border border-border/40 rounded-3xl flex items-center gap-4 shadow-sm">
                        <div className="text-right">
                             <div className="text-sm font-black tracking-tight">{sentimentStats.positivePercent}% <span className="text-emerald-500">Positive</span></div>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Sentiment</p>
                        </div>
                        <div className="h-10 w-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie 
                                        data={sentimentStats.graphData} 
                                        dataKey="value" 
                                        cx="50%" cy="50%" 
                                        innerRadius={15} outerRadius={20} 
                                        paddingAngle={5} 
                                        stroke="none"
                                    >
                                        {sentimentStats.graphData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-[3rem] border border-border/40 shadow-sm overflow-hidden"
            >
                {/* Desktop view Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/20">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground w-[20%]">Originator</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Liked</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Disliked</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Suggestions</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center w-16">Stat.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Sparkles className="h-8 w-8 text-primary mb-2" />
                                            <p className="text-xs font-black uppercase tracking-widest">Waiting for first voice...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : feedbacks.map((feedback, i) => (
                                <motion.tr 
                                    key={feedback.id} 
                                    className="hover:bg-muted/30 transition-colors group"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black tracking-tight truncate max-w-[150px]">{feedback.user}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono uppercase font-black opacity-50 tracking-widest">{feedback.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl text-[10px] w-fit ${feedback.liked !== 'None' ? 'text-blue-600 bg-blue-500/5' : 'text-muted-foreground/30 italic'}`}>
                                            <ThumbsUp className="h-3 w-3" />
                                            <span className="truncate max-w-[120px]">{feedback.liked}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className={`p-3 rounded-xl border border-destructive/10 text-[10px] text-muted-foreground font-medium max-w-[180px] leading-relaxed truncate ${feedback.disliked === 'None' ? 'opacity-20 italic font-normal' : ''}`}>
                                            {feedback.disliked}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-start gap-3 bg-card border border-border/40 p-4 rounded-xl shadow-sm max-w-[220px] hover:border-primary/30 transition-colors">
                                             <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Zap className="h-3 w-3" />
                                             </div>
                                             <p className="text-[10px] font-bold text-foreground leading-relaxed line-clamp-3">{feedback.suggestions}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        {feedback.answered ? (
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground/30 border border-border/40 group-hover:scale-110 transition-transform">
                                                <XCircle className="h-5 w-5" />
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden divide-y divide-border/20">
                    {feedbacks.length === 0 ? (
                         <div className="p-20 text-center flex flex-col items-center gap-2 opacity-30">
                            <Sparkles className="h-8 w-8 text-primary mb-2" />
                            <p className="text-xs font-black uppercase tracking-widest">Waiting for first voice...</p>
                        </div>
                    ) : feedbacks.map((feedback, i) => (
                        <motion.div 
                            key={feedback.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black tracking-tight truncate max-w-[200px]">{feedback.user}</span>
                                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{feedback.date}</span>
                                </div>
                                {feedback.answered ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                     <div className={`flex items-center gap-1.5 font-black px-2 py-1 rounded-lg text-[9px] ${feedback.rating === 'up' ? 'text-blue-600 bg-blue-500/5' : 'text-orange-600 bg-orange-500/5'}`}>
                                        {feedback.rating === 'up' ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
                                        {feedback.rating === 'up' ? 'LIKED' : 'DISLIKED'}
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl">
                                    <p className="text-xs font-bold leading-relaxed">{feedback.suggestions}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Smart Summary / Bottom Feature */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between shadow-sm"
                >
                    <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight text-indigo-900">Sentiment <span className="font-serif italic">Breakdown</span></h3>
                        <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em]">AI-generated mood report</p>
                    </div>
                    <div className="flex items-end gap-2 text-indigo-900">
                        <div className="text-5xl font-black tracking-tighter">{(sentimentStats.positivePercent / 10).toFixed(1)}</div>
                        <div className="text-[10px] font-black mb-1 opacity-40 uppercase">Aura Score</div>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-8 rounded-[3rem] bg-card border border-border/40 flex items-center justify-between group cursor-default hover:border-primary/20 transition-all shadow-sm"
                >
                    <div className="space-y-1">
                        <h3 className="text-lg font-black tracking-tight">Active Inquiries</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic font-serif opacity-60 text-destructive/60">Requires internal team attention</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                        <span className="text-2xl font-black italic font-serif">{unansweredCount}</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
