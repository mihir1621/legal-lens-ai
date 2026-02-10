'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowLeft, Loader2, CheckCircle, ShieldQuestion, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err: any) {
            console.error("[Auth] Reset Error:", err);
            setError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="w-full max-w-[420px] relative">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c0e]/80 backdrop-blur-2xl shadow-2xl transition-all duration-500 flex flex-col min-h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-primary/5 pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {!sent ? (
                            <motion.div
                                key="request"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10 p-8 md:p-10 flex flex-col h-full grow"
                            >
                                {/* Header */}
                                <div className="mb-8 text-center relative">
                                    <Link
                                        href="/login"
                                        className="absolute -left-2 top-1 text-slate-500 hover:text-white transition-colors p-2"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20">
                                        <KeyRound className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                        Forgot <span className="text-primary italic">Password?</span>
                                    </h2>
                                    <p className="text-slate-400 text-xs font-medium px-4">
                                        Don't worry! Enter your email and we'll send you a recovery link.
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] text-center font-semibold"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleReset} className="space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 mt-auto mb-4"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <span>Send Recovery Link</span>
                                                <Sparkles className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <Link href="/login" className="text-xs font-bold text-primary hover:underline">
                                        Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative z-10 p-8 md:p-10 flex flex-col items-center justify-center h-full grow text-center"
                            >
                                <div className="h-24 w-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-8 border-4 border-green-500/10 shadow-[0_0_50px_-10px_rgba(34,197,94,0.3)]">
                                    <CheckCircle className="h-12 w-12" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Check Your Inbox</h2>
                                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-[280px]">
                                    We've sent a password reset link to <br />
                                    <span className="text-white font-bold">{email}</span>
                                </p>

                                <div className="w-full space-y-4">
                                    <Link
                                        href="/login"
                                        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Return to Log In
                                    </Link>
                                    <button
                                        onClick={() => setSent(false)}
                                        className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                                    >
                                        Didn't receive it? Try another email
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Secure Footer Info */}
                <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
                    <ShieldQuestion className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Recovery Protocol</span>
                </div>
            </div>
        </AuthBackground>
    );
}
