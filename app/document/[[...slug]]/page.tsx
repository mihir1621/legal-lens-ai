'use client';

import { useEffect, useState, use, useRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Loader2, ArrowLeft, Languages, FileText, ClipboardList, BookOpen, Download, Share2, Copy, Link as LinkIcon, Image as ImageIcon, Check, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { translateAnalysisResult } from "@/app/translation-service";
import { DocumentSkeleton } from '@/components/DocumentSkeleton';
import MagicBento, { MagicCard } from '@/components/MagicBento';
import FeedbackSystem from '@/components/FeedbackSystem';


export default function DocumentPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug || [];

    // Extract ID from slug (first element)
    const id = slug[0];

    const [originalData, setOriginalData] = useState<any>(null);
    const [displayData, setDisplayData] = useState<any>(null);

    const [labels, setLabels] = useState<Record<string, string>>({
        legal_summary: "Legal Text Summarization",
        what_means: "What this means for you",
        key_clauses: "Key Clauses Breakdown",
        red_flags: "Red Flags",
        analysis_result: "Analysis Result",
        back_to_upload: "Back to Upload",
        legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice.",
        docs_required: "Documents Required"
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [docName, setDocName] = useState('Document');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied_link' | 'copied_text'>('idle');
    const [cooldown, setCooldown] = useState(0);
    const [translationCache, setTranslationCache] = useState<Record<string, any>>({});

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                if (!id) {
                    setError("No document ID provided");
                    return;
                }

                if (id === 'temp') {
                    const tempData = localStorage.getItem("temp_analysis");
                    if (tempData) {
                        const parsed = JSON.parse(tempData);
                        setOriginalData(parsed);
                        setDisplayData(parsed);
                        setDocName("Guest Analysis");
                        setLoading(false);
                        return;
                    } else {
                        setError("Temporary analysis not found");
                        setLoading(false);
                        return;
                    }
                }

                const docRef = doc(db, "documents", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const docData = docSnap.data();
                    setDocName(docData.title || "Document");
                    const data = docData.analysis || {
                        summary_simple: docData.originalText?.substring(0, 500) + "...",
                        what_it_means: ["Analysis in progress or simplified view."],
                        key_clauses: [],
                        red_flags: []
                    };
                    setOriginalData(data);
                    setDisplayData(data);
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

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        if (docName && docName !== 'Document') {
            document.title = `${docName} - LegalLens Analysis`;
        }
    }, [docName]);

    const handleLanguageChange = async (newLang: string) => {
        if (newLang === language) return;

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
                legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice.",
                docs_required: "Documents Required"
            });
            return;
        }

        if (translationCache[newLang]) {
            setLanguage(newLang);
            setDisplayData(translationCache[newLang].data);
            setLabels(translationCache[newLang].labels);
            return;
        }

        setIsTranslating(true);
        try {
            const result = await translateAnalysisResult(originalData, newLang);
            if (result.data && result.labels) {
                setLanguage(newLang);
                setDisplayData(result.data);
                setLabels(result.labels);
                setTranslationCache(prev => ({ ...prev, [newLang]: result }));
            }
        } catch (error) {
            console.error("Translation failed:", error);
            setLanguage(newLang);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);
        setIsShareDropdownOpen(false);

        const element = contentRef.current;
        element.classList.add('is-exporting');
        element.classList.add('dark');

        try {
            const { domToPng } = await import('modern-screenshot');
            const jsPDF = (await import('jspdf')).jsPDF;

            const dataUrl = await domToPng(element, {
                backgroundColor: '#000000',
                scale: 2,
                quality: 1
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const imgRatio = img.height / img.width;
            const targetWidth = pdfWidth;
            const targetHeight = targetWidth * imgRatio;

            let heightLeft = targetHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, targetHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - targetHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, targetHeight);
                heightLeft -= pdfHeight;
            }

            const finalPdfName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName}.pdf`;
            pdf.save(finalPdfName);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            element.classList.remove('is-exporting');
            element.classList.remove('dark');
            setIsDownloading(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!contentRef.current) return;
        setIsDownloading(true);
        setIsShareDropdownOpen(false);

        const element = contentRef.current;
        element.classList.add('is-exporting');
        element.classList.add('dark');

        try {
            const { domToPng } = await import('modern-screenshot');
            const dataUrl = await domToPng(element, {
                backgroundColor: '#000000',
                scale: 2,
                quality: 1
            });

            const link = document.createElement('a');
            const baseName = docName.includes('.') ? docName.split('.').slice(0, -1).join('.') : docName;
            link.download = `${baseName}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Image Generation Error:", err);
            alert("Failed to generate image.");
        } finally {
            element.classList.remove('is-exporting');
            element.classList.remove('dark');
            setIsDownloading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopyStatus('copied_link');
            setTimeout(() => setCopyStatus('idle'), 2000);
            setIsShareDropdownOpen(false);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleCopyText = async () => {
        try {
            let text = `==================================================\n`;
            text += `⚠️  IMPORTANT LEGAL WARNING  ⚠️\n`;
            text += `==================================================\n`;
            text += `${labels.legal_disclaimer}\n`;
            text += `==================================================\n\n`;

            text += `⚖️ LEGAL LENS AI - ANALYSIS REPORT\n`;
            text += `Document: ${docName}\n`;
            text += `Generated on: ${new Date().toLocaleDateString()}\n`;
            text += `--------------------------------------------------\n\n`;

            text += `[ ${labels.legal_summary.toUpperCase()} ]\n${displayData.summary_simple}\n\n`;

            text += `[ ${labels.what_means.toUpperCase()} ]\n${displayData.what_it_means?.map((p: string) => `• ${p}`).join('\n')}\n\n`;

            if (displayData.key_clauses?.length > 0) {
                text += `[ ${labels.key_clauses.toUpperCase()} ]\n`;
                displayData.key_clauses.forEach((c: any) => {
                    text += `🔹 ${c.title} (${c.risk} Risk)\n   ${c.explanation}\n`;
                });
                text += `\n`;
            }

            if (displayData.red_flags?.length > 0) {
                text += `[ ${labels.red_flags.toUpperCase()} ]\n`;
                displayData.red_flags.forEach((f: any) => {
                    text += `🚩 ${f.severity.toUpperCase()}: ${f.reason}\n`;
                });
                text += `\n`;
            }

            if (displayData.documents_required?.length > 0) {
                text += `[ ${labels.docs_required.toUpperCase()} ]\n`;
                displayData.documents_required.forEach((d: any, i: number) => {
                    text += `${i + 1}. ${d.name}\n   Purpose: ${d.purpose}\n`;
                });
                text += `\n`;
            }

            text += `--------------------------------------------------\n`;
            text += `AUTHENTICATED BY LEGALLENS AI • ${new Date().getFullYear()}\n`;
            text += `--------------------------------------------------`;

            await navigator.clipboard.writeText(text);
            setCopyStatus('copied_text');
            setTimeout(() => setCopyStatus('idle'), 2000);
            setIsShareDropdownOpen(false);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    const handleSystemShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `LegalLens Analysis - ${id}`,
                    text: `Check out this AI-powered legal document analysis.`,
                    url: window.location.href,
                });
                setIsShareDropdownOpen(false);
            } catch (err) {
                console.error("System share failed:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <DocumentSkeleton mode="analyzing" />
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
        { code: 'mr', name: 'Marathi (मરાઠી)' },
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
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link href="/upload" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {labels.back_to_upload}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold">{labels.analysis_result}</h1>
                        <div className="flex-1 overflow-hidden pointer-events-none relative h-7 bg-amber-50 dark:bg-amber-900/10 rounded-full border border-amber-200 dark:border-amber-900/50 flex items-center">
                            <div className="flex items-center gap-1.5 px-3 bg-amber-50/80 dark:bg-amber-950/80 border-r border-amber-200 dark:border-amber-900/50 h-full z-10">
                                <AlertTriangle className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                                <span className="text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400">Warning</span>
                            </div>
                            <div className="whitespace-nowrap flex-1" style={{ animation: 'marquee-disclaimer 20s linear infinite' }}>
                                <span className="text-[10px] md:text-xs font-semibold text-amber-700 dark:text-amber-400">
                                    “{labels.legal_disclaimer}”
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">ID: {id}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
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
                            <svg className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                            </svg>
                            {isTranslating && <Loader2 className="h-4 w-4 animate-spin text-primary ml-1" />}
                            {cooldown > 0 && <span className="text-xs text-orange-500 font-bold ml-1 animate-pulse">{cooldown}s</span>}
                        </button>

                        <div className={`absolute right-0 mt-2 w-full rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden transition-all duration-300 origin-top ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
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

                    <div className="relative">
                        <button
                            onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                            disabled={isDownloading || loading || isTranslating}
                            className={`flex items-center gap-2 bg-primary text-white p-2 px-3 rounded-lg text-sm font-medium shadow-sm hover:shadow-primary/20 transition-all active:scale-95 ${isDownloading || loading || isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/90'}`}
                        >
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                            <span>{isDownloading ? "Processing..." : "Share"}</span>
                        </button>

                        <div className={`absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden transition-all duration-300 origin-top ${isShareDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                            <div className="py-2">
                                <button onClick={() => { setIsQRModalOpen(true); setIsShareDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-primary/10 transition-colors">
                                    <QrCode className="h-4 w-4 text-primary" />
                                    <span>Share via QR Code</span>
                                </button>
                                <div className="h-px bg-border/50 my-1" />
                                <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-primary/10 transition-colors">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span>Download Visual Report</span>
                                </button>
                                <button
                                    onClick={() => {
                                        import('@/lib/report-generator').then(module => {
                                            module.generatePDFReport(displayData, docName);
                                        });
                                        setIsShareDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-primary/10 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                    <span>Structured PDF Report</span>
                                </button>
                                <button onClick={handleDownloadImage} className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-primary/10 transition-colors">
                                    <ImageIcon className="h-4 w-4 text-primary" />
                                    <span>Download as Image</span>
                                </button>
                                <div className="h-px bg-border/50 my-1" />
                                <button onClick={handleCopyText} className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-primary/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="h-4 w-4 text-primary" />
                                        <span>Copy Analysis Text</span>
                                    </div>
                                    {copyStatus === 'copied_text' && <Check className="h-3 w-3 text-emerald-500" />}
                                </button>
                                <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-primary/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className="h-4 w-4 text-primary" />
                                        <span>Copy Link</span>
                                    </div>
                                    {copyStatus === 'copied_link' && <Check className="h-3 w-3 text-emerald-500" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(isDropdownOpen || isShareDropdownOpen) && <div className="fixed inset-0 z-40" onClick={() => { setIsDropdownOpen(false); setIsShareDropdownOpen(false); }} />}

            {isTranslating ? (
                <DocumentSkeleton />
            ) : (
                <div ref={contentRef} className="p-4 rounded-3xl bg-background border border-border/50 overflow-hidden">
                    {/* TOP PROMINENT WARNING FOR EXPORTS */}
                    <div className="pdf-only w-full bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-6 mb-8 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-2 text-amber-500 font-black uppercase tracking-widest text-sm">
                            <AlertTriangle className="h-5 w-5" />
                            Legal Disclaimer & Warning
                        </div>
                        <p className="text-xs font-bold text-amber-200/90 leading-relaxed max-w-2xl">
                            {labels.legal_disclaimer}
                        </p>
                    </div>

                    {/* Premium PDF/Image Header */}
                    <div className="mb-8 p-8 text-center relative pdf-only flex-col items-center">
                        <div className="absolute inset-0 bg-primary/5 -skew-y-2 transform -z-10" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary rounded-2xl shadow-lg ring-4 ring-primary/20">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">LegalLens <span className="text-primary">AI</span></h1>
                                <p className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">Intelligent Document Analysis</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Document Title</p>
                                <p className="text-sm font-mono font-bold text-foreground">{docName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Report Date</p>
                                <p className="text-sm font-bold text-foreground">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <MagicBento className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <MagicCard enableTilt={false} className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Info className="text-primary h-5 w-5" />
                                    {labels.legal_summary}
                                </h2>
                            </div>
                            <div className="text-lg leading-relaxed text-card-foreground/90 min-h-[100px] whitespace-pre-wrap">
                                {displayData.summary_simple}
                            </div>
                        </MagicCard>

                        <MagicCard enableTilt={false} className="col-span-full lg:col-span-1 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-5 w-5" />
                                {labels.what_means}
                            </h2>
                            <ul className="space-y-3">
                                {displayData.what_it_means?.map((point: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed whitespace-pre-wrap">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </MagicCard>

                        <MagicCard enableTilt={false} className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FileText className="text-primary h-5 w-5" />
                                {labels.key_clauses}
                            </h2>
                            <div className="space-y-4">
                                {displayData.key_clauses?.map((clause: any, i: number) => (
                                    <div key={i} className="border-b last:border-0 border-border/50 pb-4 last:pb-0">
                                        <div className="flex justify-between mb-1 items-center">
                                            <h3 className="font-medium text-card-foreground">{clause.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ml-2 ${(clause.risk || 'low').toLowerCase() === 'high' ? 'bg-destructive/10 text-destructive' : (clause.risk || 'low').toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                                                {clause.risk || 'Low'} Risk
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{clause.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </MagicCard>

                        <MagicCard enableTilt={false} className="col-span-full lg:col-span-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5" />
                                {labels.red_flags}
                            </h2>
                            <div className="space-y-4">
                                {displayData.red_flags?.length > 0 ? (
                                    displayData.red_flags.map((flag: any, i: number) => (
                                        <div key={i} className="p-3 bg-white dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-red-900 dark:text-red-200 text-sm whitespace-pre-wrap">
                                                    {language === 'en' ? flag.reason : (flag.text || flag.reason)}
                                                </span>
                                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ml-2 flex-shrink-0">
                                                    {flag.severity}
                                                </span>
                                            </div>
                                            {language !== 'en' && <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1 italic">"{flag.reason}"</p>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-red-600/60 italic">No major red flags detected.</p>
                                )}
                            </div>
                        </MagicCard>

                        {displayData.documents_required?.length > 0 && (
                            <MagicCard enableTilt={false} className="col-span-full rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                    <ClipboardList className="h-5 w-5" />
                                    {labels.docs_required}
                                </h2>
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {displayData.documents_required.map((doc: any, i: number) => (
                                        <div key={i} className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-blue-950/30 p-4 shadow-sm flex flex-col gap-3">
                                            <div className="flex items-start gap-2">
                                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">{i + 1}</span>
                                                <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm leading-snug">{doc.name}</h3>
                                            </div>
                                            {doc.purpose && <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-semibold">Purpose: <span className="font-normal">{doc.purpose}</span></p>}
                                            {doc.how_to_obtain?.length > 0 && (
                                                <div className="mt-1 rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-3">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <BookOpen className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">NOTE — How to Obtain</span>
                                                    </div>
                                                    <ol className="space-y-1.5">
                                                        {doc.how_to_obtain.map((step: string, j: number) => (
                                                            <li key={j} className="flex gap-2 text-xs text-amber-900 dark:text-amber-200">
                                                                <span className="shrink-0 font-bold text-amber-600 dark:text-amber-400">{j + 1}.</span>
                                                                <span>{step.replace(/^Step \d+:\s*/i, '')}</span>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </MagicCard>
                        )}
                    </MagicBento>

                    <div className="mt-12 pt-8 border-t border-border/50 pdf-only flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center mb-2">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-tighter">AI Verified</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center mb-2">
                                    <Info className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Legal Clarity</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold mb-3 text-primary">
                            <FileText className="h-6 w-6" />
                            <span>LegalLens AI</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground max-w-xl leading-relaxed italic border-l-2 border-primary/20 pl-4 mx-auto">
                            " {labels.legal_disclaimer} "
                        </p>
                        <div className="mt-6 text-[8px] font-mono opacity-30">
                            VERIFIED SECURE BY LEGALLENS CORE SERVICE • {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback System Section */}
            {!loading && !error && !isTranslating && <FeedbackSystem />}

            {/* QR Code Modal with Heavy Background Blur */}
            {isQRModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-background/40 backdrop-blur-2xl transition-all duration-500"
                        onClick={() => setIsQRModalOpen(false)}
                    />
                    <div className="relative bg-card border border-border/50 p-8 rounded-3xl shadow-2xl max-w-sm w-full transform transition-all animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsQRModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/20 transition-colors"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 p-4 bg-white rounded-2xl shadow-inner border border-border/20">
                                <QRCodeSVG
                                    value={typeof window !== 'undefined' ? window.location.href : ''}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    className="rounded-lg"
                                />
                            </div>

                            <h2 className="text-xl font-bold mb-2">Scan QR Code</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Scan this code with your phone camera to quickly view this legal analysis.
                            </p>

                            <div className="w-full p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col items-center gap-1">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Document Analysis For</p>
                                <p className="text-sm font-bold text-foreground truncate w-full px-2">{docName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
