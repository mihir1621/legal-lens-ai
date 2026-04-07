import { OpenAI } from 'openai';

/**
 * ULTRA-RESILIENT FREE LEGAL COMPARE API
 * Combines OpenRouter (Free) and Direct Google Gemini (Free Tier)
 */

const SYSTEM_PROMPT = `Compare two legal cases or document versions.
Output ONLY valid JSON in this schema:
{
  "case1_summary": "Concise summary 1",
  "case2_summary": "Concise summary 2",
  "similarities": ["Point 1"],
  "differences": ["Contrast 1"],
  "final_verdict": "Strategic verdict."
}`;

export async function POST(req: Request) {
    try {
        const { case1, case2 } = await req.json();
        
        const orKey = (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "").trim();
        const googleKey = (process.env.GOOGLE_API_KEY || "").trim();

        const userPrompt = `COMPARE:\n1: ${case1.substring(0, 3000)}\n2: ${case2.substring(0, 3000)}`;
        let winner: any = null;
        let lastError = "";

        // --- ATTEMPT 1: DIRECT GOOGLE GEMINI (Most Reliable Free Tier) ---
        if (googleKey && !winner) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}\n\nOUTPUT JSON ONLY.` }] }],
                        generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
                    }),
                    signal: AbortSignal.timeout(15000)
                });

                if (res.ok) {
                    const data = await res.json();
                    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    raw = raw.replace(/```json/g, "").replace(/```/g, "").replace(/^[\s\S]*?{/, "{").replace(/}[^}]*$/, "}");
                    winner = JSON.parse(raw);
                } else {
                    lastError = `Google API returned ${res.status}`;
                }
            } catch (e: any) {
                lastError = `Google Error: ${e.message}`;
            }
        }

        // --- ATTEMPT 2: OPENROUTER (Free Cluster) ---
        if (orKey && !winner) {
            const orClient = new OpenAI({ apiKey: orKey, baseURL: "https://openrouter.ai/api/v1" });
            const freeModels = [
                "google/gemini-2.0-flash-lite-preview-02-05:free",
                "meta-llama/llama-3.1-8b-instruct:free",
                "mistralai/mistral-7b-instruct:free"
            ];

            for (const model of freeModels) {
                try {
                    const res = await orClient.chat.completions.create({
                        model,
                        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }],
                        max_tokens: 800
                    }, { timeout: 20000 });

                    let raw = res.choices[0]?.message?.content || "";
                    raw = raw.replace(/```json/g, "").replace(/```/g, "").replace(/^[\s\S]*?{/, "{").replace(/}[^}]*$/, "}");
                    winner = JSON.parse(raw);
                    if (winner) break;
                } catch (e: any) {
                    lastError = `OpenRouter (${model.split('/').pop()}): ${e.message}`;
                }
            }
        }

        if (!winner) {
            throw new Error(lastError || "All free providers (Google & OpenRouter) failed.");
        }

        return Response.json({ result: winner });

    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
