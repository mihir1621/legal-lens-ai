'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthBackground from '@/components/auth/AuthBackground';

export default function SignUpPage() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            router.push('/');
        } catch (error: any) {
            alert("Sign Up Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-slate-300">Join LegalLens to simplify your documents</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                    />
                </div>
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
                        minLength={6}
                    />
                </div>

                <button disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign Up <ArrowRight className="h-5 w-5" /></>}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Sign In
                </Link>
            </div>
        </AuthBackground>
    );
}
