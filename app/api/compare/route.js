/* [LegalLens Compare API v2.0 - Gemini Primary + OpenRouter Fallback] */
import OpenAI from "openai";

export const maxDuration = 60;

const COMPARE_SYSTEM_PROMPT = `You are a Senior Legal Document Comparison Specialist. Compare two versions of a legal document and identify every meaningful change.

STRICT JSON OUTPUT FORMAT:
{
  "summary": "A 2-3 sentence overview of what changed between the two documents.",
  "total_changes": <number>,
  "risk_change": "Increased | Decreased | Unchanged",
  "changes": [
    {
      "clause": "Name or section of the clause that changed",
      "type": "Added | Removed | Modified",
      "original": "Original text or 'N/A' if added",
      "revised": "New text or 'N/A' if removed",
      "impact": "Brief explanation of legal impact",
      "severity": "High | Medium | Low"
    }
  ],
  "risk_analysis": {
    "original_risk": "Low | Medium | High",
    "revised_risk": "Low | Medium | High",
    "details": ["Point 1 about risk change", "Point 2"]
  },
  "recommendations": ["Actionable recommendation 1", "Recommendation 2", "Recommendation 3"]
}

STRICT ANALYTICAL RULES:
1. Identify ALL meaningful differences — clause additions, removals, modifications.
2. For each change, clearly state the original vs revised text.
3. Assess how each change affects the user's legal position.
4. Be aggressive in flagging unfavorable changes.
5. Keep explanations short and direct — no essays.
6. If the documents appear to be completely different (not versions of each other), still compare their key terms and highlight the differences.
7. ALWAYS output in English, even if the input documents are in another language.`;

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

export async function POST(req) {
    try {
        const { textA, textB, fileNameA, fileNameB } = await req.json();

        if (!textA || !textB) {
            return Response.json({ error: "Both documents are required for comparison." }, { status: 400 });
        }

        console.log(`[Compare] Processing: "${fileNameA}" vs "${fileNameB}"`);

        const truncatedA = textA.substring(0, 10000);
        const truncatedB = textB.substring(0, 10000);

        const userPrompt = `Compare these two legal documents and identify every meaningful change.

DOCUMENT A (Original — "${fileNameA}"):
${truncatedA}

DOCUMENT B (Revised — "${fileNameB}"):
${truncatedB}

Return JSON only.`;

        // --- Collect API Keys (same as lib/analyze.ts) ---
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
            process.env.NEXT_PUBLIC_APIKEY,
            process.env.OPENROUTER_KEY
        ].map(k => (k || "").replace(/["']/g, "").trim()).filter(k => k.length > 10);

        if (!googleKey && orKeys.length === 0) {
            return Response.json({ error: "No functional API keys configured." }, { status: 500 });
        }

        let winnerFound = false;

        // === PROVIDER 1: GEMINI (Primary — Most Accurate) ===
        const startGemini = async (retryCount = 0) => {
            if (!googleKey) throw new Error("GEMINI_DISABLED");

            try {
                console.log(`[Compare] Querying Gemini (Attempt ${retryCount + 1})...`);

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `${COMPARE_SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                temperature: 0.1,
                                maxOutputTokens: 3000
                            }
                        }),
                        signal: AbortSignal.timeout(20000)
                    }
                );

                if (res.status === 429 && retryCount < 1) {
                    console.warn("[Compare] Gemini 429. Retrying in 2s...");
                    await new Promise(r => setTimeout(r, 2000));
                    return startGemini(retryCount + 1);
                }

                if (!res.ok) throw new Error(`GEMINI_REJECTED_${res.status}`);
                const data = await res.json();
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!raw) throw new Error("GEMINI_EMPTY");

                const parsed = JSON.parse(raw);
                winnerFound = true;
                console.log("[Compare] 🏆 Gemini Successfully Compared.");
                return standardizeResult(parsed);
            } catch (err) {
                if (retryCount < 1 && (err.name === 'AbortError' || err.message?.includes('timeout'))) {
                    return startGemini(retryCount + 1);
                }
                throw err;
            }
        };

        // === PROVIDER 2: OPENROUTER (Fallback Cluster) ===
        const startORFallback = async () => {
            const stagger = 6000 + (Math.random() * 1500);
            await new Promise(resolve => setTimeout(resolve, stagger));
            if (winnerFound || orKeys.length === 0) throw new Error("OR_SKIPPED");

            console.log(`[Compare] Gemini slow. Activating OR fallback with ${orKeys.length} keys...`);

            const models = [
                'google/gemini-2.0-flash-lite-preview-02-05:free',
                'meta-llama/llama-3.3-70b-instruct:free',
                'qwen/qwen-2.5-72b-instruct:free',
                'google/gemma-3-27b-it:free'
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
                        console.log(`[Compare] Attempting ${model}...`);
                        const completion = await client.chat.completions.create({
                            model: model,
                            messages: [
                                { role: "system", content: COMPARE_SYSTEM_PROMPT },
                                { role: "user", content: userPrompt }
                            ],
                            response_format: { type: "json_object" }
                        }, { timeout: 30000 });

                        const raw = completion.choices?.[0]?.message?.content;
                        if (!raw) continue;

                        const parsed = JSON.parse(raw);
                        winnerFound = true;
                        console.log(`[Compare] 🏆 ${model} Successfully Compared.`);
                        return standardizeResult(parsed);
                    } catch (err) {
                        console.warn(`[Compare] ❌ ${model} failed:`, err.message);
                        if (err.status === 429) await new Promise(r => setTimeout(r, 1500));
                    }
                }
            }
            throw new Error("ALL_FALLBACKS_FAILED");
        };

        // === EXECUTION: Race Gemini vs OpenRouter ===
        try {
            const result = await Promise.any([startGemini(), startORFallback()]);
            return Response.json({ result });
        } catch (e) {
            const allErrors = e.errors || [e];
            const errorMessages = allErrors.map(err => err.message || String(err)).join(" | ");
            const isRateLimit = allErrors.some(err => err.status === 429 || err.message?.includes("429"));

            console.error("[Compare] FATAL: All routes failed.", errorMessages);

            return Response.json({
                error: isRateLimit
                    ? "AI providers are busy. Please wait a moment and try again."
                    : `Comparison failed: ${errorMessages.substring(0, 150)}`
            }, { status: 500 });
        }

    } catch (error) {
        console.error("[Compare] Final Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
