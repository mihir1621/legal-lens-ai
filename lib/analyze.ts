'use server';

import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { LegalAnalysis } from './types';
import OpenAI from 'openai';

/**
 * LEGAL ANALYSIS ENGINE (Version 15.4 - Turbopack Fixed)
 */

const ANALYSIS_PROMPT_SYSTEM = `You are a Senior Legal Strategist specializing in Legal Risk Mitigation. 
Analyze the document provided and return a high-clarity strategic breakdown.

STRICT JSON OUTPUT FORMAT:
{
    "summary_simple": "Executive summary in bullet points (•). Focus on who, what, when.",
    "what_it_means": ["Strategic implications for the user", "Financial impact", "Immediate next steps"],
    "key_clauses": [
        {"title": "Clause Name", "explanation": "Simple breakdown", "risk": "High | Medium | Low"}
    ],
    "red_flags": [
        {"reason": "Specific threat or missing protection", "severity": "High | Medium | Low"}
    ],
    "documents_required": [
        {"name": "Required Doc", "purpose": "Why this is needed", "how_to_obtain": ["Step-by-step guidance"]}
    ]
}

STRICT ANALYTICAL RULES:
1. Tone: Professional, objective, and protective of the user.
2. Summary: Use exactly 1 short sentence per bullet point.
3. Clarity: No "legalese" – explain everything as if to a business owner.
4. Risk: Be aggressive in identifying "unfair" clauses or missing termination rights.
5. If some data is missing from a scan, state 'Inferred' or 'Insufficient Data' in the field.`;

/**
 * Recursively flattens any nested arrays and ensures primitive values.
 * Prevents Firestore "Maximum array nesting exceeded" errors.
 */
function sanitizeAnalysis(data: any): LegalAnalysis {
    const flattenStringArray = (arr: any): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => Array.isArray(item) ? item.flat(10).join(" ") : String(item || ""));
    };

    return {
        summary_simple: String(data?.summary_simple || ""),
        what_it_means: flattenStringArray(data?.what_it_means),
        key_clauses: (data?.key_clauses || []).map((c: any) => ({
            title: String(c?.title || "N/A"),
            explanation: String(c?.explanation || "N/A"),
            risk: String(c?.risk || "Medium")
        })).slice(0, 15),
        red_flags: (data?.red_flags || []).map((r: any) => ({
            reason: String(r?.reason || "N/A"),
            severity: String(r?.severity || "Medium")
        })).slice(0, 15),
        documents_required: (data?.documents_required || []).map((d: any) => ({
            name: String(d?.name || "N/A"),
            purpose: String(d?.purpose || "N/A"),
            how_to_obtain: flattenStringArray(d?.how_to_obtain)
        })).slice(0, 15),
        error: data?.error ? String(data.error) : undefined
    };
}

