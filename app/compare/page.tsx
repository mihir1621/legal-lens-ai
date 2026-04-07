'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Scale, 
    FileText, 
    Zap, 
    AlertCircle, 
    RefreshCcw, 
    ChevronRight, 
    CheckCircle2, 
    Info, 
    CornerDownRight, 
    ArrowLeftRight,
    Gavel
} from 'lucide-react';
import { compareLegalDocs } from '@/lib/compare';
import Navbar from '@/components/Navbar';

// --- TYPES ---
interface ComparisonResult {
    case1_summary: string;
    case2_summary: string;
    similarities: string[];
    differences: string[];
    final_verdict: string;
}

const STORAGE_KEY = 'legallens_last_comparison';

const SAMPLES = [
    {
        title: "Employment vs. Independent Contractor",
        case1: "A full-time software developer at a large tech firm. They have set hours, use company equipment, have health benefits, and are directed by a manager on daily tasks. The contract mentions 'employment at will' and non-compete clauses.",
        case2: "A freelance web designer working on a project basis. They use their own laptop, set their own schedule, invoice monthly, and work for multiple clients simultaneously. The contract is titled 'Services Agreement' and specifies a fixed project fee."
    },
    {
        title: "NDA vs. Mutual Confidentiality",
        case1: "Standard unilateral Non-Disclosure Agreement (NDA) where a startup shares its source code with a potential investor. The investor is strictly prohibited from using or disclosing the information for 5 years. There are no reciprocal obligations for the startup.",
        case2: "Mutual Confidentiality Agreement between two companies exploring a merger. Both parties agree to protect each other's trade secrets and financial data. The agreement includes 'standard of care' clauses and exceptions for publicly known info."
    }
];

export default function ComparePage() {
    // --- STATE ---
    const [case1, setCase1] = useState('');
    const [case2, setCase2] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ComparisonResult | null>(null);

    // --- PERSISTENCE ---
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCase1(parsed.case1 || '');
                setCase2(parsed.case2 || '');
                setResult(parsed.result || null);
            } catch (e) {
                console.warn("Failed to load saved comparison.");
            }
        }
    }, []);

    const saveToStorage = useCallback((c1: string, c2: string, res: ComparisonResult | null) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ case1: c1, case2: c2, result: res }));
    }, []);

    // --- HANDLERS ---
    const handleCompare = async () => {
        if (!case1.trim() || !case2.trim()) {
            setError("Please fill in both cases to begin comparison.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        // AbortController for timeout (10s as requested)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for safety over 10s

        try {
            const response = await compareLegalDocs(case1, case2);

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.result) {
                throw new Error("Invalid AI response format received.");
            }

            const validResult = response.result as ComparisonResult;
            setResult(validResult);
            saveToStorage(case1, case2, validResult);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError("Analysis timed out. Try shorter fragments or check your connection.");
            } else {
                setError(err.message || "An unexpected error occurred during analysis.");
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const loadSample = (index: number) => {
        setCase1(SAMPLES[index].case1);
        setCase2(SAMPLES[index].case2);
        setError(null);
    };

    const handleReset = () => {
        setCase1('');
        setCase2('');
        setResult(null);
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const canSubmit = case1.trim() && case2.trim() && !loading;

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            
            <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4"
                    >
                        <Scale className="w-3 h-3" />
                        AI-Powered Legal Comparison
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent"
                    >
                        Case Comparison Engine
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Instantly contrast two legal scenarios, documents, or clauses to identify risks, similarities, and final verdicts using our high-accuracy AI.
                    </p>
                </div>

                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Input Case 1 */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 pb-3 flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">1</div>
                                Case / Document 1
                            </h3>
                        </div>
                        <div className="p-6 pt-0">
                            <textarea 
                                placeholder="Paste your first legal text, clause, or case summary here..."
                                className="w-full min-h-[220px] bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-300 resize-none outline-none transition-all"
                                value={case1}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCase1(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Input Case 2 */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 pb-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">2</div>
                                Case / Document 2
                            </h3>
                        </div>
                        <div className="p-6 pt-0">
                            <textarea 
                                placeholder="Paste your second legal text, clause, or case summary here..."
                                className="w-full min-h-[220px] bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-300 resize-none outline-none transition-all"
                                value={case2}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCase2(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111] border border-white/5 mb-12">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 mr-2">Try Sample:</span>
                        {SAMPLES.map((_, i) => (
                            <button 
                                key={i}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-gray-300 transition-colors disabled:opacity-50"
                                onClick={() => loadSample(i)}
                                disabled={loading}
                            >
                                Sample {i+1}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                            onClick={handleReset}
                            disabled={loading || (!case1 && !case2)}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button 
                            onClick={handleCompare}
                            disabled={!canSubmit}
                            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                                canSubmit 
                                ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white' 
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Compare Now
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- UI STATES: Error/Result --- */}
                <AnimatePresence mode="wait">
                    {/* Error State */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-8"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-500">Analysis Error</h3>
                                <p className="text-sm text-red-400/80">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!result && !loading && !error && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl"
                        >
                            <Scale className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h2 className="text-xl font-medium text-gray-500">Enter cases to begin comparison</h2>
                            <p className="text-sm text-gray-600 mt-2">Upload or paste two legal items to see similarities and differences.</p>
                        </motion.div>
                    )}

                    {/* Results State */}
                    {result && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Summaries Side-by-Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-900/10 to-transparent border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-6 pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Case 1 Summary
                                        </h3>
                                    </div>
                                    <div className="p-6 text-gray-300 text-sm leading-relaxed">
                                        {result.case1_summary}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-900/10 to-transparent border border-white/10 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-6 pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Case 2 Summary
                                        </h3>
                                    </div>
                                    <div className="p-6 text-gray-300 text-sm leading-relaxed">
                                        {result.case2_summary}
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Similarities */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 px-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        Key Similarities
                                    </h3>
                                    <div className="space-y-2">
                                        {result.similarities?.map((item, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm flex gap-3 text-gray-300"
                                            >
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                {item}
                                            </motion.div>
                                        )) || <p className="text-gray-600 italic px-2">No direct similarities detected.</p>}
                                    </div>
                                </div>

                                {/* Differences */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 px-2">
                                        <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                                        Critical Differences
                                    </h3>
                                    <div className="space-y-2">
                                        {result.differences?.map((item, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm flex gap-3 text-gray-300"
                                            >
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                {item}
                                            </motion.div>
                                        )) || <p className="text-gray-600 italic px-2">No major differences detected.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Verdict */}
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                                <div className="p-6 bg-white/5 border-b border-white/5">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                        <Gavel className="w-6 h-6 text-blue-500" />
                                        Final Verdict & Strategic Resolution
                                    </h3>
                                </div>
                                <div className="p-8">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <p className="text-lg text-gray-200 leading-relaxed font-medium italic">
                                            "{result.final_verdict}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* New Comparison Action */}
                            <div className="text-center pt-8">
                                <button 
                                    onClick={handleReset}
                                    className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 transition-colors"
                                >
                                    Start New Comparison
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
