'use client';

import AuthBackground from '@/components/auth/AuthBackground';
import AuthCard from '@/components/auth/AuthCard';

export default function LoginPage() {
    return (
        <AuthBackground>
            <AuthCard initialMode="login" />
        </AuthBackground>
    );
}
