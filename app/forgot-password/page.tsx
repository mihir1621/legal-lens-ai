'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-slate-300">Enter your email to receive recovery instructions</p>
            </div>

            {!sent ? (
                <form onSubmit={handleReset} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>

                    <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-white">Check your email!</p>
                    <p className="text-slate-400 text-sm">We've sent a password reset link to <span className="text-white font-medium">{email}</span></p>
                </div>
            )}

            <div className="mt-8 text-center text-sm">
                <Link href="/login" className="text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                </Link>
            </div>
        </AuthBackground>
    );
}
