'use server';

import OpenAI from "openai";

/**
 * PRODUCTION-GRADE LEGAL COMPARISON ENGINE
 * Optimized for stability, resilience, and strict schema adherence.
 */

const SYSTEM_PROMPT = `Compare two legal cases or document versions.
Output MUST be valid JSON only.

JSON Format:
{
  "case1_summary": "Concise summary of first case/doc",
  "case2_summary": "Concise summary of second case/doc",
  "similarities": ["Point 1", "Point 2"],
  "differences": ["Contrast 1", "Contrast 2"],
  "final_verdict": "Detailed analysis of which position is stronger or key legal outcome."
}`;

export async function compareLegalDocs(case1: string, case2: string, name1: string = "Case 1", name2: string = "Case 2") {
    try {
        if (!case1 || !case2) throw new Error("Both inputs are required for comparison.");

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
            process.env.OPENROUTER_KEY || 
            ""
        ).replace(/["']/g, "").trim();

        const userPrompt = `Compare these two items.
Name 1: ${name1}
Content 1: ${case1.substring(0, 5000)}

Name 2: ${name2}
Content 2: ${case2.substring(0, 5000)}`;

        let winner: any = null;
        const failures: string[] = [];

        // --- 1. PRIMARY: GEMINI 1.5 PRO (Strict & Reliable) ---
        if (googleKey) {
            try {
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
                    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
                    winner = JSON.parse(raw);
                } else {
                    failures.push(`Google: ${res.status}`);
                }
            } catch (e: any) {
                failures.push(`Google Error: ${e.message}`);
            }
        }

        // --- 2. FALLBACK: OPENROUTER (Sequential Resilience) ---
        if (!winner && orKey) {
            const client = new OpenAI({ apiKey: orKey, baseURL: 'https://openrouter.ai/api/v1' });
            // DeepSeek is highly recommended for structured JSON
            const models = ["deepseek/deepseek-chat", "google/gemini-2.0-flash-001", "meta-llama/llama-3.3-70b-instruct"];

            for (const model of models) {
                try {
                    const completion = await client.chat.completions.create({
                        model,
                        max_tokens: 1000,
                        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }]
                    }, { timeout: 30000 });

                    let raw = completion.choices?.[0]?.message?.content || "";
                    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
                    winner = JSON.parse(raw);
                    if (winner) break;
                } catch (e: any) {
                    failures.push(`${model}: ${e.message}`);
                }
            }
        }

        if (!winner) {
            throw new Error(`AI Comparison failed. Details: ${failures.join(" | ")}`);
        }

        // Schema Validation
        return {
            result: {
                case1_summary: winner.case1_summary || "Summary unavailable.",
                case2_summary: winner.case2_summary || "Summary unavailable.",
                similarities: Array.isArray(winner.similarities) ? winner.similarities : [],
                differences: Array.isArray(winner.differences) ? winner.differences : [],
                final_verdict: winner.final_verdict || "No final verdict generated."
            }
        };

    } catch (error: any) {
        console.error("[Compare-Action] Fatal:", error.message);
        return { error: error.message };
    }
}
