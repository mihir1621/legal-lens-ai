'use client';

import { useEffect, useState, use, useRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Loader2, ArrowLeft, Languages, FileText } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
// import { translateText } from '@/app/actions'; // Replaced by full translation
import { translateAnalysisResult } from "@/app/translation-service";
import { DocumentSkeleton } from '@/components/DocumentSkeleton';
import MagicBento, { MagicCard } from '@/components/MagicBento';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [originalData, setOriginalData] = useState<any>(null); // English version from Firestore
    const [displayData, setDisplayData] = useState<any>(null);   // Data currently in view (translated or English)

    // UI labels for quadrants that update based on selected language
    const [labels, setLabels] = useState({
        legal_summary: "Legal Text Summarization",
        what_means: "What this means for you",
        key_clauses: "Key Clauses Breakdown",
        red_flags: "Red Flags",
        analysis_result: "Analysis Result",
        back_to_upload: "Back to Upload",
        legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice."
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    const [language, setLanguage] = useState('en');
    const [translatedSummary, setTranslatedSummary] = useState(''); // New state for pre-translated summary
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!id) return;
                const docRef = doc(db, "documents", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const docData = docSnap.data();

                    // Always treat as structured analysis
                    const data = docData.analysis || {
                        summary_simple: docData.originalText?.substring(0, 500) + "...",
                        what_it_means: ["Analysis in progress or simplified view."],
                        key_clauses: [],
                        red_flags: []
                    };

                    setOriginalData(data);
                    setDisplayData(data);

                    if (docData.translatedText) {
                        setTranslatedSummary(docData.translatedText);
                    }
                } else {
                    setError("Document not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load document");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    // Cache for translations: { [langCode]: { data, labels } }
    const [translationCache, setTranslationCache] = useState<Record<string, any>>({});

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Cooldown Timer Effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleLanguageChange = async (newLang: string) => {
        if (newLang === language) return;

        // Reset if switching back to English
        if (newLang === 'en') {
            setLanguage(newLang);
            setDisplayData(originalData);
            setLabels({
                legal_summary: "Legal Text Summarization",
                what_means: "What this means for you",
                key_clauses: "Key Clauses Breakdown",
                red_flags: "Red Flags",
                analysis_result: "Analysis Result",
                back_to_upload: "Back to Upload",
                legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice."
            });
            return;
        }

        // Check Cache first
        if (translationCache[newLang]) {
            setLanguage(newLang);
            setDisplayData(translationCache[newLang].data);
            setLabels(translationCache[newLang].labels);
            return;
        }

        // If Hindi and we have the summary, but need full translation
        if (newLang === 'hi') {
            setIsTranslating(true);
            try {
                const result = await translateAnalysisResult(originalData, "Hindi");
                if (result.data && result.labels) {
                    setLanguage(newLang);
                    setDisplayData(result.data);
                    setLabels(result.labels);
                    setTranslationCache(prev => ({
                        ...prev,
                        [newLang]: result
                    }));
                }
            } catch (error) {
                console.error("Full translation failed", error);
                // Fallback to English but update language label
                setLanguage(newLang);
            } finally {
                setIsTranslating(false);
            }
        } else {
            // For other languages not supported by the local model yet
            setLanguage(newLang);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading analysis...</p>
            </div>
        );
    }

    if (error || !displayData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Error</h1>
                <p className="text-muted-foreground mb-6">{error || "Data unavailable"}</p>
                <Link href="/upload">
                    <button className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90">
                        Go Back
                    </button>
                </Link>
            </div>
        );
    }

    const INDIAN_LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi (हिंदी)' },
        { code: 'mr', name: 'Marathi (मराठी)' },
        { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
        { code: 'ta', name: 'Tamil (தமிழ்)' },
        { code: 'te', name: 'Telugu (తెలుగు)' },
        { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ml', name: 'Malayalam (മലയാളം)' },
        { code: 'bn', name: 'Bengali (বাংলা)' },
        { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Area with Global Language Switcher */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link href="/upload" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {labels.back_to_upload}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold">{labels.analysis_result}</h1>
                        <div className="flex-1 overflow-hidden pointer-events-none relative h-7 bg-amber-50 dark:bg-amber-900/10 rounded-full border border-amber-200 dark:border-amber-900/50 flex items-center">
                            {/* Static Part: Icon and Warning Label */}
                            <div className="flex items-center gap-1.5 px-3 bg-amber-50/80 dark:bg-amber-950/80 border-r border-amber-200 dark:border-amber-900/50 h-full z-10">
                                <AlertTriangle className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                                <span className="text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400">Warning</span>
                            </div>

                            {/* Moving Part: The Text */}
                            <div
                                className="whitespace-nowrap flex-1"
                                style={{ animation: 'marquee-disclaimer 20s linear infinite' }}
                            >
                                <span className="text-[10px] md:text-xs font-semibold text-amber-700 dark:text-amber-400">
                                    “{labels.legal_disclaimer}”
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">ID: {id}</p>
                </div>

                {/* Custom Animated Language Shifter (Clean version - no card glow) */}
                <div className="relative">
                    <button
                        onClick={() => !isTranslating && cooldown === 0 && setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isTranslating || cooldown > 0}
                        className={`flex items-center gap-2 bg-secondary/20 p-2 rounded-lg border border-border/50 transition-colors duration-200 hover:bg-secondary/30 ${isTranslating || cooldown > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <Languages className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ${isTranslating ? 'animate-bounce text-primary' : ''}`} />
                        <span className="text-sm font-medium text-foreground min-w-[100px] text-left">
                            {INDIAN_LANGUAGES.find(l => l.code === language)?.name}
                        </span>
                        <svg
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 20 20" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                        </svg>

                        {isTranslating && <Loader2 className="h-4 w-4 animate-spin text-primary ml-1" />}
                        {cooldown > 0 && <span className="text-xs text-orange-500 font-bold ml-1 animate-pulse">{cooldown}s</span>}
                    </button>

                    <div
                        className={`absolute right-0 mt-2 w-full rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden transition-all duration-300 origin-top ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                    >
                        <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {INDIAN_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        handleLanguageChange(lang.code);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-all duration-200 hover:bg-primary/10 hover:scale-[1.02] hover:pl-6 ${language === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-foreground'}`}
                                >
                                    {lang.name}
                                    {language === lang.code && <CheckCircle className="h-4 w-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Background Overlay to close dropdown */}
                {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />}
            </div>

            {/* Content Grid */}
            {isTranslating ? (
                <DocumentSkeleton />
            ) : (
                <MagicBento className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Simple Summary */}
                    <MagicCard enableTilt={false} className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Info className="text-primary h-5 w-5" />
                                {labels.legal_summary}
                            </h2>
                        </div>

                        <div className="text-lg leading-relaxed text-card-foreground/90 min-h-[100px]">
                            {displayData.summary_simple}
                        </div>
                    </MagicCard>

                    {/* Actionable Points - SWAPPED to Position 2 (formerly Red Flags) */}
                    <MagicCard enableTilt={false} className="col-span-full lg:col-span-1 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="h-5 w-5" />
                            {labels.what_means}
                        </h2>
                        <ul className="space-y-3">
                            {displayData.what_it_means && displayData.what_it_means.map((point: string, i: number) => (
                                <li key={i} className="flex gap-3 text-sm">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </MagicCard>

                    {/* Key Clauses - Remains Position 3 */}
                    <MagicCard enableTilt={false} className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="text-primary h-5 w-5" />
                            {labels.key_clauses}
                        </h2>
                        <div className="space-y-4">
                            {displayData.key_clauses && displayData.key_clauses.map((clause: any, i: number) => (
                                <div key={i} className="border-b last:border-0 border-border/50 pb-4 last:pb-0">
                                    <div className="flex justify-between mb-1 items-center">
                                        <h3 className="font-medium text-card-foreground">{clause.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ml-2 ${(clause.risk || 'low').toLowerCase() === 'high' ? 'bg-destructive/10 text-destructive' :
                                            (clause.risk || 'low').toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-green-500/10 text-green-600'
                                            }`}>
                                            {clause.risk || 'Low'} Risk
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{clause.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </MagicCard>

                    {/* Red Flags - SWAPPED to Position 4 (formerly Actionable Points) */}
                    <MagicCard enableTilt={false} className="col-span-full lg:col-span-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            {labels.red_flags}
                        </h2>
                        <div className="space-y-4">
                            {displayData.red_flags && displayData.red_flags.length > 0 ? (
                                displayData.red_flags.map((flag: any, i: number) => (
                                    <div key={i} className="p-3 bg-white dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-red-900 dark:text-red-200 text-sm">
                                                {/* Show 'reason' (Explanation) as main title if in English to avoid Marathi quotes */}
                                                {language === 'en' ? flag.reason : (flag.text || flag.reason)}
                                            </span>
                                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ml-2 flex-shrink-0">
                                                {flag.severity}
                                            </span>
                                        </div>

                                        {/* Show 'text' (Quote) as secondary detail ONLY if not in English (or if we want to show original quote) */}
                                        {language !== 'en' && (
                                            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1 italic">
                                                "{flag.reason}"
                                            </p>
                                        )}

                                        {/* If entirely in English usage, we might want to hide the raw quote 'flag.text' if it's just a duplicate or foreign text. 
                                            User asked to "remove it" if it's Marathi. 
                                            So we swap: Main = Reason. Secondary = Text (only if not English mode where translation aligns).
                                        */}
                                        {language === 'en' && (
                                            <div className="hidden"></div> // completely hide the marathi quote
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-red-600/60 italic">No major red flags detected.</p>
                            )}
                        </div>
                    </MagicCard>
                </MagicBento>
            )}
        </div>
    );
}
