'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentSkeleton } from '@/components/DocumentSkeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { extractTextFromFile } from '@/app/actions';
import { analyzeLegalText } from '@/lib/analyze';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DragDropUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const droppedFile = acceptedFiles[0];
        if (droppedFile) {
            // Vercel Hobby plan has a 4.5MB request limit
            if (droppedFile.size > 4 * 1024 * 1024) {
                alert("File is too large! Please upload a document smaller than 4MB.");
                return;
            }
            setFile(droppedFile);
            setText(''); // clear text if file selected
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
        maxFiles: 1
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setFile(null); // clear file if text entered
    };

    const handleAnalyzeInternal = async (manualFile?: File, manualText?: string) => {
        const fileToUse = manualFile || file;
        const textToUse = manualText !== undefined ? manualText : text;

        if (!fileToUse && !textToUse) return;

        setIsUploading(true);
        try {
            let textToAnalyze = textToUse;

            if (fileToUse && !textToUse) {
                const formData = new FormData();
                formData.append('file', fileToUse);
                const result = await extractTextFromFile(formData);

                if (result.error) {
                    alert(result.error);
                    setIsUploading(false);
                    return;
                }
                textToAnalyze = result.text;
            }

            console.log("Analyzing document magic...");

            // 1. Legal Analysis
            const analysisResult: any = await analyzeLegalText(textToAnalyze);

            if (analysisResult.error) {
                alert(`Analysis Failed: ${analysisResult.error}`);
                setIsUploading(false);
                return;
            }

            // 2. Save to Firestore
            let user = auth.currentUser;
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

            if (user && projectId) {
                try {
                    await user.getIdToken(true);
                    const docRef = await addDoc(collection(db, "documents"), {
                        userId: user.uid,
                        title: (fileToUse as File)?.name || "Text Snippet",
                        originalText: textToAnalyze.substring(0, 5000),
                        analysis: analysisResult,
                        createdAt: serverTimestamp(),
                        isAnalysis: true
                    });
                    router.push(`/document/${docRef.id}`);
                } catch (dbErr: any) {
                    console.error("Firestore Save Error:", dbErr);
                    alert(`Save Error: ${dbErr.message}`);
                }
            } else {
                console.warn("Saving to local storage (No User or ProjectID)");
                localStorage.setItem("temp_analysis", JSON.stringify(analysisResult));
                router.push('/document/temp');
            }

        } catch (err: any) {
            console.error("General Error:", err);
            let userMsg = err.message || "Unknown error";
            if (userMsg.includes("permission-denied")) {
                userMsg = "Firestore Permission Denied: Check your Security Rules.";
            } else if (userMsg.includes("unauthenticated")) {
                userMsg = "Session Expired: Please log in again.";
            }
            alert(`Processing Failed: ${userMsg}\n\nCheck Vercel logs for detail.`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
                {isUploading ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <DocumentSkeleton mode="analyzing" />
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
                            <h2 className="text-2xl font-bold text-center text-white">Upload Document</h2>

                            <motion.div
                                {...(getRootProps() as any)}
                                whileHover={{ scale: 1.01, borderColor: "var(--primary)" }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all text-center",
                                    isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50 bg-[#0c0c0e]/40 backdrop-blur-xl"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">
                                            {file ? file.name : "Drag & drop legal documents"}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                            PDF, DOCX, TXT, or Image (Max 4MB)
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0c0c0e] px-2 text-slate-500 font-bold tracking-widest">OR PASTE TEXT</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <textarea
                                    className="w-full bg-[#0c0c0e]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium placeholder:text-slate-600"
                                    placeholder="Paste legal text here..."
                                    value={text}
                                    onChange={handleTextChange}
                                />
                                <div className="absolute right-4 bottom-4 p-2 bg-white/5 rounded-lg border border-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                            </div>

                            <button
                                onClick={() => handleAnalyzeInternal()}
                                disabled={isUploading || (!file && !text)}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Reading Document...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span>Start AI Analysis</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
