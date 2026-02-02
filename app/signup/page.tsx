'use client';

import AuthBackground from '@/components/auth/AuthBackground';
import AuthCard from '@/components/auth/AuthCard';

export default function SignUpPage() {
    return (
        <AuthBackground>
            <AuthCard initialMode="signup" />
        </AuthBackground>
    );
}
