'use server';

const models = [
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "google/gemini-2.0-flash-lite-preview-02-05:free" // Adding back as fallback for testing ONLY
];

export async function checkModelsEnv() {
    const apiKey = process.env.NEXT_PUBLIC_APIKEY?.replace(/["']/g, "").trim();
    if (!apiKey) return { success: false, message: "No API KEY" };

    const results = [];

    for (const model of models) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s check

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
                    "model": model,
                    "messages": [{ "role": "user", "content": "Hi" }]
                })
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                results.push({ model, status: "OK" });
            } else {
                results.push({ model, status: response.status, body: await response.text() });
            }
        } catch (e) {
            results.push({ model, status: "ERROR", message: String(e) });
        }
    }
    return results;
}
