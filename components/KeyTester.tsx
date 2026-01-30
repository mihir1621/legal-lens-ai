'use client';

import { useState } from 'react';
import { testGeminiKey } from '@/app/test-key';

export default function KeyTester() {
    const [status, setStatus] = useState<string>('Idle');

    const checkKey = async () => {
        setStatus('Checking...');
        const result = await testGeminiKey();
        if (result.success) {
            setStatus('✅ Success! ' + result.message);
        } else {
            setStatus('❌ Error: ' + result.message);
        }
    };

    return (
        <div className="p-4 border rounded bg-slate-50 mt-4">
            <h3 className="font-bold text-black">API Key Tester</h3>
            <button
                onClick={checkKey}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Test Key Now
            </button>
            <pre className="mt-2 text-sm font-mono text-black whitespace-pre-wrap break-all">
                {status}
            </pre>
        </div>
    );
}
