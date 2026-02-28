'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentSkeleton } from '@/components/DocumentSkeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { extractTextFromFile } from '@/app/actions';
import { translateText } from '@/app/actions/translate';
import { analyzeLegalText } from '@/app/analyze';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export default function DragDropUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            setFile(acceptedFiles[0]);
            setText(''); // clear text if file selected
        }
    }, []);

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

    const handleAnalyze = async () => {
        if (!file && !text) return;

        setIsUploading(true);

        try {
            let textToAnalyze = text;

            if (file && !text) {
                const formData = new FormData();
                formData.append('file', file);
                const result = await extractTextFromFile(formData);

                if (result.error) {
                    alert(result.error);
                    setIsUploading(false);
                    return;
                }

                textToAnalyze = result.text;
            }

            console.log("Analyzing document magic...");

            // 1. Legal Analysis (Now with Vision support for images/scans)
            const analysisResult: any = await analyzeLegalText(textToAnalyze);

            if (analysisResult.error) {
                alert(`Analysis Failed: ${analysisResult.error}`);
                setIsUploading(false);
                return;
            }

            console.log("Analysis Complete. Points found:", {
                clauses: analysisResult.key_clauses?.length,
                flags: analysisResult.red_flags?.length
            });

            // 2. Save to Firestore
            let user = auth.currentUser;

            // Re-check Firestore configuration
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            if (!projectId) {
                console.error("CRITICAL: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing!");
                alert("Configuration Error: Firebase Project ID is not set in environment variables.");
                return;
            }

            // Re-check auth
            if (!user) {
                console.log("Waiting for auth to re-initialize...");
                await new Promise(resolve => setTimeout(resolve, 500));
                user = auth.currentUser;
            }

            if (user) {
                console.log(`Attempting save to ${projectId} for user ${user.uid}`);
                try {
                    await user.getIdToken(true);

                    const docRef = await addDoc(collection(db, "documents"), {
                        userId: user.uid,
                        title: file ? file.name : "Text Snippet",
                        originalText: textToAnalyze.substring(0, 5000),
                        analysis: analysisResult,
                        createdAt: serverTimestamp(),
                        isAnalysis: true
                    });
                    console.log("Document saved with ID:", docRef.id);
                    router.push(`/document/${docRef.id}`);
                } catch (dbErr: any) {
                    console.error("Firestore Database Error Details:", dbErr);
                    alert(`Firestore Error [${dbErr.code}]: ${dbErr.message}\n\nCheck if your Rules allow writes to the 'documents' collection.`);
                    return;
                }
            } else {
                console.warn("User session lost during analysis, saving to local storage");
                localStorage.setItem("temp_analysis", JSON.stringify(analysisResult));
                router.push('/document/temp');
            }

        } catch (err: any) {
            console.error("General Analysis/Save Error:", err);
            alert("Processing Failed: " + (err instanceof Error ? err.message : "Unknown error"));
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
                            <h2 className="text-2xl font-bold text-center">Upload Document</h2>

                            <motion.div
                                {...(getRootProps() as any)}
                                whileHover={{ scale: 1.01, borderColor: "var(--primary)" }}
                                whileTap={{ scale: 0.98 }}
                                animate={{
                                    backgroundColor: isDragActive ? "rgba(249, 115, 22, 0.08)" : "rgba(255, 255, 255, 0)",
                                    borderColor: isDragActive ? "#f97316" : file ? "#f97316" : "var(--border)",
                                }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden min-h-[300px]",
                                    isDragActive && "ring-4 ring-primary/20"
                                )}
                            >
                                <input {...getInputProps()} />

                                {/* Animated Background Gradient (Subtle) */}
                                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/20 pointer-events-none" />

                                <AnimatePresence mode="wait">
                                    {file ? (
                                        <motion.div
                                            key="file-selected"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex flex-col items-center z-10"
                                        >
                                            <div className="relative mb-4">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                                <FileText className="relative h-16 w-16 text-primary drop-shadow-md" />
                                            </div>
                                            <p className="font-bold text-xl text-foreground">{file.name}</p>
                                            <p className="text-sm text-muted-foreground mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 hover:bg-destructive/20 transition-colors"
                                            >
                                                Remove File
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="upload-prompt"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center z-10"
                                        >
                                            <motion.div
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
                                                className="mb-6 relative"
                                            >
                                                <div className={`absolute inset-0 blur-2xl rounded-full transition-colors duration-500 ${isDragActive ? 'bg-primary/40' : 'bg-secondary/20'}`} />
                                                <Upload className={`relative h-16 w-16 transition-colors duration-300 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </motion.div>

                                            <h3 className="text-xl font-bold text-foreground mb-2">
                                                {isDragActive ? "Drop text magic here!" : "Drag & drop your document"}
                                            </h3>
                                            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                                                Supports PDF, DOCX, TXT, and **Images (JPG/PNG)**. Even scanned documents and photos work!
                                            </p>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                className="rounded-full px-8 py-3 text-sm font-bold transition-all"
                                                style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#ea6c0a')}
                                                onMouseLeave={e => (e.currentTarget.style.background = '#f97316')}
                                            >
                                                Browse Files
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                placeholder="Paste your legal text here..."
                                className="w-full h-48 rounded-xl border border-border bg-card p-4 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all"
                                value={text}
                                onChange={handleTextChange}
                                disabled={!!file}
                            />

                            <div className="flex justify-center">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={(!file && !text) || isUploading}
                                    className="w-full sm:w-auto min-w-[200px] rounded-full px-8 py-3 text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ background: '#f97316', color: '#ffffff', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                                >
                                    Analyze Document
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
