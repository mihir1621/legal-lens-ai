'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    Filter, 
    MoreHorizontal, 
    ArrowUpDown, 
    ExternalLink, 
    ShieldCheck, 
    Clock, 
    Zap,
    Mail,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

const MOCK_USERS = [
    { id: '1', email: 'john@example.com', analyses: 42, timeSpent: '15h 20m', lastActive: '2 min ago', powerUser: true },
    { id: '2', email: 'sarah.j@legal.com', analyses: 28, timeSpent: '8h 45m', lastActive: '1h ago', powerUser: true },
    { id: '3', email: 'mike_brown@tech.co', analyses: 15, timeSpent: '4h 12m', lastActive: '3h ago', powerUser: false },
    { id: '4', email: 'laura.dev@gmail.com', analyses: 8, timeSpent: '2h 10m', lastActive: '1d ago', powerUser: false },
    { id: '5', email: 'contract.pro@biz.net', analyses: 112, timeSpent: '45h 30m', lastActive: 'Just now', powerUser: true },
    { id: '6', email: 'user992@yahoo.com', analyses: 3, timeSpent: '1h 05m', lastActive: '2d ago', powerUser: false },
    { id: '7', email: 'legal.intern@univ.edu', analyses: 19, timeSpent: '6h 50m', lastActive: '4h ago', powerUser: false },
    { id: '8', email: 'ceo@startup.io', analyses: 5, timeSpent: '45m', lastActive: '1w ago', powerUser: false },
];

export default function UsersActivityPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 italic font-serif">Community <span className="text-primary not-italic font-sans">Pulse</span></h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-xs">Individual behavior tracking and power user identification.</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Identify users by email or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-14 rounded-2xl bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-card border border-border/40 hover:bg-muted/50 transition-all">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[3.5rem] border border-border/40 shadow-sm overflow-hidden"
            >
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/20">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground w-1/3 text-left">User Entity</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intelligence Rank</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Session Velocity</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Analyses</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Last Active</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right w-16">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {MOCK_USERS.map((user, i) => (
                                <motion.tr 
                                    key={user.id} 
                                    className="hover:bg-muted/30 transition-colors group"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tight">{user.email}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">ID: {user.id.padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {user.powerUser ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                                                <Zap className="h-3 w-3 fill-current" />
                                                Power User
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                                <Users className="h-3 w-3" />
                                                Standard
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/30 px-3 py-1 w-fit rounded-lg">
                                            <Clock className="h-4 w-4" />
                                            {user.timeSpent}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-lg font-black tracking-tighter">{user.analyses}</span>
                                        <span className="ml-1 text-[10px] font-bold text-muted-foreground uppercase opacity-50">Docs</span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-muted-foreground italic">
                                        {user.lastActive}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden divide-y divide-border/20">
                    {MOCK_USERS.map((user, i) => (
                        <motion.div 
                            key={user.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight line-clamp-1 max-w-[150px]">{user.email}</span>
                                        <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">ID: {user.id.padStart(4, '0')}</span>
                                    </div>
                                </div>
                                {user.powerUser ? (
                                    <Zap className="h-4 w-4 text-orange-500 fill-current" />
                                ) : (
                                    <Users className="h-4 w-4 text-blue-500" />
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/20 rounded-2xl">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Velocity</p>
                                    <p className="text-xs font-bold">{user.timeSpent}</p>
                                </div>
                                <div className="p-3 bg-muted/20 rounded-2xl">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">Docs Analyzed</p>
                                    <p className="text-xs font-black">{user.analyses}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-muted-foreground font-medium italic">Active {user.lastActive}</span>
                                <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                                    View Full History <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="p-8 border-t border-border/40 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Showing 1-8 of 1,284 intelligence profiles</p>
                    <div className="flex items-center gap-2">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex h-10 px-4 items-center justify-center rounded-xl bg-primary text-white font-black text-sm">
                            1
                        </div>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border/40 hover:bg-muted transition-all">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
