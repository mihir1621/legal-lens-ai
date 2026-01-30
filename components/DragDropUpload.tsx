'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { extractTextFromFile } from '@/app/actions';
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
            'text/plain': ['.txt']
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

            console.log("Extracted text, sending to AI...");

            // 1. Call AI Analysis
            const analysisResult = await analyzeLegalText(textToAnalyze);
            console.log("AI Analysis Complete", analysisResult);

            // 2. Save to Firestore
            const user = auth.currentUser;
            if (user) {
                const docRef = await addDoc(collection(db, "documents"), {
                    userId: user.uid,
                    title: file ? file.name : "Text Snippet",
                    originalText: textToAnalyze.substring(0, 1000) + "...", // Save preview
                    analysis: analysisResult,
                    createdAt: serverTimestamp(),
                    riskLevel: analysisResult.red_flags.some((f: any) => f.severity === 'High') ? 'High' :
                        analysisResult.red_flags.length > 0 ? 'Medium' : 'Low'
                });

                // 3. Navigate to result
                router.push(`/document/${docRef.id}`);
            } else {
                console.warn("User not logged in, saving to local storage instead of Firestore for demo");
                localStorage.setItem("temp_analysis", JSON.stringify(analysisResult));
                router.push('/document/temp');
            }

        } catch (err) {
            console.error(err);
            alert("Analysis Failed: " + (err instanceof Error ? err.message : "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center">Upload Document</h2>

                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden",
                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                        file ? "bg-primary/5 border-primary" : ""
                    )}
                >
                    <input {...getInputProps()} />
                    {file ? (
                        <div className="flex flex-col items-center z-10">
                            <FileText className="h-12 w-12 text-primary mb-4" />
                            <p className="font-medium text-lg">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="mt-4 p-2 rounded-full hover:bg-destructive/10 text-destructive text-sm font-medium transition-colors"
                            >
                                Remove File
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center z-10">
                            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-foreground">Drag & drop your document here</p>
                            <p className="text-sm text-muted-foreground mt-2">Supports PDF, DOCX, TXT</p>
                            <button type="button" className="mt-6 rounded-full bg-secondary text-secondary-foreground px-6 py-2 text-sm font-medium hover:bg-secondary/90 transition-colors">
                                Browse Files
                            </button>
                        </div>
                    )}
                </div>
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
                        className="w-full sm:w-auto min-w-[200px] rounded-full bg-primary px-8 py-3 text-base font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze Document"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
