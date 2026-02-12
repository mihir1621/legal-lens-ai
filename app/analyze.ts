'use server';

// Switching to Llama 3.1 8B - extremely good at structured output
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export async function analyzeLegalText(text: string) {
    const apiKey = process.env.HF_TOKEN || process.env.NEXT_PUBLIC_APIKEY?.replace(/["']/g, "").trim();

    if (!apiKey) {
        return { error: "Missing HF_TOKEN. Please add it to your .env.local" };
    }

    const maxRetries = 3;
    let lastError = "";

    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Analyzing document with Llama 3.1 (Attempt ${i + 1}/${maxRetries})...`);

            const response = await fetch(`https://router.huggingface.co/models/${HF_MODEL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "inputs": `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a professional legal analyst. analyze the following document text and provide a comprehensive summary and risk analysis.
You MUST respond with a valid JSON object only. Do not include any text before or after the JSON.

The JSON structure must be:
{
    "summary_simple": "A clear 3-4 sentence summary of the document purpose and key points.",
    "what_it_means": ["Brief actionable point 1", "Brief actionable point 2", "Brief actionable point 3"],
    "key_clauses": [
        {"title": "Clause Name", "explanation": "Simple explanation of this clause", "risk": "Low" | "Medium" | "High"}
    ],
    "red_flags": [
        {"reason": "Specific risk or red flag found", "severity": "Low" | "Medium" | "High"}
    ]
}<|eot_id|><|start_header_id|>user<|end_header_id|>

ANALYSIS TARGET:
${text.substring(0, 4000)}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{`,
                    "parameters": {
                        "max_new_tokens": 1200,
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
                lastError = data.error || "Unknown API Error";
                console.warn(`HF Attempt ${i + 1} failed: ${lastError}`);
                // If it's a loading error, the "wait_for_model" option should handle it, 
                // but we retry just in case of transient network issues.
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            const output = Array.isArray(data) ? data[0].generated_text : data.generated_text;

            // Handle prefix from the prompt completion
            let cleanJson = "{" + output.trim();

            // Find valid JSON range
            const start = cleanJson.indexOf('{');
            const end = cleanJson.lastIndexOf('}');

            if (start !== -1 && end !== -1) {
                const finalJson = cleanJson.substring(start, end + 1);
                try {
                    const parsed = JSON.parse(finalJson);
                    // Minimal validation to ensure UI components have data
                    return {
                        summary_simple: parsed.summary_simple || "Summary processing incomplete.",
                        what_it_means: parsed.what_it_means?.length ? parsed.what_it_means : ["Manual review recommended."],
                        key_clauses: parsed.key_clauses || [],
                        red_flags: parsed.red_flags || []
                    };
                } catch (parseErr) {
                    console.error("JSON Parse failed on output:", finalJson);
                    lastError = "Invalid JSON structure in AI output.";
                }
            } else {
                lastError = "Could not find JSON structure in output.";
            }

        } catch (error) {
            lastError = error instanceof Error ? error.message : "Unknown connection error";
            console.error(`Attempt ${i + 1} Error:`, lastError);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // FINAL FALLBACK: If all retries truly fail
    return {
        summary_simple: "Summary generation failed. Error: " + lastError,
        what_it_means: ["Service temporarily busy", "Please try again in a few moments", "Ensure your HF_TOKEN is valid"],
        key_clauses: [{ title: "Analysis Error", explanation: lastError, risk: "High" }],
        red_flags: [{ reason: "AI Service Connection Issue", severity: "High" }]
    };
}
