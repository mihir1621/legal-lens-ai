/* [LegalLens Compare API v3.0 - Mirroring main 'analyze' engine exactly] */
import OpenAI from "openai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const COMPARE_SYSTEM_PROMPT = `Analyze two legal document versions and return a JSON comparison.
JSON Format:
{
  "summary": "Overall summary",
  "total_changes": 0,
  "risk_change": "Increased | Decreased | Unchanged",
  "changes": [{"clause": "Name", "type": "Added|Removed|Modified", "original": "...", "revised": "...", "impact": "...", "severity": "High|Medium|Low"}],
  "risk_analysis": {"original_risk": "Low|Medium|High", "revised_risk": "Low|Medium|High", "details": []},
  "recommendations": []
}
Rules: 1. Be concise. 2. Identify all meaningful changes. 3. Return JSON only.`;

function standardizeResult(parsed) {
    return {
        summary: parsed.summary || "Comparison completed.",
        total_changes: parsed.total_changes || (parsed.changes?.length || 0),
        risk_change: parsed.risk_change || "Unchanged",
        changes: (parsed.changes || []).map(c => ({
            clause: c.clause || "General",
            type: c.type || "Modified",
            original: c.original || "N/A",
            revised: c.revised || "N/A",
            impact: c.impact || "No significant impact detected.",
            severity: c.severity || "Low"
        })),
        risk_analysis: {
            original_risk: parsed.risk_analysis?.original_risk || "Medium",
            revised_risk: parsed.risk_analysis?.revised_risk || "Medium",
            details: parsed.risk_analysis?.details || []
        },
        recommendations: parsed.recommendations || []
    };
}

/**
 * OCR extraction mirroring lib/analyze.ts vision handling
 */
async function extractTextViaVision(imageDataStr, googleKey, fileName) {
    const parts = imageDataStr.replace('IMAGE_DATA:', '').split(';base64,');
    if (parts.length !== 2) throw new Error("INVALID_IMAGE_DATA_FORMAT");
    
    const mimeType = parts[0];
    const base64Data = parts[1];

    console.log(`[Compare-Engine] OCR-ing "${fileName}" via Gemini 1.5 Pro...`);

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Extract all text from this image.` },
                        { inlineData: { mimeType, data: base64Data } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
            }),
            signal: AbortSignal.timeout(25000)
        }
    );

    if (!res.ok) throw new Error(`VISION_FAILED_${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("VISION_EMPTY");

    return text.trim();
}

export async function POST(req) {
    try {
        const { textA, textB, fileNameA, fileNameB } = await req.json();

        if (!textA || !textB) {
            return Response.json({ error: "Missing document data." }, { status: 400 });
        }

        // --- 1. COLLECT API KEYS ---
        const googleKey = (
            process.env.GOOGLE_API_KEY ||
            process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
            process.env.GEMINI_API_KEY ||
            process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
            ""
        ).replace(/["']/g, "").trim();

        const orKeys = [
            process.env.OPENROUTER_API_KEY,
            process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            process.env.NEXT_PUBLIC_API_KEY,
            process.env.NEXT_PUBLIC_APIKEY,
            process.env.OPENROUTER_KEY
        ].map(k => (k || "").replace(/["']/g, "").trim()).filter(k => k.length > 5);

        console.log(`[Compare-Engine] Key present: ${googleKey.length > 0}. OR keys: ${orKeys.length}`);

        if (!googleKey && orKeys.length === 0) {
            return Response.json({ error: "NO_FUNCTIONAL_API_KEYS" }, { status: 500 });
        }

        // --- 2. VISION RESOLUTION ---
        let resolvedA = textA;
        let resolvedB = textB;

        if (textA.startsWith('IMAGE_DATA:')) {
            resolvedA = await extractTextViaVision(textA, googleKey, fileNameA);
        }
        if (textB.startsWith('IMAGE_DATA:')) {
            resolvedB = await extractTextViaVision(textB, googleKey, fileNameB);
        }

        const userPrompt = `Compare these two document versions. Return JSON.
ORIGINAL: ${resolvedA.substring(0, 4000)}
REVISED: ${resolvedB.substring(0, 4000)}`;

        let winnerFound = false;

        // --- 3. PROVIDER 1: GEMINI 1.5 PRO ---
        const startGemini = async (retryCount = 0) => {
            if (!googleKey) throw new Error("GEMINI_DISABLED");

            try {
                console.log(`[Compare-Engine] Querying Gemini 1.5 Pro (Attempt ${retryCount + 1})...`);
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${COMPARE_SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                temperature: 0.1,
                                maxOutputTokens: 2000
                            }
                        }),
                        signal: AbortSignal.timeout(30000)
                    }
                );

                if (res.status === 429 && retryCount < 1) {
                    await new Promise(r => setTimeout(r, 2000));
                    return startGemini(retryCount + 1);
                }

                if (!res.ok) throw new Error(`GEMINI_ERR_${res.status}`);
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!raw) throw new Error("GEMINI_EMPTY");

                winnerFound = true;
                return standardizeResult(JSON.parse(raw));
            } catch (err) {
                if (retryCount < 1 && (err.name === 'AbortError' || err.message?.includes('timeout'))) {
                    return startGemini(retryCount + 1);
                }
                throw err;
            }
        };

        // --- 4. PROVIDER 2: OPENROUTER ---
        const startORFallback = async () => {
            const stagger = 8000 + (Math.random() * 2000);
            await new Promise(resolve => setTimeout(resolve, stagger));
            if (winnerFound || orKeys.length === 0) throw new Error("OR_SKIPPED");

            const models = [
                'google/gemini-2.0-flash-lite-preview-02-05:free',
                'meta-llama/llama-3.3-70b-instruct:free',
                'qwen/qwen-2.5-72b-instruct:free',
                'google/gemini-1.5-flash',
                'google/gemini-2.0-flash-exp:free'
            ];

            for (const currentKey of orKeys) {
                if (winnerFound) break;

                const client = new OpenAI({
                    apiKey: currentKey,
                    baseURL: 'https://openrouter.ai/api/v1',
                    defaultHeaders: { "HTTP-Referer": "https://legallens.ai", "X-Title": "LegalLens AI" }
                });

                for (const model of models) {
                    if (winnerFound) break;
                    try {
                        console.log(`[Compare-Engine] Fallback trying ${model}...`);
                        const completion = await client.chat.completions.create({
                            model: model,
                            messages: [
                                { role: "system", content: COMPARE_SYSTEM_PROMPT },
                                { role: "user", content: userPrompt }
                            ],
                            response_format: { type: "json_object" }
                        }, { timeout: 35000 });

                        const raw = completion.choices?.[0]?.message?.content;
                        if (!raw) continue;

                        winnerFound = true;
                        return standardizeResult(JSON.parse(raw));
                    } catch (err) {
                        console.warn(`[Compare-Engine] ${model} failed:`, err.message);
                        if (err.status === 429) await new Promise(r => setTimeout(r, 1500));
                    }
                }
            }
            throw new Error("ALL_PROVIDERS_FAILED");
        };

        // --- 5. EXECUTION RACING ---
        try {
            const result = await Promise.race([startGemini(), startORFallback()]);
            return Response.json({ result });
        } catch (e) {
            console.error("[Compare-Engine] FATAL: All providers failed.");
            return Response.json({ error: "High traffic. Please try again in 10 seconds." }, { status: 500 });
        }

    } catch (error) {
        console.error("[Compare-Engine] Final Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