export async function analyzeLegalText(text: string, userId?: string): Promise<LegalAnalysis> {
    const isVisionMode = text.startsWith('IMAGE_DATA:');
    let cleanedText = text.trim();

    // 1. --- INTELLIGENT CACHE CHECK ---
    if (userId && !isVisionMode && cleanedText.length > 50) {
        try {
            const fingerprint = generateFingerprint(cleanedText);
            console.log(`[Analyzer] Caching check for user ${userId.substring(0, 5)}...`);
            const q = query(
                collection(db, "documents"),
                where("userId", "==", userId),
                where("isAnalysis", "==", true),
                where("fingerprint", "==", fingerprint),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                console.log("[Analyzer] ✅ CACHE HIT: Restoring analysis from history.");
                return sanitizeAnalysis(querySnapshot.docs[0].data().analysis);
            }
        } catch (cacheErr) {
            console.warn("[Analyzer] ⚠️ History lookup failed:", cacheErr);
        }
    }

    // 2. --- SETUP API KEYS (Broad Lookup for Vercel/Local Resiliency) ---
    const googleKey = (
        process.env.GOOGLE_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        ""
    ).replace(/["']/g, "").trim();

    const orKey = (
        process.env.OPENROUTER_API_KEY ||
        process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
        process.env.NEXT_PUBLIC_APIKEY ||
        process.env.OPENROUTER_KEY ||
        ""
    ).replace(/["']/g, "").trim();

    if (!googleKey && !orKey) throw new Error("NO_FUNCTIONAL_API_KEYS");

    const userPrompt = `Analyze this legal document. ${isVisionMode ? "READ THE IMAGE VISUALLY." : `DOC TEXT: ${cleanedText.substring(0, 5000)}`}\n\nReturn JSON only.`;
    let winnerFound = false;

    // 3. --- PROVIDER 1: GEMINI (With Aggressive Retry) ---
    const startGemini = async (retryCount = 0): Promise<LegalAnalysis> => {
        if (!googleKey) throw new Error("GEMINI_DISABLED");

        try {
            console.log(`[Analyzer] Querying Gemini (Attempt ${retryCount + 1})...`);

            let base64Data = '';
            let mimeType = '';
            if (isVisionMode) {
                const parts = text.split(';base64,');
                if (parts.length !== 2) throw new Error("INVALID_IMAGE_DATA_FORMAT");
                mimeType = parts[0].replace('IMAGE_DATA:', '');
                base64Data = parts[1];
            }

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: isVisionMode
                        ? [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }, { inlineData: { mimeType, data: base64Data } }] }]
                        : [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 2000 }
                }),
                signal: AbortSignal.timeout(15000)
            });

            if (res.status === 429 && retryCount < 1) {
                console.warn("[Analyzer] Gemini 429. Retrying in 2s...");
                await new Promise(r => setTimeout(r, 2000));
                return startGemini(retryCount + 1);
            }

            if (!res.ok) throw new Error(`GEMINI_REJECTED_${res.status}`);
            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!raw) throw new Error("GEMINI_EMPTY");

            const parsed = JSON.parse(raw);
            winnerFound = true;
            console.log("[Analyzer] 🏆 Gemini Successfully Analyzed.");
            return sanitizeAnalysis(parsed);

        } catch (err: any) {
            if (retryCount < 1 && (err.name === 'AbortError' || err.message.includes('timeout'))) {
                return startGemini(retryCount + 1);
            }
            throw err;
        }
    };

    // 4. --- PROVIDER 2: OPENROUTER (Ultra-Resilient Fallback) ---
    const startORReasoning = async (): Promise<LegalAnalysis> => {
        // Longer stagger for fallbacks to avoid key saturation
        const stagger = 4500 + (Math.random() * 1000);
        await new Promise(resolve => setTimeout(resolve, stagger));
        if (winnerFound || !orKey) throw new Error("OR_SKIPPED");

        console.log("[Analyzer] Primary latency high. Activating OR fallback cluster...");

        const client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: orKey,
            defaultHeaders: { "HTTP-Referer": "https://legallens.ai", "X-Title": "LegalLens AI" }
        });

        // Truly free and high-limit models reordered for maximum success
        const models = [
            'google/gemini-2.0-flash-lite-preview-02-05:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen-2.5-72b-instruct:free',
            'meta-llama/llama-3.1-405b-instruct:free',
            'deepseek/deepseek-r1:free', // Last as it's often 429ing
            'google/gemma-3-27b-it:free'
        ];

        for (const model of models) {
            if (winnerFound) break;
            try {
                console.log(`[Analyzer] Attempting ${model}...`);
                const completion = await client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: ANALYSIS_PROMPT_SYSTEM },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" }
                }, { timeout: 25000 });

                const raw = completion.choices?.[0]?.message?.content;
                if (!raw) continue;

                const parsed = JSON.parse(raw);
                winnerFound = true;
                console.log(`[Analyzer] 🏆 ${model} Successfully Analyzed.`);
                return sanitizeAnalysis(parsed);
            } catch (err: any) {
                console.warn(`[Analyzer] ❌ ${model} failed:`, err.message);
                if (err.status === 429) await new Promise(r => setTimeout(r, 1000));
            }
        }
        throw new Error("ALL_FALLBACKS_FAILED");
    };

    // 5. --- EXECUTION & ERROR BRANCHING ---
    try {
        const result = await Promise.any([startGemini(), startORReasoning()]);
        return result;
    } catch (e: any) {
        // Safe error info extraction
        const allErrors = e.errors || [e];
        const errorMessages = allErrors.map((err: any) => err.message || String(err)).join(" | ");
        const errorStatuses = allErrors.map((err: any) => err.status || err.code || "N/A").join(", ");

        console.error("[Analyzer] FATAL: All routes failed.", { message: e.message, statuses: errorStatuses });

        const isRateLimit = allErrors.some((err: any) => err.status === 429 || err.message?.includes("429"));
        const isNetwork = allErrors.some((err: any) => err.message?.toLowerCase().includes("network") || err.message?.toLowerCase().includes("timeout"));

        let errorType = "General Service Error";
        let detail = `Error Details: ${errorMessages.substring(0, 100)}...`;

        if (isRateLimit) {
            errorType = "Rate Limit (429)";
            detail = "The AI providers are receiving too many requests. Please wait a moment and try again.";
        } else if (isNetwork) {
            errorType = "Connection Timeout";
            detail = "The request took too long or the connection was lost. Check your internet.";
        }

        return {
            summary_simple: `[ANALYSIS BUSY]\n• Status: ${errorType}\n• Detail: ${detail}`,
            what_it_means: ["The analysis could not be completed at this time.", "Your document data is safe, but AI processing is temporarily congested."],
            key_clauses: [{ title: "Analysis Interrupted", explanation: detail, risk: "High" }],
            red_flags: [{ reason: "Service currently unavailable.", severity: "Medium" }],
            documents_required: [],
            error: errorType // This will trigger the error branch in components/DragDropUpload.tsx
        };
    }
}

/**
 * Deterministic fingerprint for caching
 */
function generateFingerprint(text: string): string {
    let hash = 0;
    const sample = text.length > 2000 ? text.substring(0, 1000) + text.substring(text.length - 1000) : text;
    for (let i = 0; i < sample.length; i++) {
        const char = sample.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}
