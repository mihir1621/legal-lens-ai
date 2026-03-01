'use server';

import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { LegalAnalysis } from './types';

/**
 * LEGAL ANALYSIS ENGINE (Version 14.1 - Cache Optimized)
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

// Vercel Limit: Hobby = 10s, Pro = 60s
export async function analyzeLegalText(text: string, userId?: string): Promise<LegalAnalysis> {
    const isVisionMode = text.startsWith('IMAGE_DATA:');
    let cleanedText = text.trim();

    // 1. --- CHECK CACHE (Saves API Calls) ---
    if (userId && !isVisionMode && cleanedText.length > 100) {
        try {
            console.log(`[Analyzer] Checking cache for user: ${userId}`);
            const snippet = cleanedText.substring(0, 500);
            const q = query(
                collection(db, "documents"),
                where("userId", "==", userId),
                where("isAnalysis", "==", true),
                where("fingerprint", "==", snippet),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                console.log("[Analyzer] CACHE HIT! Serving previous analysis.");
                return querySnapshot.docs[0].data().analysis;
            }
        } catch (cacheErr) {
            console.warn("[Analyzer] Cache check skipped:", cacheErr);
        }
    }

    let base64Data = '';
    let mimeType = '';

    if (isVisionMode) {
        const parts = text.split(';base64,');
        mimeType = parts[0].replace('IMAGE_DATA:', '');
        base64Data = parts[1];
    } else {
        if (cleanedText.length === 0) {
            return { summary_simple: "Empty document.", what_it_means: [], key_clauses: [], red_flags: [], documents_required: [] };
        }
    }

    const googleKey = (process.env.GOOGLE_API_KEY || "").replace(/["']/g, "").trim();
    const orKey = (
        process.env['NEXT_PUBLIC_OPENROUTER_API_KEY'] ||
        process.env.NEXT_PUBLIC_API_KEY ||
        process.env.NEXT_PUBLIC_APIKEY ||
        ""
    ).replace(/["']/g, "").trim();

    console.log(`[Analyzer] Service Initiation - Google: ${googleKey ? 'YES' : 'NO'}, OR: ${orKey ? 'YES' : 'NO'}`);

    const userPrompt = `Analyze this legal document. ${isVisionMode ? "READ THE IMAGE VISUALLY." : `DOC TEXT: ${cleanedText.substring(0, 5000)}`}\n\nReturn JSON.`;

    let winnerFound = false;

    const startGemini = async (): Promise<LegalAnalysis> => {
        if (!googleKey) throw new Error("Missing Google Key");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: isVisionMode
                    ? [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }, { inlineData: { mimeType, data: base64Data } }] }]
                    : [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 1500 }
            }),
            signal: AbortSignal.timeout(9500)
        });
        if (!res.ok) throw new Error(`Gemini status ${res.status}`);
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) throw new Error("Empty Gemini Response");
        winnerFound = true;
        return JSON.parse(raw);
    };

    const startORFallback = async (): Promise<LegalAnalysis> => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (winnerFound || !orKey) return new Promise(() => { });

        console.log("[Analyzer] Starting OpenRouter (Fallback Race)...");
        const orModels = ["google/gemma-3-27b-it:free", "qwen/qwen-2.5-72b-instruct:free"];

        const orRace = orModels.map(model => (async () => {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${orKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://legal-lens-ai-three.vercel.app",
                    "X-Title": "LegalLens AI"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "system", content: ANALYSIS_PROMPT_SYSTEM }, { role: "user", content: userPrompt }],
                    temperature: 0.1,
                    max_tokens: 1500
                }),
                signal: AbortSignal.timeout(6000)
            });
            if (!res.ok) throw new Error(`OR ${model} Error`);
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content;
            if (!raw) throw new Error(`Empty ${model} Response`);
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
            winnerFound = true;
            return JSON.parse(jsonStr);
        })());

        return await Promise.any(orRace);
    };

    try {
        if (!googleKey && !orKey) throw new Error("No functional API keys configured.");
        const result = await Promise.any([startGemini(), startORFallback()]);
        return result;
    } catch (e: any) {
        console.error("[Analyzer] All routes failed:", e);
        return {
            summary_simple: `[ANALYSIS BUSY]\n• Error: API Rate Limit reached.\n• Cloud Provider: GEMINI/OPENROUTER.`,
            what_it_means: ["The AI services are at capacity. Please refresh in 30 seconds."],
            key_clauses: [{ title: "Service Busy", explanation: "AI could not reach a decision within the time limit.", risk: "High" }],
            red_flags: [{ reason: "Cloud rate limit reached.", severity: "Medium" }],
            documents_required: []
        };
    }
}
