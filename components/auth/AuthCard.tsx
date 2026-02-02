'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Github, Chrome, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';

type AuthMode = 'login' | 'signup';

export default function AuthCard({ initialMode = 'login' }: { initialMode?: AuthMode }) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push('/');
        } catch (error: any) {
            alert(error.message);
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
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0.4,
            scale: 0.96,
            filter: 'blur(8px)',
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            zIndex: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0.4,
            scale: 0.96,
            filter: 'blur(8px)',
            zIndex: 0,
        }),
    };

    const direction = mode === 'login' ? -1 : 1;

    return (
        <div className="w-full max-w-[400px] perspective-1000">
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-500 flex flex-col h-[600px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={mode}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 },
                            filter: { duration: 0.4 }
                        }}
                        className={`relative z-10 p-6 md:p-8 flex flex-col h-full ${mode === 'signup' ? 'justify-center' : ''}`}
                    >
                        {/* Main Content Area */}
                        <div className={mode === 'login' ? 'flex-1' : ''}>
                            <div className={`text-center ${mode === 'login' ? 'mb-4' : 'mb-6'}`}>
                                <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-slate-400 text-[11px] px-4 leading-relaxed">
                                    {mode === 'login'
                                        ? 'Access your secure legal dashboard'
                                        : 'Join LegalLens to simplify your documents today'}
                                </p>
                            </div>

                            <form onSubmit={handleAuth} className={`space-y-3 ${mode === 'login' ? 'mt-2' : ''}`}>
                                {mode === 'signup' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase tracking-wider">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                                        {mode === 'login' && (
                                            <button type="button" className="text-[10px] text-primary hover:text-primary/80 font-bold tracking-wider">Forgot?</button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group mt-2"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                                </button>
                            </form>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-tighter"><span className="bg-[#0c0c0e]/80 backdrop-blur-md px-2 text-slate-500">Or continue with</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-white">
                                    <Chrome className="h-3.5 w-3.5 text-[#4285F4]" /> Google
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-white">
                                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone
                                </button>
                            </div>
                        </div>

                        {/* Toggle Link Section - Moved above insights */}
                        <div className={`mt-5 text-center ${mode === 'login' ? 'mb-2' : 'pb-2'}`}>
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-xs font-medium text-slate-400"
                            >
                                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                                <span className="text-blue-500 font-bold hover:underline underline-offset-4 ml-1">
                                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                </span>
                            </button>
                        </div>

                        {/* Information Section - Bottom of the card */}
                        {mode === 'login' && (
                            <div className="mt-auto pt-5 border-t border-white/10 bg-white/5 -mx-8 px-8 rounded-b-[24px] pb-6">
                                <div className="flex flex-col items-center text-center space-y-1">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">AI Legal Insight</p>
                                        <p className="text-[11px] leading-relaxed italic bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent px-2 font-semibold">
                                            "LegalLens can detect 'hidden liability' clauses that 80% of users typically miss."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
