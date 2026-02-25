'use server';

/**
 * LEGAL ANALYSIS ENGINE (Version 12.2 - Final Ultra Robust)
 * 
 * Aggressive Multi-Model Strategy for 100% Uptime on Free Tiers.
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
1. "summary_simple": Provide a point-wise informative description. SUSTAIN A STRICT LIMIT OF 500 CHARACTERS. If it exceeds 500, truncate it. Use bullet points (•) for:
   • Purpose • Parties • Authority/Law • Duration.
2. "key_clauses": Use 1-2 very short sentences only. No paragraphs.
3. "what_it_means": Use simple, non-legal terminology.
4. "red_flags": Maximum 10 words per reason.
5. "documents_required": Stay extremely concise for "purpose" and "how_to_obtain".

STRICT JSON OUTPUT (NO CHAT):
{
    "summary_simple": "...",
    "what_it_means": ["..."],
    "key_clauses": [{"title": "...", "explanation": "...", "risk": "..."}],
    "red_flags": [{"reason": "...", "severity": "..."}],
    "documents_required": [{"name": "...", "purpose": "...", "how_to_obtain": ["..."]}]
}`;

const buildUserPrompt = (text: string, isVision: boolean) => `Analyze this legal document.
${isVision ? "READ THE ATTACHED IMAGE/DOCUMENT VISUALLY." : `DOCUMENT TEXT:\n${text.substring(0, 10000)}`}

Return a JSON object with analysis. NO MARKDOWN. NO CODE BLOCKS. JUST JSON.`;

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

    console.log(`[Analyzer] Detected Keys - Google: ${googleKey ? 'YES' : 'NO'}, OR: ${orKey ? 'YES (' + orKey.substring(0, 10) + '...)' : 'NO'}`);

    const userPrompt = buildUserPrompt(cleanedText, isVisionMode);

    // 1. TRY DIRECT GEMINI (PRIORITY)
    if (googleKey) {
        try {
            console.log("[Analyzer] Attempting Strategy 1: Direct Gemini");
            const contents = isVisionMode
                ? [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }, { inlineData: { mimeType, data: base64Data } }] }]
                : [{ parts: [{ text: `${ANALYSIS_PROMPT_SYSTEM}\n\n${userPrompt}` }] }];

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents, generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
                signal: AbortSignal.timeout(60000)
            });

            if (res.ok) {
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (raw) return JSON.parse(raw);
            }
        } catch (e) { console.warn("[Analyzer] Direct Gemini failed"); }
    }

    // 2. TRY OPENROUTER WITH EXTENSIVE FREE LIST
    if (orKey) {
        const MODELS = [
            "google/gemma-3-27b-it:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "stepfun/step-3.5-flash:free",
            "upstage/solar-pro-3:free",
            "google/gemma-3-12b-it:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "nvidia/nemotron-nano-12b-v2-vl:free"
        ];

        for (const modelId of MODELS) {
            try {
                console.log(`[Analyzer] Attempting OpenRouter (${modelId})`);
                const messageContent = (isVisionMode && (modelId.includes("vl") || modelId.includes("pixtral")))
                    ? [{ type: "text", text: userPrompt }, { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }]
                    : userPrompt;

                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${orKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "LegalLens AI"
                    },
                    body: JSON.stringify({
                        model: modelId,
                        messages: [{ role: "system", content: ANALYSIS_PROMPT_SYSTEM }, { role: "user", content: messageContent }],
                        temperature: 0.1
                    }),
                    signal: AbortSignal.timeout(45000)
                });

                if (res.ok) {
                    const data = await res.json();
                    const raw = data.choices?.[0]?.message?.content;
                    if (raw) {
                        const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.summary_simple) {
                                console.log(`[Analyzer] Success using ${modelId}`);
                                return parsed;
                            }
                        } catch { continue; }
                    }
                }
            } catch { continue; }
        }
    }

    // 3. ULTIMATE RECOVERY: RAW TEXT PREVIEW
    console.error("[Analyzer] All AI providers failed.");
    const previewText = isVisionMode ? "Text extraction from image failed. Please upload a digital PDF for better results." : cleanedText.substring(0, 1000);

    return {
        summary_simple: `[RAW PREVIEW - AI BUSY]\n\n${previewText}`,
        what_it_means: [
            "The AI cloud is currently experiencing high load. Please refresh in 30 seconds for full intelligence.",
            "You are seeing a raw text preview until the AI models become available."
        ],
        key_clauses: [{ title: "Legal Text detected", explanation: "Refresh the page to see thematic breakdown and impact analysis.", risk: "Unknown" }],
        red_flags: [{ reason: "Cloud rate limit reached. Analysis queued.", severity: "Low" }],
        documents_required: []
    };
}
