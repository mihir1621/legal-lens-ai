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

// Vercel Limit: Hobby = 10s, Pro = 60s
export const maxDuration = 60;

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

    console.log(`[Analyzer] Detected Keys - Google: ${googleKey ? 'YES' : 'NO'}, OR: ${orKey ? 'YES' : 'NO'}`);

    // Use first 5k chars for speed
    const userPrompt = `Analyze this legal document. ${isVisionMode ? "READ THE IMAGE VISUALLY." : `DOC TEXT: ${cleanedText.substring(0, 5000)}`}\n\nReturn JSON.`;

    // --- STRATEGY: PARALLEL RACE ---
    const providers: Promise<LegalAnalysis>[] = [];

    // 1. Direct Gemini Provider
    if (googleKey) {
        providers.push((async () => {
            console.log("[Analyzer] Starting Gemini...");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: isVisionMode
                        ? [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }, { inlineData: { mimeType, data: base64Data } }] }]
                        : [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 1500 }
                }),
                signal: AbortSignal.timeout(9000)
            });
            if (!res.ok) {
                const err = await res.text();
                console.error(`[Analyzer] Gemini HTTP Error ${res.status}:`, err);
                throw new Error(`Gemini Error ${res.status}`);
            }
            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!raw) throw new Error("Empty Gemini Response");
            console.log("[Analyzer] Gemini Won!");
            return JSON.parse(raw);
        })());
    }

    // 2. OpenRouter Provider
    if (orKey) {
        providers.push((async () => {
            console.log("[Analyzer] Starting OpenRouter (Gemma-3)...");
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
                signal: AbortSignal.timeout(9000)
            });
            if (!res.ok) {
                const err = await res.text();
                console.error(`[Analyzer] OpenRouter HTTP Error ${res.status}:`, err);
                throw new Error(`OpenRouter Error ${res.status}`);
            }
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content;
            if (!raw) throw new Error("Empty OR Response");
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
            console.log("[Analyzer] OpenRouter Won!");
            return JSON.parse(jsonStr);
        })());
    }

    try {
        if (providers.length === 0) {
            throw new Error("No API keys found in Vercel. Add GOOGLE_API_KEY or NEXT_PUBLIC_APIKEY.");
        }
        const result = await Promise.any(providers);
        return result;
    } catch (e: any) {
        console.error("[Analyzer] All routes failed:", e);

        let detailedError = e.message || "Unknown Failure";
        if (e.errors) detailedError = e.errors.map((err: any) => err.message).join(", ");

        return {
            summary_simple: `[ANALYSIS FAILED]\n• Error: ${detailedError}\n• Keys Present: Google(${googleKey ? 'Y' : 'N'}), OR(${orKey ? 'Y' : 'N'})`,
            what_it_means: [
                "The AI providers are currently unreachable from your Vercel deployment.",
                "1. Check Vercel 'Logs' tab for 'HTTP Error 401' (wrong key) or '403' (restricted key).",
                "2. Ensure GOOGLE_API_KEY is not restricted by IP in Google Cloud Console."
            ],
            key_clauses: [{ title: "Analysis Interrupted", explanation: "The server could not communicate with AI providers.", risk: "High" }],
            red_flags: [{ reason: "Service unavailable or Keys missing.", severity: "High" }],
            documents_required: []
        };
    }
}
