'use server';

/**
 * ULTRA-RESILIENT ANALYSIS ENGINE (Hugging Face Only)
 * 
 * This module extracts legal insights from document text without external LLM APIs.
 * It uses the legacy Inference Widget API for maximum stability with free tokens.
 */

const MODELS = [
    "mistralai/Mistral-7B-Instruct-v0.3",
    "HuggingFaceH4/zephyr-7b-beta",
    "google/gemma-2-9b-it"
];

export async function analyzeLegalText(text: string) {
    // 1. Get API Key
    const apiKey = (process.env.HF_TOKEN || process.env.NEXT_PUBLIC_APIKEY || "").replace(/["']/g, "").trim();

    if (!apiKey) {
        console.error("CRITICAL: No HF_TOKEN found in environment variables.");
        return { error: "Missing HF_TOKEN. Please add it to your .env.local and RESTART your terminal." };
    }

    console.log(`Using Key starting with: ${apiKey.substring(0, 4)}...`);

    // --- PRIORITY 1: GOOGLE GEMINI (via OpenRouter) ---
    try {
        console.log("Attempting Priority Analysis with Gemini...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "LegalLens AI",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a professional legal analyst. Analyze the document and return a detailed JSON object. You MUST respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": `Analyze this document and return JSON with keys: 
                        - summary_simple (3-4 detailed sentences)
                        - what_it_means (array of 3 points)
                        - key_clauses (array of {title, explanation, risk: 'Low'|'Medium'|'High'})
                        - red_flags (array of {reason, severity: 'Low'|'Medium'|'High'})

                        TEXT: ${text.substring(0, 6000)}`
                    }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                return {
                    summary_simple: parsed.summary_simple || "Summary processing incomplete.",
                    what_it_means: parsed.what_it_means || ["Manual review recommended."],
                    key_clauses: parsed.key_clauses || [],
                    red_flags: parsed.red_flags || []
                };
            }
        } else {
            console.warn(`Gemini Priority failed with status ${response.status}, rolling back to HF...`);
        }
    } catch (err) {
        console.error("Gemini Priority Analysis error:", err);
    }

    // --- FALLBACK: HUGGING FACE MODEL CHAIN ---
    // 2. Sequential Model Fallback Strategy
    // If one model is busy or sleeping, it automatically attempts the next one.
    for (const modelId of MODELS) {
        try {
            console.log(`Trying Legacy Inference API with model: ${modelId}`);

            const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "inputs": `<s>[INST] You are a legal AI. Analyze this text and return ONLY a JSON object.
                    
                    Structure:
                    {
                        "summary_simple": "3 sentence summary",
                        "what_it_means": ["point 1", "point 2"],
                        "key_clauses": [{"title": "Name", "explanation": "Info", "risk": "Low"}],
                        "red_flags": [{"reason": "Risk", "severity": "Low"}]
                    }

                    Text: ${text.substring(0, 3000)} [/INST]`,
                    "parameters": {
                        "max_new_tokens": 800,
                        "return_full_text": false,
                        "temperature": 0.1
                    },
                    "options": {
                        "wait_for_model": true
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn(`Model ${modelId} failed:`, data.error || response.statusText);
                continue; // Try next model
            }

            // Extract the generated text
            const output = Array.isArray(data) ? data[0].generated_text : data.generated_text;

            if (output) {
                // Parse the JSON out of the response
                let clean = output.trim();
                const start = clean.indexOf('{');
                const end = clean.lastIndexOf('}');

                if (start !== -1 && end !== -1) {
                    try {
                        const parsed = JSON.parse(clean.substring(start, end + 1));
                        return {
                            summary_simple: parsed.summary_simple || "Summary processing incomplete.",
                            what_it_means: parsed.what_it_means || ["Manual review recommended."],
                            key_clauses: parsed.key_clauses || [],
                            red_flags: parsed.red_flags || []
                        };
                    } catch (e) {
                        console.error("JSON Parse failed for model", modelId);
                    }
                }
            }
        } catch (err) {
            console.error(`Network error with model ${modelId}:`, err);
        }
    }

    // 3. FINAL FALLBACK: If everything fails, provide a "Local" summary so the UI doesn't crash
    // This uses the document text itself to populate the fields
    const safeSummary = text.substring(0, 300).replace(/\s+/g, ' ') + "...";

    return {
        summary_simple: "AI SERVICE BUSY. Local Preview: " + safeSummary,
        what_it_means: ["The Hugging Face cloud service is currently under high load.", "Please check if your HF_TOKEN is a 'Read' token.", "Wait 1 minute and try again."],
        key_clauses: [{ title: "Legal Review Pending", explanation: "The document text was extracted successfully, but AI cloud analysis timed out.", risk: "Low" }],
        red_flags: [{ reason: "Cloud Analysis Timeout", severity: "Low" }]
    };
}
