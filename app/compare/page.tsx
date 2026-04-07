'use client';

import { useState, useCallback } from 'react';
import { Scale, Plus, ArrowRight, ShieldCheck, FileText, Loader2, Search, Zap, X, Upload, AlertTriangle, CheckCircle2, ArrowLeftRight, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromFile } from '@/app/actions';

type ComparisonResult = {
    summary: string;
    total_changes: number;
    risk_change: string;
    changes: Array<{
        clause: string;
        type: string;
        original: string;
        revised: string;
        impact: string;
        severity: string;
    }>;
    risk_analysis: {
        original_risk: string;
        revised_risk: string;
        details: string[];
    };
    recommendations: string[];
};

type ProcessingStep = 'idle' | 'extracting' | 'comparing' | 'done';

function FileDropZone({
    label,
    sublabel,
    file,
    onFile,
    disabled,
    accentColor = 'primary'
}: {
    label: string;
    sublabel: string;
    file: File | null;
    onFile: (f: File) => void;
    disabled: boolean;
    accentColor?: string;
}) {
    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) {
            if (accepted[0].size > 4 * 1024 * 1024) {
                alert("File too large. Max 4MB.");
                return;
            }
            onFile(accepted[0]);
        }
    }, [onFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxFiles: 1,
        disabled
    });

    return (
        <motion.div
            {...(getRootProps() as any)}
            whileHover={disabled ? {} : { y: -4, scale: 1.01 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            className={`relative group border-2 border-dashed rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] cursor-pointer overflow-hidden transition-all duration-300
                ${isDragActive ? 'border-primary bg-primary/10' : file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border hover:border-primary/40 bg-card/60 backdrop-blur-sm'}
                ${disabled ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <input {...getInputProps()} />
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-4">
                {file ? (
                    <>
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-base font-bold text-emerald-600 mb-1">File Ready</h3>
                            <p className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 border border-border/40">
                            <Upload className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{label}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{sublabel}</p>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                <Plus className="h-4 w-4" /> Select or Drop File
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground border border-border/40 uppercase tracking-wider">PDF</span>
                            <span className="px-2 py-0.5 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground border border-border/40 uppercase tracking-wider">DOCX</span>
                            <span className="px-2 py-0.5 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground border border-border/40 uppercase tracking-wider">TXT</span>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

function SeverityBadge({ severity }: { severity: string }) {
    const s = severity.toLowerCase();
    const colors = s === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
        s === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors}`}>
            {severity}
        </span>
    );
}

function ChangeTypeBadge({ type }: { type: string }) {
    const t = type.toLowerCase();
    const colors = t === 'added' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
        t === 'removed' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
            'bg-blue-500/10 text-blue-600 border-blue-500/20';
    const Icon = t === 'added' ? Plus : t === 'removed' ? X : ArrowLeftRight;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors}`}>
            <Icon className="h-3 w-3" />
            {type}
        </span>
    );
}

export default function ComparePage() {
    const [fileA, setFileA] = useState<File | null>(null);
    const [fileB, setFileB] = useState<File | null>(null);
    const [step, setStep] = useState<ProcessingStep>('idle');
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedChange, setExpandedChange] = useState<number | null>(null);

    const isProcessing = step !== 'idle' && step !== 'done';

    const handleCompare = async () => {
        if (!fileA || !fileB) return;
        setError(null);
        setResult(null);
        setStep('extracting');

        try {
            // Step 1: Extract text from both documents in parallel
            const formDataA = new FormData();
            formDataA.append('file', fileA);
            const formDataB = new FormData();
            formDataB.append('file', fileB);

            const [extractA, extractB] = await Promise.all([
                extractTextFromFile(formDataA),
                extractTextFromFile(formDataB)
            ]);

            if (extractA.error || !extractA.text) {
                throw new Error(`Failed to read "${fileA.name}": ${extractA.error || 'Empty document'}`);
            }
            if (extractB.error || !extractB.text) {
                throw new Error(`Failed to read "${fileB.name}": ${extractB.error || 'Empty document'}`);
            }

            // Vision mode documents can't be compared via text
            if (extractA.text.startsWith('IMAGE_DATA:') || extractB.text.startsWith('IMAGE_DATA:')) {
                throw new Error("Scanned/image documents cannot be compared yet. Please upload text-based PDFs or DOCX files.");
            }

            setStep('comparing');

            // Step 2: Send to comparison API
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    textA: extractA.text,
                    textB: extractB.text,
                    fileNameA: fileA.name,
                    fileNameB: fileB.name
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.result) {
                throw new Error("Invalid comparison response.");
            }

            setResult(data.result);
            setStep('done');

        } catch (err: any) {
            console.error("[Compare] Error:", err);
            setError(err.message || "Comparison failed. Please try again.");
            setStep('idle');
        }
    };

    const handleReset = () => {
        setFileA(null);
        setFileB(null);
        setResult(null);
        setError(null);
        setStep('idle');
        setExpandedChange(null);
    };

    const RiskIcon = result?.risk_change === 'Increased' ? ArrowUpRight : result?.risk_change === 'Decreased' ? ArrowDownRight : Minus;
    const riskColor = result?.risk_change === 'Increased' ? 'text-red-500' : result?.risk_change === 'Decreased' ? 'text-emerald-500' : 'text-muted-foreground';

    return (
        <motion.div
            className="container mx-auto px-4 py-12 md:py-16 max-w-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <motion.div
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-6"
                    whileHover={{ scale: 1.05 }}
                >
                    <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                    Document Comparison
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">
                    Compare Contracts <span className="text-primary italic font-serif">Side-by-Side</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Upload two versions of a contract to instantly identify differences in clauses, risk profiles, and financial terms.
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* ===== RESULTS VIEW ===== */}
                {step === 'done' && result ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Changes</span>
                                </div>
                                <p className="text-4xl font-black text-foreground">{result.total_changes}</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${result.risk_change === 'Increased' ? 'bg-red-500/10' : result.risk_change === 'Decreased' ? 'bg-emerald-500/10' : 'bg-muted/30'}`}>
                                        <RiskIcon className={`h-5 w-5 ${riskColor}`} />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Risk Change</span>
                                </div>
                                <p className={`text-2xl font-black ${riskColor}`}>{result.risk_change}</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Risk Level</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold">{result.risk_analysis.original_risk}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className={`text-sm font-bold ${result.risk_analysis.revised_risk === 'High' ? 'text-red-500' : result.risk_analysis.revised_risk === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {result.risk_analysis.revised_risk}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Summary */}
                        <div className="p-8 rounded-3xl bg-card border border-border/40">
                            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                Comparison Summary
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Detailed Changes */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <ArrowLeftRight className="h-5 w-5 text-primary" />
                                Detailed Changes ({result.changes.length})
                            </h3>

                            {result.changes.map((change, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-2xl border border-border/40 bg-card overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedChange(expandedChange === i ? null : i)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <ChangeTypeBadge type={change.type} />
                                            <span className="font-bold text-foreground">{change.clause}</span>
                                            <SeverityBadge severity={change.severity} />
                                        </div>
                                        {expandedChange === i ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedChange === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {change.type.toLowerCase() !== 'added' && (
                                                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Original</p>
                                                                <p className="text-sm text-foreground/80 leading-relaxed italic">"{change.original}"</p>
                                                            </div>
                                                        )}
                                                        {change.type.toLowerCase() !== 'removed' && (
                                                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Revised</p>
                                                                <p className="text-sm text-foreground/80 leading-relaxed italic">"{change.revised}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Legal Impact</p>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{change.impact}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Risk Analysis Details */}
                        {result.risk_analysis.details.length > 0 && (
                            <div className="p-8 rounded-3xl bg-card border border-border/40 space-y-4">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Risk Analysis
                                </h3>
                                <ul className="space-y-2">
                                    {result.risk_analysis.details.map((detail, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommendations */}
                        {result.recommendations.length > 0 && (
                            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                                <h3 className="text-lg font-black flex items-center gap-2 text-primary">
                                    <Zap className="h-5 w-5" />
                                    Recommendations
                                </h3>
                                <ul className="space-y-3">
                                    {result.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black shrink-0 mt-0.5">{i + 1}</span>
                                            <span className="text-sm text-foreground leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Reset Button */}
                        <div className="flex justify-center pt-4">
                            <motion.button
                                onClick={handleReset}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-full px-10 py-3.5 text-base font-bold bg-primary text-white shadow-xl shadow-primary/25 transition-all"
                            >
                                Compare Another Pair
                            </motion.button>
                        </div>
                    </motion.div>

                ) : (
                    /* ===== UPLOAD VIEW ===== */
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                            >
                                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-600">Comparison Failed</p>
                                    <p className="text-sm text-red-500/80 mt-1">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="ml-auto">
                                    <X className="h-4 w-4 text-red-500/60 hover:text-red-500" />
                                </button>
                            </motion.div>
                        )}

                        {/* Upload Cards */}
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative px-4">
                            {/* VS Badge */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background border-4 border-border items-center justify-center font-black text-primary shadow-lg">
                                VS
                            </div>

                            <FileDropZone
                                label="Original Contract"
                                sublabel="Base version for comparison"
                                file={fileA}
                                onFile={setFileA}
                                disabled={isProcessing}
                            />
                            <FileDropZone
                                label="Revised Version"
                                sublabel="Modified or updated version"
                                file={fileB}
                                onFile={setFileB}
                                disabled={isProcessing}
                            />
                        </div>

                        {/* Processing State */}
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-xl mx-auto"
                            >
                                <div className="p-6 rounded-3xl bg-card border border-border/40 flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-foreground">
                                            {step === 'extracting' ? 'Reading Documents...' : 'AI Comparison Running...'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {step === 'extracting' ? 'Extracting text from both files simultaneously.' : 'Analyzing clause differences, risk variance, and legal impact.'}
                                        </p>
                                        <div className="flex gap-1.5 mt-3">
                                            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'extracting' ? 'bg-primary w-12' : 'bg-emerald-500 w-8'}`} />
                                            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'comparing' ? 'bg-primary w-12' : 'bg-muted/20 w-8'}`} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Compare Button */}
                        <div className="flex justify-center">
                            <motion.button
                                onClick={handleCompare}
                                disabled={!fileA || !fileB || isProcessing}
                                whileHover={fileA && fileB && !isProcessing ? { scale: 1.05, boxShadow: "0 10px 30px rgba(249,115,22,0.4)" } : {}}
                                whileTap={fileA && fileB && !isProcessing ? { scale: 0.95 } : {}}
                                className="rounded-full px-12 py-4 text-base font-black bg-gradient-to-r from-primary to-orange-500 text-white shadow-2xl shadow-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 border border-white/20"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ArrowLeftRight className="h-5 w-5" />
                                )}
                                <span className="uppercase tracking-[0.15em] text-sm">
                                    {isProcessing ? 'Comparing...' : 'Compare Documents'}
                                </span>
                            </motion.button>
                        </div>

                        {/* Feature Cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            {[
                                { icon: ShieldCheck, title: "Difference Detection", desc: "AI highlights which clauses were added, removed, or modified." },
                                { icon: Scale, title: "Risk Variance", desc: "See how the risk profile changed between different versions." },
                                { icon: ArrowRight, title: "Summary of Changes", desc: "Get a clear breakdown of every term change and its legal impact." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300"
                                    whileHover={{ y: -5 }}
                                >
                                    <item.icon className="h-8 w-8 text-primary mb-4 transition-transform group-hover:scale-110" />
                                    <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
