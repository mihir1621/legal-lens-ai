'use client';

import { motion } from 'framer-motion';
import { 
    Calendar, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    Globe, 
    Users, 
    Zap, 
    Clock,
    Search,
    BarChart3
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
    BarChart,
    Bar,
    Cell
} from 'recharts';

const GROWTH_DATA = [
    { month: 'Jan', current: 240, previous: 200 },
    { month: 'Feb', current: 300, previous: 250 },
    { month: 'Mar', current: 480, previous: 320 },
    { month: 'Apr', current: 600, previous: 380 },
    { month: 'May', current: 850, previous: 450 },
    { month: 'Jun', current: 1284, previous: 500 },
];

const ANALYSES_TYPES = [
    { name: 'Lease Agreement', value: 45 },
    { name: 'Service Contract', value: 25 },
    { name: 'SaaS Terms', value: 20 },
    { name: 'NDA', value: 10 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 italic font-serif">Platform <span className="text-primary not-italic font-sans">Growth</span></h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-xs">Deep performance analysis and engagement trends.</p>
                </div>
                <div className="flex bg-card border border-border/40 p-1 rounded-2xl">
                    {['D', 'W', 'M', 'Y'].map((t) => (
                        <button key={t} className={`px-4 py-2 text-[11px] font-black rounded-xl transition-all ${t === 'M' ? 'bg-primary text-white shadow-xl' : 'text-muted-foreground hover:text-foreground'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Growth Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card p-12 rounded-[3.5rem] border border-border/40 shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <TrendingUp className="h-64 w-64 text-primary" />
                </div>
                
                <div className="mb-12 flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Active Reach</h3>
                        <p className="text-sm text-muted-foreground font-medium italic">Unique users interacting with LegalLens monthly.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black tracking-tighter text-emerald-500 flex items-center justify-end gap-2">
                             +156% <TrendingUp className="h-8 w-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Year-over-year growth</p>
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={GROWTH_DATA}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} 
                                dy={15}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '2rem', 
                                    background: '#0a0a0a',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: 900,
                                    padding: '20px'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="current" 
                                stroke="#f97316" 
                                strokeWidth={6} 
                                fillOpacity={1} 
                                fill="url(#colorCurrent)" 
                                animationDuration={2000}
                            />
                             <Line 
                                type="monotone" 
                                dataKey="previous" 
                                stroke="#94a3b8" 
                                strokeWidth={2} 
                                strokeDasharray="8 8" 
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Secondary Charts / Widgets */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Document Type Distribution */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card p-10 rounded-[3rem] border border-border/40 shadow-sm"
                >
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                             <h3 className="text-xl font-black tracking-tight">Intelligence <span className="text-primary italic font-serif">Focus</span></h3>
                             <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Analysis distribution by doc type</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Search className="h-6 w-6" />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {ANALYSES_TYPES.map((type, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-black text-muted-foreground">{type.name}</span>
                                    <span className="text-xs font-black text-primary">{type.value}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${type.value}%` }}
                                        transition={{ duration: 1.5, delay: 0.4 + i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Engagement Heatmap / Simple Metrics */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid gap-6 sm:grid-cols-2"
                >
                    {[
                        { label: 'Yearly Reach', value: '45.2K', desc: 'Unique IPs engaged', icon: Globe, color: 'indigo' },
                        { label: 'Avg Session', value: '12m 45s', desc: 'Engagement duration', icon: Clock, color: 'blue' },
                        { label: 'Power Users', value: '142', desc: '5+ analyses/month', icon: Zap, color: 'amber' },
                        { label: 'Conversion', value: '3.4%', desc: 'Sign-up success rate', icon: TrendingUp, color: 'emerald' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col items-center text-center justify-center space-y-4">
                            <div className={`h-14 w-14 rounded-[1.2rem] bg-${stat.color}-500/10 text-${stat.color}-500 flex items-center justify-center`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">{stat.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
