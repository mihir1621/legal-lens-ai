'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */

const PRIMARY_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free";

export async function translateAnalysisResult(data: any, targetLanguage: string): Promise<any> {
    const runTranslation = async (retryCount = 0): Promise<any> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_APIKEY?.replace(/["']/g, "").trim();
            if (!apiKey) {
                throw new Error("Missing API Key");
            }

            const prompt = `
            Translate the following legal document analysis JSON object into ${targetLanguage}.
            
            IMPORTANT RULES:
            1. Maintain the exact JSON structure and keys.
            2. Only translate the string values. Do not translate keys like "summary_simple", "red_flags", "key_clauses", "what_it_means".
            
            PART 1: DATA TRANSLATION
            Translate this JSON data:
            ${JSON.stringify(data)}

            PART 2: UI LABELS TRANSLATION
            Also translate these specific UI labels into ${targetLanguage}:
            - "Legal Text Summarization"
            - "What this means for you"
            - "Key Clauses Breakdown"
            - "Red Flags"
            - "Analysis Result"
            - "Back to Upload"
            - "This tool is provided for informational purposes only and does not constitute legal advice."
            
            Output a SINGLE JSON object with two top-level keys:
            {
               "data": { ...translated_data_json... },
               "labels": {
                  "legal_summary": "...",
                  "what_means": "...",
                  "key_clauses": "...",
                  "red_flags": "...",
                  "analysis_result": "...",
                  "back_to_upload": "...",
                  "legal_disclaimer": "..."
               }
            }
            
            Return ONLY the valid JSON string. Do not wrap in markdown or code blocks.
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LegalLens AI",
                },
                body: JSON.stringify({
                    "model": PRIMARY_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "response_format": { "type": "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.status}`);
            }

            const resData = await response.json();
            const textResponse = resData.choices[0]?.message?.content || "";

            // Robust JSON extraction
            let cleanText = textResponse.trim();
            cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

            const firstOpen = cleanText.indexOf('{');
            const lastClose = cleanText.lastIndexOf('}');

            if (firstOpen !== -1 && lastClose !== -1) {
                cleanText = cleanText.substring(firstOpen, lastClose + 1);
                return JSON.parse(cleanText);
            } else {
                throw new Error("AI translation did not return valid JSON.");
            }

        } catch (error) {
            console.error(`Translation attempt ${retryCount + 1} failed:`, error);

            if (retryCount < 2) {
                const waitMs = (retryCount + 1) * 2000;
                await new Promise(resolve => setTimeout(resolve, waitMs));
                return runTranslation(retryCount + 1);
            }
            throw error;
        }
    };

    return await runTranslation();
}
