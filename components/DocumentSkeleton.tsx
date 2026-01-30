
import { Loader2, Sparkles } from "lucide-react";

export const DocumentSkeleton = () => (
    <div className="relative">
        {/* Floating AI Label - Adds a modern 'processing' touch */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-background/80 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl px-8 py-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Sparkles className="h-10 w-10 text-primary animate-spin-slow relative z-10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-pulse">
                        Translating...
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">Using Google Gemini 2.0</p>
                </div>
            </div>
        </div>

        {/* Shimmering Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-50 select-none pointer-events-none filter blur-[2px] transition-all duration-500">
            {/* Simple Summary Skeleton - Gradient Animation */}
            <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                <div className="h-7 w-48 bg-muted/60 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-4 bg-muted/60 rounded w-full" />
                    <div className="h-4 bg-muted/60 rounded w-[95%]" />
                    <div className="h-4 bg-muted/60 rounded w-[90%]" />
                </div>
            </div>

            {/* Actionable Points Skeleton */}
            <div className="col-span-full lg:col-span-1 rounded-xl border border-emerald-200/30 bg-emerald-50/30 dark:bg-emerald-900/5 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="h-7 w-40 bg-emerald-200/40 dark:bg-emerald-800/20 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-4 bg-emerald-200/40 dark:bg-emerald-800/20 rounded w-full" />
                    <div className="h-4 bg-emerald-200/40 dark:bg-emerald-800/20 rounded w-[90%]" />
                    <div className="h-4 bg-emerald-200/40 dark:bg-emerald-800/20 rounded w-[95%]" />
                </div>
            </div>

            {/* Key Clauses Skeleton */}
            <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
                <div className="h-7 w-48 bg-muted/60 rounded mb-4" />
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <div className="h-5 w-1/3 bg-muted/60 rounded" />
                                <div className="h-5 w-20 bg-muted/60 rounded" />
                            </div>
                            <div className="h-4 w-full bg-muted/40 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Red Flags Skeleton */}
            <div className="col-span-full lg:col-span-1 rounded-xl border border-red-200/30 bg-red-50/30 dark:bg-red-900/5 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/20 to-transparent -translate-x-full animate-[shimmer_2.2s_infinite]" />
                <div className="h-7 w-32 bg-red-200/40 dark:bg-red-800/20 rounded mb-4" />
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-red-200/40 dark:bg-red-800/20 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);
