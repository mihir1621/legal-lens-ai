'use server';

/**
 * LEGAL ANALYSIS ENGINE (Version 13.0 - Vercel Optimized)
 * 
 * Parallel Racing Strategy to beat Vercel's 10s timeout limit.
 */

interface LegalAnalysis {
    summary_simple: string;
    what_it_means: string[];
    key_clauses: Array<{ title: string; explanation: string; risk: string }>;
    red_flags: Array<{ reason: string; severity: string }>;
    documents_required: Array<{ name: string; purpose: string; how_to_obtain: string[] }>;
}

const ANALYSIS_PROMPT_SYSTEM = `You are a Senior Legal Strategist. Provide a "Full Clarification" of the document.
ALWAYS respond in SIMPLE, SHORT, and CLEAR English. Avoid complex legalese.

STRICT RULES FOR CONTENT:
1. "summary_simple": Point-wise description (Bullet points •). New line for each. Limit 500 chars.
2. "key_clauses": Short sentences only.
3. "red_flags": Max 10 words per reason.

STRICT JSON OUTPUT ONLY (NO CHAT):
{
    "summary_simple": "...",
    "what_it_means": ["..."],
    "key_clauses": [{"title": "...", "explanation": "...", "risk": "..."}],
    "red_flags": [{"reason": "...", "severity": "..."}],
    "documents_required": [{"name": "...", "purpose": "...", "how_to_obtain": ["..."]}]
}`;

export async function analyzeLegalText(text: string): Promise<LegalAnalysis> {
    const isVisionMode = text.startsWith('IMAGE_DATA:');
    let base64Data = '';
    let mimeType = '';
    let cleanedText = text;

    if (isVisionMode) {
        const parts = text.split(';base64,');
        mimeType = parts[0].replace('IMAGE_DATA:', '');
        base64Data = parts[1];
    } else {
        cleanedText = text.trim();
        if (cleanedText.length === 0) {
            return { summary_simple: "Empty document.", what_it_means: [], key_clauses: [], red_flags: [], documents_required: [] };
        }
    }

    const googleKey = (process.env.GOOGLE_API_KEY || "").replace(/["']/g, "").trim();
    const orKey = (process.env.NEXT_PUBLIC_APIKEY || "").replace(/["']/g, "").trim();

    // We only take the first 6k chars to stay fast and under token limits for free models
    const userPrompt = `Analyze this legal document. ${isVisionMode ? "READ THE IMAGE VISUALLY." : `DOC TEXT: ${cleanedText.substring(0, 6000)}`}\n\nReturn JSON.`;

    console.log(`[Analyzer] Racing Gemini & OpenRouter (Vercel Mode)`);

    // --- STRATEGY: PARALLEL RACE ---
    // We send requests to multiple providers simultaneously. First valid result within 8.5s wins.

    const providers: Promise<LegalAnalysis>[] = [];

    // 1. Direct Gemini Provider
    if (googleKey) {
        providers.push((async () => {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: isVisionMode
                        ? [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }, { inlineData: { mimeType, data: base64Data } }] }]
                        : [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 1500 }
                }),
                signal: AbortSignal.timeout(8500)
            });
            if (!res.ok) throw new Error(`Gemini Error ${res.status}`);
            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!raw) throw new Error("Empty Gemini Response");
            console.log("[Analyzer] Gemini Won the race!");
            return JSON.parse(raw);
        })());
    }

    // 2. OpenRouter Provider (Gemma-3 is fastest for legal)
    if (orKey) {
        providers.push((async () => {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${orKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://legal-lens-ai-three.vercel.app",
                    "X-Title": "LegalLens AI"
                },
                body: JSON.stringify({
                    model: "google/gemma-3-27b-it:free",
                    messages: [{ role: "system", content: ANALYSIS_PROMPT_SYSTEM }, { role: "user", content: userPrompt }],
                    temperature: 0.1,
                    max_tokens: 1500
                }),
                signal: AbortSignal.timeout(8500)
            });
            if (!res.ok) throw new Error(`OpenRouter Error ${res.status}`);
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content;
            if (!raw) throw new Error("Empty OR Response");
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
            console.log("[Analyzer] OpenRouter Won the race!");
            return JSON.parse(jsonStr);
        })());
    }

    try {
        const result = await Promise.any(providers);
        return result;
    } catch (e) {
        console.error("[Analyzer] All provider attempts failed or timed out:", e);

        // ULTIMATE FALLBACK: Return structured preview if all else fails
        return {
            summary_simple: `[FAST PREVIEW]\n• Analysis timed out on Vercel.\n• Document detected: ${isVisionMode ? 'Image/Scan' : 'Text'}.\n• Content length: ${cleanedText.length} characters.`,
            what_it_means: [
                "The legal AI engine is busy. Please try a smaller snippet of text.",
                "Check your API keys in Vercel settings if this keeps happening."
            ],
            key_clauses: [{ title: "Timeout", explanation: "The AI was too slow for Vercel's 10s limit.", risk: "High" }],
            red_flags: [{ reason: "Cloud rate limit or timeout.", severity: "Medium" }],
            documents_required: []
        };
    }
}
