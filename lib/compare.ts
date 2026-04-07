'use server';

import OpenAI from "openai";

/**
 * LEGAL COMPARISON ENGINE (Final Sync Version)
 */

const SYSTEM_PROMPT = `Compare two document versions. Output JSON only.
Format:
{
  "summary": "Summary of changes",
  "total_changes": 0,
  "risk_change": "Increased|Decreased|Unchanged",
  "changes": [{"clause": "name", "type": "Added|Removed|Modified", "original": "...", "revised": "...", "impact": "...", "severity": "High|Medium|Low"}],
  "risk_analysis": {"original_risk": "Low|Medium|High", "revised_risk": "Low|Medium|High", "details": []},
  "recommendations": []
}`;

export async function compareLegalDocs(textA: string, textB: string, nameA: string, nameB: string) {
    try {
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
            process.env.NEXT_PUBLIC_API_KEY || 
            process.env.NEXT_PUBLIC_APIKEY || 
            process.env.OPENROUTER_KEY || 
            ""
        ).replace(/["']/g, "").trim();

        console.log(`[Compare-Debug] Google Key Found: ${googleKey.length > 5 ? 'YES' : 'NO'}`);
        console.log(`[Compare-Debug] OpenRouter Key Found: ${orKey.length > 5 ? 'YES' : 'NO'}`);

        const userPrompt = `Compare these versions.
Original (${nameA}): ${textA.substring(0, 4000)}
Revised (${nameB}): ${textB.substring(0, 4000)}`;

        let winner: any = null;
        const failures: string[] = [];

        // --- 1. PROMPT GEMINI (Try 1.5 PRO - Highest Authorization) ---
        if (googleKey) {
            try {
                console.log("[Compare-Debug] Attempting Gemini 1.5 Pro...");
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                        generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
                    }),
                    signal: AbortSignal.timeout(25000)
                });

                if (res.ok) {
                    const data = await res.json();
                    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (raw) {
                        raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
                        winner = JSON.parse(raw);
                        console.log("[Compare-Debug] 🏆 Gemini 1.5 Pro Success.");
                    }
                } else {
                    failures.push(`Gemini: ${res.status}`);
                }
            } catch (e: any) {
                failures.push(`Gemini Crash: ${e.message}`);
            }
        }

        // --- 2. FALLBACK TO OPENROUTER (Capped Tokens for Free Accounts) ---
        if (!winner && orKey) {
            console.log("[Compare-Debug] Activating OpenRouter Cluster (LOW TOKEN MODE)...");
            const client = new OpenAI({ apiKey: orKey, baseURL: 'https://openrouter.ai/api/v1' });
            const models = [
                "google/gemini-2.0-flash-001",
                "deepseek/deepseek-chat",
                "meta-llama/llama-3.3-70b-instruct",
                "google/gemini-2.0-flash-exp:free"
            ];

            for (const model of models) {
                try {
                    console.log(`[Compare-Debug] Trying ${model}...`);
                    const completion = await client.chat.completions.create({
                        model,
                        max_tokens: 1000, // CRITICAL: Fixes the "Affordability/Credit" error
                        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }]
                    }, { timeout: 30000 });

                    let raw = completion.choices?.[0]?.message?.content;
                    if (raw) {
                        raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
                        winner = JSON.parse(raw);
                        console.log(`[Compare-Debug] 🏆 ${model} Success.`);
                        break;
                    }
                } catch (e: any) {
                    failures.push(`${model}: ${e.message}`);
                }
            }
        }

        if (!winner) {
            throw new Error(`Comparison Failed. Log: ${failures.join(" | ")}`);
        }

        return { 
            result: {
                summary: winner.summary || "Refined comparison complete.",
                total_changes: winner.total_changes || (winner.changes?.length || 0),
                risk_change: winner.risk_change || "Check Details",
                changes: (winner.changes || []).map((c: any) => ({
                    clause: c.clause || "Section",
                    type: c.type || "Modified",
                    original: c.original || "N/A",
                    revised: c.revised || "New",
                    impact: c.impact || "Analysis provided in recommendations.",
                    severity: c.severity || "Low"
                })),
                risk_analysis: {
                    original_risk: winner.risk_analysis?.original_risk || "Medium",
                    revised_risk: winner.risk_analysis?.revised_risk || "Medium",
                    details: winner.risk_analysis?.details || []
                },
                recommendations: winner.recommendations || []
            }
        };

    } catch (error: any) {
        console.error("[Compare-Action] Fatal:", error.message);
        return { error: error.message };
    }
}
