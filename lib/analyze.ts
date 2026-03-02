'use server';

import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { LegalAnalysis } from './types';
import OpenAI from 'openai';

/**
 * LEGAL ANALYSIS ENGINE (Version 15.0 - Reasoning & History Optimized)
 * 
 * Features:
 * 1. Gemini 2.0 Flash (Primary - Zero Latency)
 * 2. OpenRouter Reasoning Models (Fallback - Sequential)
 * 3. Firestore Fingerprint Caching (Cost & Rate Limit Prevention)
 * 4. Automatic History Storage Integration
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

export async function analyzeLegalText(text: string, userId?: string): Promise<LegalAnalysis> {
    const isVisionMode = text.startsWith('IMAGE_DATA:');
    let cleanedText = text.trim();

    // 1. --- INTELLIGENT CACHE CHECK (Prevents Duplicate API Calls) ---
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
                return querySnapshot.docs[0].data().analysis;
            }
        } catch (cacheErr) {
            console.warn("[Analyzer] ⚠️ History lookup failed:", cacheErr);
        }
    }

    // 2. --- SETUP API KEYS ---
    const googleKey = (process.env.GOOGLE_API_KEY || "").replace(/["']/g, "").trim();
    const orKey = (
        process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
        process.env['NEXT_PUBLIC_OPENROUTER-API-KEY'] ||
        process.env.NEXT_PUBLIC_APIKEY ||
        ""
    ).replace(/["']/g, "").trim();

    if (!googleKey && !orKey) throw new Error("NO_FUNCTIONAL_API_KEYS");

    const userPrompt = `Analyze this legal document. ${isVisionMode ? "READ THE IMAGE VISUALLY." : `DOC TEXT: ${cleanedText.substring(0, 5000)}`}\n\nReturn JSON only.`;
    let winnerFound = false;

    // 3. --- PROVIDER 1: GEMINI (High Speed) ---
    const startGemini = async (): Promise<LegalAnalysis> => {
        if (!googleKey) throw new Error("GEMINI_DISABLED");
        console.log("[Analyzer] Querying Gemini 2.0 Flash...");

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
            signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) throw new Error(`GEMINI_REJECTED_${res.status}`);
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) throw new Error("GEMINI_EMPTY");

        try {
            const parsed = JSON.parse(raw);
            winnerFound = true;
            console.log("[Analyzer] 🏆 Gemini Successfully Analyzed.");
            return parsed;
        } catch {
            throw new Error("GEMINI_INVALID_JSON");
        }
    };

    // 4. --- PROVIDER 2: OPENROUTER REASONING (Deep Analysis Fallback) ---
    const startORReasoning = async (): Promise<LegalAnalysis> => {
        // Staggered delay to prioritize Gemini (Saves OR Credits)
        await new Promise(resolve => setTimeout(resolve, 3800));
        if (winnerFound || !orKey) throw new Error("OR_SKIPPED_OR_DISABLED");

        console.log("[Analyzer] Gemini latency high. Switching to OR Reasoning Model...");

        const client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: orKey,
            defaultHeaders: {
                "HTTP-Referer": "https://legal-lens-ai-three.vercel.app",
                "X-Title": "LegalLens AI"
            }
        });

        // Reasoning models provided by user + deep fallbacks
        const models = ['openai/gpt-oss-120b:free', 'google/gemma-3-27b-it:free', 'deepseek/deepseek-r1:free'];

        for (const model of models) {
            if (winnerFound) break;
            try {
                console.log(`[Analyzer] Deep Thinking with ${model}...`);
                const completion: any = await client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: ANALYSIS_PROMPT_SYSTEM },
                        { role: "user", content: userPrompt }
                    ]
                });

                const raw = completion.choices?.[0]?.message?.content;
                if (!raw) continue;

                try {
                    const parsed = JSON.parse(raw);
                    winnerFound = true;
                    console.log(`[Analyzer] 🏆 ${model} (Reasoning) Successfully Analyzed.`);
                    return parsed;
                } catch {
                    console.warn(`[Analyzer] ❌ ${model} returned invalid JSON`);
                    continue;
                }
            } catch (err: any) {
                console.warn(`[Analyzer] ❌ ${model} failed:`, err.message);
                if (err.status === 429) {
                    console.log("[Analyzer] Rate Limit Hit. Cooling down...");
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
        throw new Error("ALL_MODELS_CONGESTED");
    };

    // 5. --- EXECUTION ---
    try {
        const result = await Promise.any([startGemini(), startORReasoning()]);
        return result;
    } catch (e: any) {
        // Collect all error info
        const allErrors = e.errors || [e];
        const errorMessages = allErrors.map((err: any) => err.message || String(err)).join(" | ");
        const errorStatuses = allErrors.map((err: any) => err.status || err.code || "N/A").join(", ");

        console.error("[Analyzer] FATAL: All AI routes failed.", {
            message: e.message,
            details: errorMessages,
            statuses: errorStatuses
        });

        const isRateLimit = allErrors.some((err: any) => err.status === 429 || err.message?.includes("429") || err.message?.includes("rate limit"));
        const isNetwork = allErrors.some((err: any) =>
            err.message?.toLowerCase().includes("network") ||
            err.message?.toLowerCase().includes("timeout") ||
            err.message?.includes("ETIMEDOUT") ||
            err.code === 'UND_ERR_CONNECT_TIMEOUT'
        );

        let summary = "The analysis could not be completed.";
        let implications = ["AI providers are currently unavailable or under heavy load."];
        let errorType = "General Error";

        if (isRateLimit) {
            errorType = "Rate Limit (429)";
            summary = "API Rate Limit reached. The system is cooling down.";
            implications = ["AI providers are receiving too many requests. Please wait 30 seconds and try again."];
        } else if (isNetwork) {
            errorType = "Network/Timeout";
            summary = "Network connectivity issue or request timeout.";
            implications = ["The connection to AI services was interrupted. Please check your internet connection."];
        } else {
            summary = `Provider Error: ${allErrors[0]?.message || "All routes congested"}`;
            implications = [
                `Technical Cause: ${errorMessages.substring(0, 150)}`,
                "This usually happens when AI models are overloaded or API keys are invalid."
            ];
        }

        return {
            summary_simple: `[ANALYSIS BUSY]\n• Error: ${errorType}\n• Detail: ${summary}\n• Action: Please retry in a few moments.`,
            what_it_means: implications,
            key_clauses: [{ title: "Limit Reached", explanation: summary, risk: "High" }],
            red_flags: [{ reason: "Service unavailable. Please refresh.", severity: "Medium" }],
            documents_required: []
        };
    }
}

/**
 * Generates a simple deterministic fingerprint for text caching
 */
function generateFingerprint(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}
