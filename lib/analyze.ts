'use server';

/**
 * LEGAL ANALYSIS ENGINE (Version 13.1 - Vercel Optimized)
 * 
 * Parallel Racing Strategy to beat Vercel's 10s timeout limit.
 */

export interface LegalAnalysis {
    summary_simple: string;
    what_it_means: string[];
    key_clauses: Array<{ title: string; explanation: string; risk: string }>;
    red_flags: Array<{ reason: string; severity: string }>;
    documents_required: Array<{ name: string; purpose: string; how_to_obtain: string[] }>;
}

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

export const analyzeLegalText = async (text: string): Promise<LegalAnalysis> => {
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

    // --- STRATEGY: STAGGERED RACING (Saves API Calls) ---
    // We start Gemini immediately. We only start OpenRouter if Gemini is slow (>3s).

    let winnerFound = false;

    const startGemini = async (): Promise<LegalAnalysis> => {
        if (!googleKey) throw new Error("No Google Key");
        console.log("[Analyzer] T+0ms: Starting Gemini...");
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
        if (!res.ok) throw new Error(`Gemini Error ${res.status}`);
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) throw new Error("Empty Gemini Response");
        winnerFound = true;
        console.log("[Analyzer] Gemini Won (Saved Fallback Costs)");
        return JSON.parse(raw);
    };

    const startORFallback = async (): Promise<LegalAnalysis> => {
        // Wait 3 seconds to see if Gemini finishes first (prevents redundant calls)
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (winnerFound) return new Promise(() => { }); // Abort if Gemini already won

        console.log("[Analyzer] T+3000ms: Gemini slow/failed, starting OpenRouter race...");
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
                signal: AbortSignal.timeout(6000) // Shorter timeout for fallback
            });
            if (!res.ok) throw new Error(`OR ${model} Fail`);
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content;
            if (!raw) throw new Error("Empty OR");
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
            winnerFound = true;
            console.log(`[Analyzer] ${model} Won Fallback Race`);
            return JSON.parse(jsonStr);
        })());

        return await Promise.any(orRace);
    };

    try {
        if (!googleKey && !orKey) throw new Error("No Keys");

        // Race the primary attempt vs the staggered fallback
        const result = await Promise.any([startGemini(), startORFallback()]);
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
};
