'use client';

import { useEffect, useState, use, useRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Loader2, ArrowLeft, Languages, FileText } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
// import { translateText } from '@/app/actions'; // Replaced by full translation
import { translateAnalaysisResult } from '@/app/actions';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [originalData, setOriginalData] = useState<any>(null); // Store original (English)
    const [displayData, setDisplayData] = useState<any>(null);   // Store currently displayed (translated or original)

    // UI Labels State
    const [labels, setLabels] = useState({
        simple_explanation: "Simple Explanation",
        what_means: "What this means for you",
        key_clauses: "Key Clauses Breakdown",
        red_flags: "Red Flags",
        analysis_result: "Analysis Result",
        back_to_upload: "Back to Upload"
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Language State
    const [language, setLanguage] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);

    // Rate Limiting / Cooldown
    const [cooldown, setCooldown] = useState(0);
    const lastRequestTime = useRef<number>(0);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!id) return;
                const docRef = doc(db, "documents", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const docData = docSnap.data();
                    setOriginalData(docData.analysis);
                    setDisplayData(docData.analysis); // Default to original
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

    // Cooldown Timer Effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleLanguageChange = async (newLang: string) => {
        if (newLang === language) return;

        // Prevent rapid clicks (Cooldown check)
        const now = Date.now();
        if (now - lastRequestTime.current < 2000) {
            // Too fast, ignore or show brief toast
            return;
        }

        // If cooldown active from previous 429
        if (cooldown > 0) {
            alert(`Please wait ${cooldown}s before translating again.`);
            return;
        }

        setLanguage(newLang);

        if (!originalData) return;

        // Check cache first
        if (translationCache[newLang]) {
            setDisplayData(translationCache[newLang].data);
            setLabels(translationCache[newLang].labels);
            return;
        }

        lastRequestTime.current = Date.now();
        setIsTranslating(true);

        try {
            // Translate the entire object at once
            const targetLangName = INDIAN_LANGUAGES.find(l => l.code === newLang)?.name || 'English';
            const translatedResponse = await translateAnalaysisResult(originalData, targetLangName);

            if (translatedResponse.data && translatedResponse.labels) {
                // Update State and Cache
                setDisplayData(translatedResponse.data);
                setLabels(translatedResponse.labels);
                setTranslationCache(prev => ({
                    ...prev,
                    [newLang]: { data: translatedResponse.data, labels: translatedResponse.labels }
                }));
            } else {
                // Fallback if structure mismatch
                setDisplayData(translatedResponse);
            }

        } catch (error) {
            console.error("Translation failed", error);

            // Revert to English/Original on failure
            setDisplayData(originalData);
            setLabels({
                simple_explanation: "Simple Explanation",
                what_means: "What this means for you",
                key_clauses: "Key Clauses Breakdown",
                red_flags: "Red Flags",
                analysis_result: "Analysis Result",
                back_to_upload: "Back to Upload"
            });
            setLanguage('en'); // Reset dropdown to English

            // Check if it's our cleaned up 429 error
            const errString = String(error);
            if (errString.includes("busy") || errString.includes("Rate Limit")) {
                setCooldown(10); // Enforce 10s cooldown
                alert("Translation service is busy. Please wait 10 seconds.");
            } else {
                alert("Translation failed. displaying original text.");
            }

        } finally {
            setIsTranslating(false);
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
                    <h1 className="text-3xl font-bold mb-2">{labels.analysis_result}</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">ID: {id}</p>
                </div>

                {/* Global Language Switcher - Upper Right Corner */}
                <div className="flex items-center gap-2 bg-secondary/20 p-2 rounded-lg border border-border/50">
                    <Languages className="h-5 w-5 text-muted-foreground" />
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={isTranslating || cooldown > 0}
                        className={`bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-8 appearance-none text-foreground min-w-[120px] ${isTranslating || cooldown > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundRepeat: `no-repeat`,
                            backgroundSize: `1.5em 1.5em`
                        }}
                    >
                        {INDIAN_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code} className="bg-white text-black dark:bg-gray-900 dark:text-white">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                    {isTranslating && <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />}
                    {cooldown > 0 && <span className="text-xs text-orange-500 font-bold ml-1">{cooldown}s</span>}
                </div>
            </div>

            {/* Content Grid */}
            <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${isTranslating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Simple Summary */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Info className="text-primary h-5 w-5" />
                            {labels.simple_explanation}
                        </h2>
                    </div>

                    <div className="text-lg leading-relaxed text-card-foreground/90 min-h-[100px]">
                        {displayData.summary_simple}
                    </div>
                </div>

                {/* Actionable Points - SWAPPED to Position 2 (formerly Red Flags) */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 p-6 shadow-sm">
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
                </div>

                {/* Key Clauses - Remains Position 3 */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
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
                </div>

                {/* Red Flags - SWAPPED to Position 4 (formerly Actionable Points) */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 shadow-sm">
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
                </div>
            </div>
        </div>
    );
}
