'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, Chrome, Phone, ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { verifyRecaptcha } from '@/app/actions';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';

type AuthMode = 'login' | 'signup' | 'phone';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
        grecaptcha: any;
    }
}

export default function AuthCard({ initialMode = 'login' }: { initialMode?: AuthMode }) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Phone Auth states
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    // Cleanup reCAPTCHA on unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                } catch (e) { }
            }
        };
    }, []);

    const getEnterpriseToken = async (action: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const grecaptcha = window.grecaptcha;
            if (grecaptcha?.enterprise) {
                grecaptcha.enterprise.ready(async () => {
                    try {
                        const token = await grecaptcha.enterprise.execute('6Lfci2UsAAAAAPi-lmckbc7N8WdrP2CBE1nxpBPX', { action });
                        resolve(token);
                    } catch (e) {
                        console.error("[Recaptcha] Token Error:", e);
                        resolve(null);
                    }
                });
            } else {
                console.warn("[Recaptcha] Enterprise script not found");
                resolve(null);
            }
        });
    };

    const runSafetyCheck = async (action: string) => {
        const token = await getEnterpriseToken(action);
        if (!token) {
            console.warn(`[Recaptcha] Skipping check for ${action}: Token not generated`);
            return true;
        }

        const assessment = await verifyRecaptcha(token, action);
        if (!assessment.success) {
            const detail = assessment.score !== undefined
                ? `(Score: ${assessment.score})`
                : `(Error: ${assessment.error || 'Unknown'})`;
            throw new Error(`Security system flagged this request ${detail}. Please try again.`);
        }
        return true;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const action = mode === 'login' ? 'LOGIN' : 'SIGNUP';

        try {
            await runSafetyCheck(action);

            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push('/');
        } catch (err: any) {
            console.error("[Auth] Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await runSafetyCheck('GOOGLE_LOGIN');
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (typeof window === 'undefined') return;
        try {
            // If it's already there, just check if it's usable
            if (window.recaptchaVerifier) {
                console.log("[Auth] Reusing existing reCAPTCHA verifier");
                return;
            }

            // Manually clear the container to be absolutely sure
            const container = document.getElementById('recaptcha-wrapper');
            if (container) {
                container.innerHTML = '';
            }

            console.log("[Auth] Initializing fresh reCAPTCHA verifier");
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-wrapper', {
                'size': 'invisible',
                'callback': () => {
                    console.log("[Auth] Firebase Recaptcha solved");
                },
                'expired-callback': () => {
                    console.warn("[Auth] Recaptcha expired, clearing...");
                    if (window.recaptchaVerifier) {
                        window.recaptchaVerifier.clear();
                        window.recaptchaVerifier = null;
                    }
                }
            });
        } catch (err) {
            console.error("[Auth] Recaptcha Init Error:", err);
            // On hard error, wipe everything
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
        }
    };

    const handlePhoneSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 10) {
            setError("Please enter a valid phone number with country code");
            return;
        }

        setError('');
        setLoading(true);
        console.log(`[Auth] Starting Phone Sign-in for: ${phoneNumber}`);

        try {
            await runSafetyCheck('PHONE_SEND');
            setupRecaptcha();

            const appVerifier = window.recaptchaVerifier;
            if (!appVerifier) {
                console.error("[Auth] Recaptcha Verifier is missing from window");
                throw new Error("Security check failed to initialize. Please refresh.");
            }

            console.log("[Auth] Calling Firebase signInWithPhoneNumber...");
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

            console.log("[Auth] OTP sent successfully! Confirmation result received.");
            setConfirmationResult(result);
            setShowOtpInput(true);
        } catch (err: any) {
            console.error("[Auth] Phone Sign-in Error:", err);

            let userMessage = err.message;
            if (err.code === 'auth/captcha-check-failed') userMessage = "Security check failed. Please try again.";
            if (err.code === 'auth/invalid-phone-number') userMessage = "The phone number is invalid. Use format: +91 9123456789";
            if (err.code === 'auth/too-many-requests') userMessage = "Too many attempts. Please try again in 10 minutes.";
            if (err.code === 'auth/quota-exceeded') userMessage = "SMS quota exceeded for today. Please try again later.";

            setError(userMessage);

            // Clean up problematic verifier
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !confirmationResult) return;

        setError('');
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            router.push('/');
        } catch (err: any) {
            setError("Invalid verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            zIndex: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            zIndex: 0,
        }),
    };

    const getDirection = () => {
        if (mode === 'signup') return 1;
        if (mode === 'phone') return 2;
        return -1;
    };

    return (
        <div className="w-full max-w-[420px] relative">
            {/* Invisible wrappers for reCAPTCHA */}
            <div id="recaptcha-wrapper"></div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c0e]/80 backdrop-blur-2xl shadow-2xl transition-all duration-500 flex flex-col min-h-[620px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-primary/5 pointer-events-none" />

                <AnimatePresence mode="wait" custom={getDirection()}>
                    <motion.div
                        key={mode}
                        custom={getDirection()}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="relative z-10 p-8 md:p-10 flex flex-col h-full grow"
                    >
                        {/* Header */}
                        <div className="mb-8 text-center relative">
                            {mode === 'phone' && (
                                <button
                                    onClick={() => { setMode('login'); setShowOtpInput(false); setError(''); }}
                                    className="absolute -left-2 top-1 text-slate-500 hover:text-white transition-colors p-2"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {mode === 'login' ? 'Welcome' : mode === 'signup' ? 'Create' : 'Secure'}
                                <span className="text-primary ml-2">{mode === 'login' ? 'Back' : mode === 'signup' ? 'Account' : 'Access'}</span>
                            </h2>
                            <p className="text-slate-400 text-xs font-medium">
                                {mode === 'login' ? 'Sign in to access LegalLens' : mode === 'signup' ? 'Join the future of legal aid' : 'Verify your identity with OTP'}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] text-center font-semibold flex items-center justify-center gap-2"
                            >
                                <Shield className="h-3 w-3" /> {error}
                            </motion.div>
                        )}

                        <div className="flex-1 space-y-6">
                            {mode === 'phone' ? (
                                <form onSubmit={showOtpInput ? handleVerifyOtp : handlePhoneSignIn} className="space-y-5">
                                    {!showOtpInput ? (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                                                    placeholder="+91 00000 00000"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Verification Code</label>
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full bg-white/5 border-2 border-primary/20 rounded-2xl py-5 text-center text-4xl font-black text-white tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                                    placeholder="000000"
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-[10px] text-center text-slate-500">
                                                Didn't get code? <button type="button" onClick={() => setShowOtpInput(false)} className="text-primary hover:underline">Change number</button>
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (showOtpInput ? 'Confirm & Login' : 'Send One-Time Code')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleAuth} className="space-y-4">
                                    {mode === 'signup' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                                    placeholder="Your Name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                                placeholder="email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                                            {mode === 'login' && <button onClick={() => router.push('/forgot-password')} type="button" className="text-[10px] text-primary font-bold hover:underline">Forgot?</button>}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-4 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign In Now' : 'Create My Account')}
                                    </button>
                                </form>
                            )}

                            {mode !== 'phone' && (
                                <div className="space-y-6">
                                    <div className="relative flex items-center">
                                        <div className="grow border-t border-white/5"></div>
                                        <span className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Social Identity</span>
                                        <div className="grow border-t border-white/5"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleGoogleLogin}
                                            className="flex items-center justify-center gap-3 py-3.5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-xs font-bold text-white group"
                                        >
                                            <Chrome className="h-4 w-4 text-[#4285F4] group-hover:scale-110 transition-transform" /> Google
                                        </button>
                                        <button
                                            onClick={() => { setMode('phone'); setError(''); }}
                                            className="flex items-center justify-center gap-3 py-3.5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-xs font-bold text-white group"
                                        >
                                            <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Phone
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Toggle */}
                        <div className="mt-8 text-center pt-6 border-t border-white/5">
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setShowOtpInput(false); setError(''); }}
                                className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {mode === 'login' ? "New to LegalLens?" : "Already have an account?"}{' '}
                                <span className="text-primary font-bold ml-1 hover:underline">
                                    {mode === 'login' ? 'Join Free' : 'Sign In'}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
