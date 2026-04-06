'use client';

import { motion } from 'framer-motion';
import { 
    Users, 
    Zap, 
    TrendingUp, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight,
    Search,
    ShieldCheck,
    MousePointer2,
    BarChart
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart as ReBarChart,
    Bar,
    Cell
} from 'recharts';

// Mock data for initial dashboard state
const RECENT_USAGE_DATA = [
    { name: 'Mon', users: 40, analyses: 120 },
    { name: 'Tue', users: 30, analyses: 90 },
    { name: 'Wed', users: 65, analyses: 210 },
    { name: 'Thu', users: 45, analyses: 160 },
    { name: 'Fri', users: 90, analyses: 280 },
    { name: 'Sat', users: 110, analyses: 350 },
    { name: 'Sun', users: 85, analyses: 240 },
];

const TOP_FEATURES = [
    { name: 'Clause Analysis', value: 85, color: '#3b82f6' },
    { name: 'Risk Detection', value: 65, color: '#f97316' },
    { name: 'Document Comparison', value: 45, color: '#10b981' },
    { name: 'Executive Summary', value: 30, color: '#8b5cf6' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Systems <span className="text-primary italic font-serif underline decoration-primary/30">Overview</span></h1>
                    <p className="text-muted-foreground font-medium">Real-time performance metrics and user growth tracking.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        Live Feed
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: '1,284', trend: '+12%', icon: Users, color: 'blue' },
                    { label: 'Active Today', value: '412', trend: '+8%', icon: MousePointer2, color: 'orange' },
                    { label: 'Total Analyses', value: '8,492', trend: '+24%', icon: Zap, color: 'emerald' },
                    { label: 'Avg. Time/User', value: '4m 32s', trend: '-2%', icon: Clock, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card p-6 rounded-[2rem] border border-border/40 shadow-sm group hover:shadow-xl hover:border-primary/20 transition-all cursor-default"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                        <div className="text-3xl font-black tracking-tighter leading-none">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main usage chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Platform Velocity</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">Analyses vs Active Users (7D)</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-primary" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Analyses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-400" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Users</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={RECENT_USAGE_DATA}>
                                <defs>
                                    <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '1.5rem', 
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}
                                />
                                <Area type="monotone" dataKey="analyses" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorAnalyses)" />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Features Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                             🔥 Feature Intake
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">Most engaged core features</p>
                    </div>
                    
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={TOP_FEATURES} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    hide
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ 
                                        borderRadius: '1rem', 
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '11px',
                                        fontWeight: '700'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                    {TOP_FEATURES.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4 pt-6 mt-auto border-t border-border/40">
                        {TOP_FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: feature.color }} />
                                    <span className="text-xs font-bold text-muted-foreground">{feature.name}</span>
                                </div>
                                <span className="text-xs font-black">{feature.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Smart Trends / Insights */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                         <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white">
                            <TrendingUp className="h-5 w-5" />
                         </div>
                         <h3 className="text-xl font-black tracking-tight text-indigo-900 italic">Neural Trend <span className="font-serif">Analysis</span></h3>
                    </div>
                    <ul className="space-y-4 text-sm font-bold text-indigo-900/60 leading-relaxed">
                        <li className="flex items-start gap-4">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            User retention is up 12% following the deployment of the 'Simple English' narrative update.
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            Most active users (top 5%) access the platform between 10:00 AM and 2:00 PM EST.
                        </li>
                    </ul>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                         <div className="h-10 w-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                            <BarChart className="h-5 w-5" />
                         </div>
                         <h3 className="text-xl font-black tracking-tight text-orange-900 italic">Drop-off <span className="font-serif">Points</span></h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { step: 'Landing Page', rate: 100, color: 'bg-orange-500' },
                            { step: 'How It Works', rate: 72, color: 'bg-orange-400' },
                            { step: 'Login / Sign Up', rate: 45, color: 'bg-orange-300' },
                            { step: 'Successful Upload', rate: 38, color: 'bg-orange-200' },
                        ].map((funnel, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-orange-900/60">
                                    <span>{funnel.step}</span>
                                    <span>{funnel.rate}% Engagement</span>
                                </div>
                                <div className="h-2 w-full bg-white/40 rounded-full overflow-hidden">
                                    <motion.div 
                                        className={`h-full ${funnel.color}`} 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${funnel.rate}%` }}
                                        transition={{ duration: 1.5, delay: 1 + i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
