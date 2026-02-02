'use client';

import { useState } from 'react';
import { checkModelsEnv } from '@/app/test-key';

export default function KeyTester() {
    const [status, setStatus] = useState<string>('Idle');
    const [results, setResults] = useState<any[]>([]);

    const checkKey = async () => {
        setStatus('Checking models...');
        setResults([]);
        try {
            const res = await checkModelsEnv();
            if (Array.isArray(res)) {
                setResults(res);
                setStatus('Check Complete');
            } else {
                setStatus('Error: Unexpected response format');
            }
        } catch (e) {
            setStatus('Error: ' + String(e));
        }
    };

    return (
        <div className="p-4 border rounded bg-slate-50 mt-4 text-black">
            <h3 className="font-bold text-lg mb-2">API Key & Model Tester</h3>
            <button
                onClick={checkKey}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
                Test OpenRouter Models
            </button>

            <div className="mt-4">
                <p className="font-semibold">Status: {status}</p>
                {results.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {results.map((r, i) => (
                            <div key={i} className={`p-2 rounded border ${r.status === 'OK' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                                <p className="font-bold text-sm">{r.model}</p>
                                <p className="text-xs font-mono">{r.status === 'OK' ? '✅ Operational' : `❌ ${r.status}`}</p>
                                {r.body && <p className="text-xs font-mono mt-1 text-red-700 truncate">{r.body.substring(0, 100)}</p>}
                                {r.message && <p className="text-xs font-mono mt-1 text-red-700">{r.message}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
