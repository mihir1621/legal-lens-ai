
import { Sparkles, FileText, Shield, AlertTriangle, CheckCircle, ClipboardList } from "lucide-react";

interface DocumentSkeletonProps {
    mode?: "analyzing" | "translating";
}

export const DocumentSkeleton = ({ mode = "translating" }: DocumentSkeletonProps) => {
    const isAnalyzing = mode === "analyzing";

    return (
        <div className="relative">
            {/* Floating AI Processing Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Sparkles className="h-10 w-10 text-primary animate-spin-slow relative z-10" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-pulse">
                            {isAnalyzing ? "Analyzing Document..." : "Translating..."}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                            {isAnalyzing ? "AI is reading your document" : "Using Google Gemini 2.0"}
                        </p>
                    </div>
                    {isAnalyzing && (
                        <div className="flex gap-1 mt-1">
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-full bg-primary"
                                    style={{ animation: `pulse-subtle 1.4s ease-in-out ${i * 0.2}s infinite` }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Shimmering Skeleton Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-40 select-none pointer-events-none filter blur-[2px] transition-all duration-500">
                {/* Summary Skeleton */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 rounded bg-primary/20" />
                        <div className="h-6 w-48 bg-muted/60 rounded" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-muted/60 rounded w-full" />
                        <div className="h-4 bg-muted/60 rounded w-[95%]" />
                        <div className="h-4 bg-muted/60 rounded w-[88%]" />
                        <div className="h-4 bg-muted/60 rounded w-[92%]" />
                    </div>
                </div>

                {/* What This Means Skeleton */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-emerald-200/30 bg-emerald-50/30 dark:bg-emerald-900/5 p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 rounded-full bg-emerald-300/40 dark:bg-emerald-700/30" />
                        <div className="h-6 w-40 bg-emerald-200/40 dark:bg-emerald-800/20 rounded" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="h-4 w-4 rounded-full bg-emerald-200/40 dark:bg-emerald-800/20 shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 bg-emerald-200/40 dark:bg-emerald-800/20 rounded w-full" />
                                    <div className="h-3.5 bg-emerald-200/30 dark:bg-emerald-800/15 rounded w-[75%]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Clauses Skeleton */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-5 w-5 rounded bg-primary/20" />
                        <div className="h-6 w-48 bg-muted/60 rounded" />
                    </div>
                    <div className="space-y-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2 pb-4 border-b last:border-0 border-border/30">
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-1/3 bg-muted/60 rounded" />
                                    <div className="h-5 w-20 bg-muted/40 rounded-full" />
                                </div>
                                <div className="h-3.5 w-full bg-muted/40 rounded" />
                                <div className="h-3.5 w-[80%] bg-muted/30 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Red Flags Skeleton */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-red-200/30 bg-red-50/30 dark:bg-red-900/5 p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/20 to-transparent -translate-x-full animate-[shimmer_2.2s_infinite]" />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 rounded bg-red-300/40 dark:bg-red-700/30" />
                        <div className="h-6 w-32 bg-red-200/40 dark:bg-red-800/20 rounded" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="rounded-lg border border-red-200/30 dark:border-red-800/20 bg-white/50 dark:bg-red-950/20 p-3 space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-3/4 bg-red-200/40 dark:bg-red-800/20 rounded" />
                                    <div className="h-4 w-12 bg-red-200/40 dark:bg-red-800/20 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents Required Skeleton */}
                <div className="col-span-full rounded-xl border border-blue-200/30 bg-blue-50/30 dark:bg-blue-900/5 p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-5 w-5 rounded bg-blue-300/40 dark:bg-blue-700/30" />
                        <div className="h-6 w-44 bg-blue-200/40 dark:bg-blue-800/20 rounded" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-xl border border-blue-200/30 dark:border-blue-800/20 bg-white/50 dark:bg-blue-950/20 p-4 space-y-3">
                                <div className="flex gap-2 items-start">
                                    <div className="h-6 w-6 rounded-full bg-blue-300/40 dark:bg-blue-700/30 shrink-0" />
                                    <div className="h-4 w-3/4 bg-blue-200/40 dark:bg-blue-800/20 rounded" />
                                </div>
                                <div className="h-3 w-full bg-blue-200/30 dark:bg-blue-800/15 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
