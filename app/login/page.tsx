'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, ArrowRight, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';

// Types for Phone Auth
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: any;
    }
}

export default function LoginPage() {
    const [method, setMethod] = useState<'email' | 'phone'>('email');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            alert("Login Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error: any) {
            alert("Google Login Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            // Ensure phone number is in E.164 format (e.g., +919999999999)
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
        } catch (error: any) {
            console.error(error);
            alert("Could not send OTP: " + error.message);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                // @ts-ignore
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await window.confirmationResult.confirm(otp);
            router.push('/');
        } catch (error: any) {
            alert("Invalid OTP: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-slate-300">Sign in to continue to LegalLens</p>
            </div>

            {/* Toggle */}
            <div className="flex p-1 mb-8 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
                <button
                    onClick={() => setMethod('email')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${method === 'email' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Email
                </button>
                <button
                    onClick={() => setMethod('phone')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${method === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Phone
                </button>
            </div>

            <AnimatePresence mode="wait">
                {method === 'email' ? (
                    <motion.form
                        key="email"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleEmailLogin}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
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
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                        </button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="phone"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                        className="space-y-4"
                    >
                        {!otpSent ? (
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="tel"
                                    placeholder="Phone Number (e.g. 9876543210)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="text-center mb-4 text-sm text-slate-300">
                                    Enter code sent to <span className="text-white font-medium">{phone}</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-center text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-widest text-xl"
                                    required
                                />
                            </div>
                        )}

                        <div id="recaptcha-container"></div>

                        <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (otpSent ? "Verify OTP" : "Send OTP")}
                        </button>

                        {otpSent && (
                            <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                                Change Phone Number
                            </button>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-500 font-medium">OR CONTINUE WITH</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
            </button>

            <div className="mt-8 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Sign Up
                </Link>
            </div>
        </AuthBackground>
    );
}
