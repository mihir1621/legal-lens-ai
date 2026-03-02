'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Search, Zap, ShieldCheck } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentSkeleton } from '@/components/DocumentSkeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { extractTextFromFile } from '@/app/actions';
import { analyzeLegalText } from '@/lib/analyze';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LegalAnalysis } from '@/lib/types';

type ProcessingStep = 'idle' | 'extracting' | 'analyzing' | 'finalizing';

export default function DragDropUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [step, setStep] = useState<ProcessingStep>('idle');
    const [previewText, setPreviewText] = useState<string | null>(null);
    const router = useRouter();

    const isUploading = step !== 'idle';

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const droppedFile = acceptedFiles[0];
        if (droppedFile) {
            if (droppedFile.size > 4 * 1024 * 1024) {
                alert("File is too large! Please upload a document smaller than 4MB.");
                return;
            }
            setFile(droppedFile);
            setText('');
            handleAnalyzeInternal(droppedFile, '');
        }
    }, [router]);

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
        disabled: isUploading
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setFile(null);
    };

    const handleAnalyzeInternal = async (manualFile?: File, manualText?: string) => {
        const fileToUse = manualFile || file;
        const textToUse = manualText !== undefined ? manualText : text;

        if (!fileToUse && !textToUse) return;

        setStep('extracting');
        try {
            let textToAnalyze = textToUse;

            if (fileToUse && !textToUse) {
                const formData = new FormData();
                formData.append('file', fileToUse);
                const result = await extractTextFromFile(formData);

                if (result.error) {
                    alert(result.error);
                    setStep('idle');
                    return;
                }
                textToAnalyze = result.text;

                // Set non-image preview
                if (!textToAnalyze.startsWith('IMAGE_DATA:')) {
                    setPreviewText(textToAnalyze.substring(0, 300) + "...");
                }
            }

            setStep('analyzing');
            let user = auth.currentUser;
            const analysisResult = await analyzeLegalText(textToAnalyze, user?.uid);

            if (analysisResult.error) {
                alert(`Analysis Failed: ${analysisResult.error}`);
                setStep('idle');
                return;
            }

            setStep('finalizing');
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

            if (user && projectId) {
                try {
                    await user.getIdToken(true);

                    // CRITICAL FIX: Next.js 15/16 Server Actions return data wrapped in Proxies.
                    // When passed to Firestore's addDoc, these proxies can cause "Maximum array nesting exceeded".
                    // We must force the data into a plain POJO (Plain Old JavaScript Object).
                    const plainAnalysis = JSON.parse(JSON.stringify(analysisResult));

                    const docRef = await addDoc(collection(db, "documents"), {
                        userId: user.uid,
                        title: (fileToUse as File)?.name || "Text Snippet",
                        originalText: textToAnalyze.substring(0, 5000),
                        fingerprint: textToAnalyze.substring(0, 500),
                        analysis: plainAnalysis,
                        createdAt: serverTimestamp(),
                        isAnalysis: true
                    });
                    router.push(`/document/${docRef.id}`);
                } catch (dbErr: any) {
                    console.error("Firestore Save Error:", dbErr);
                    alert(`Save Error: ${dbErr.message}`);
                    setStep('idle');
                }
            } else {
                localStorage.setItem("temp_analysis", JSON.stringify(analysisResult));
                router.push('/document/temp');
            }

        } catch (err: any) {
            console.error("General Error:", err);
            setStep('idle');
            alert(`Processing Failed: ${err.message || 'Unknown Error'}`);
        }
    };

    const getStepDetails = () => {
        switch (step) {
            case 'extracting': return { icon: Search, label: "Scanning Document", color: "text-blue-400" };
            case 'analyzing': return { icon: Zap, label: "AI Analysis Running", color: "text-primary" };
            case 'finalizing': return { icon: ShieldCheck, label: "Securing Results", color: "text-emerald-400" };
            default: return { icon: Loader2, label: "Processing", color: "text-white" };
        }
    };

    const StepIcon = getStepDetails().icon;

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
                {isUploading ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="relative"
                    >
                        {/* Status Bar */}
                        <div className="mb-8 flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-xl bg-white/10", getStepDetails().color)}>
                                    <StepIcon className="h-6 w-6 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-wide">{getStepDetails().label}</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Step {step === 'extracting' ? '1/3' : step === 'analyzing' ? '2/3' : '3/3'}</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                {['extracting', 'analyzing', 'finalizing'].map((s) => (
                                    <div
                                        key={s}
                                        className={cn(
                                            "h-1.5 w-8 rounded-full transition-all duration-500",
                                            step === s ? "bg-primary w-12 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                                                ['analyzing', 'finalizing'].includes(step) && s === 'extracting' || (step === 'finalizing' && s === 'analyzing') ? "bg-emerald-500" : "bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {previewText && step === 'extracting' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-slate-400 font-mono italic"
                            >
                                <p className="mb-1 text-[10px] text-primary font-bold uppercase tracking-tighter">Preview detected text:</p>
                                {previewText}
                            </motion.div>
                        )}

                        <DocumentSkeleton mode="analyzing" />

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setStep('idle')}
                                className="text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                Cancel Processing
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black text-white tracking-tight">Protect Your Future</h2>
                                <p className="text-slate-400 text-sm font-medium">Upload any legal document for instant AI clarity.</p>
                            </div>

                            <motion.div
                                {...(getRootProps() as any)}
                                whileHover={{ scale: 1.01, borderColor: "rgba(59,130,246,0.5)" }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-16 transition-all text-center overflow-hidden",
                                    isDragActive ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary/40 bg-[#0c0c0e]/60 backdrop-blur-2xl"
                                )}
                            >
                                {/* Animated background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <input {...getInputProps()} />
                                <div className="relative z-10 space-y-6">
                                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                                        <Upload className="h-10 w-10 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white tracking-tight">
                                            {file ? file.name : "Drop document here"}
                                        </p>
                                        <div className="flex items-center justify-center gap-3 mt-3">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-widest">PDF</span>
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-widest">DOCX</span>
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-widest">Image</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#030303] px-4 text-slate-600 font-black tracking-[0.3em]">Manual Analysis</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <textarea
                                    className="w-full bg-[#0c0c0e]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-white min-h-[220px] focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-700 leading-relaxed shadow-inner"
                                    placeholder="Paste contract text or clauses here to analyze instantly..."
                                    value={text}
                                    onChange={handleTextChange}
                                />
                                <div className="absolute right-6 bottom-6 p-3 bg-white/5 rounded-2xl border border-white/10 opacity-0 group-focus-within:opacity-100 transition-all translate-y-2 group-focus-within:translate-y-0">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                            </div>

                            <button
                                onClick={() => handleAnalyzeInternal()}
                                disabled={isUploading || (!file && !text)}
                                className="w-full py-5 bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] text-white rounded-[2rem] font-black shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 disabled:opacity-30 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                <Zap className="h-5 w-5 fill-white" />
                                <span className="uppercase tracking-[0.15em] text-sm">Review with LegalLens AI</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
