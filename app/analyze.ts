'use server';

const PRIMARY_MODEL = "openai/gpt-4o-search-preview";

export async function analyzeLegalText(text: string) {
    const runAnalysis = async (): Promise<any> => {
        try {
            const currentModelName = PRIMARY_MODEL;
            console.log(`Analyzing with model: ${currentModelName}`);

            const apiKey = process.env.NEXT_PUBLIC_APIKEY?.replace(/["']/g, "").trim();
            if (!apiKey) {
                console.error("Missing NEXT_PUBLIC_APIKEY");
                return { error: "Configuration Error: Missing API Key" };
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for analysis

            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "LegalLens AI",
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        "model": currentModelName,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert legal aide. Your task is to analyze legal documents and extract key information into a structured JSON format. \n\nIMPORTANT: Regardless of the language of the source document, you MUST provide the analysis and all content in English.\n\nOutput a valid JSON object with the following keys:\n- `summary_simple`: A simple, easy-to-understand summary of the document (string).\n- `what_it_means`: A list of actionable points explaining what this means for the user (array of strings).\n- `key_clauses`: A list of important clauses (array of objects with `title`, `explanation`, and `risk` ('Low', 'Medium', 'High')).\n- `red_flags`: A list of potential risks or red flags (array of objects with `reason` and `severity` ('Low', 'Medium', 'High')).\n\nEnsure the output is pure JSON without markdown formatting."
                            },
                            {
                                "role": "user",
                                "content": `Analyze accurately (English only):\n\n${text.substring(0, 5000)}`
                            }
                        ],
                        "max_tokens": 500
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 429 || response.status >= 500) {
                        throw new Error(`RETRYABLE_ERROR: ${response.status} - ${errorText}`);
                    }
                    console.error(`OpenRouter Analysis Error: ${response.status}`, errorText);
                    return { error: `Analysis failed: ${response.status} - ${errorText}` };
                }

                const data = await response.json();
                const completeResponse = data.choices[0]?.message?.content || "";

                console.log("Raw AI Response Length:", completeResponse.length);

                // Clean and Parse JSON
                let cleanJson = completeResponse.trim();
                // Remove markdown code blocks if present
                if (cleanJson.startsWith('```json')) {
                    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanJson.startsWith('```')) {
                    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                try {
                    const result = JSON.parse(cleanJson);
                    // Basic validation: check if keys exist
                    if (!result.summary_simple && !result.what_it_means) {
                        throw new Error("Invalid structure");
                    }
                    return result;
                } catch (e) {
                    throw new Error(`RETRYABLE_ERROR: JSON extraction failed for model ${currentModelName}`);
                }
            } finally {
                clearTimeout(timeoutId);
            }

        } catch (error) {
            console.error(`Analysis failed:`, error);
            return { error: "Failed to analyze document. Please try again later." };
        }
    };

    return await runAnalysis();
}
