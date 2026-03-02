"use server";

const translationCache: Record<string, string> = {};

// Language code to full name map for AI prompt
const LANGUAGE_NAMES: Record<string, string> = {
    hi: "Hindi",
    mr: "Marathi",
    gu: "Gujarati",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    ml: "Malayalam",
    bn: "Bengali",
    pa: "Punjabi",
    en: "English",
};

export async function translateText(text: string, targetLang: string = "hi") {
    const sentence = text.trim();
    if (!sentence || targetLang === "en") return sentence;

    const cacheKey = `${targetLang}:${sentence}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    const targetLangName = LANGUAGE_NAMES[targetLang] || "Hindi";

    // --- PRIORITY 1: DIRECT GOOGLE GEMINI (Fastest & Most Accurate) ---
    const googleKey = (
        process.env.GOOGLE_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        ""
    ).replace(/["']/g, "").trim();

    if (googleKey) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Translate the following text to ${targetLangName}. Return ONLY the translated text, no explanations, no quotes:\n\n${sentence}` }] }],
                    generationConfig: { temperature: 0.1 }
                }),
                signal: AbortSignal.timeout(15000)
            });
            if (res.ok) {
                const data = await res.json();
                const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (translated) {
                    translationCache[cacheKey] = translated;
                    return translated;
                }
            } else if (res.status === 429) {
                console.warn("Translation Gemini is Rate Limited (429). Waiting 1s...");
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.warn("Gemini Direct Translation failed...");
        }
    }

    // --- PRIORITY 2: OPENROUTER (Multi-language via Gemini Flash) ---
    const orKeys = [
        process.env.OPENROUTER_API_KEY,
        process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        process.env.NEXT_PUBLIC_APIKEY,
        process.env.OPENROUTER_KEY
    ].map(k => (k || "").replace(/["']/g, "").trim()).filter(k => k.length > 10);

    for (const openRouterKey of orKeys) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LegalLens AI",
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                    "messages": [
                        { "role": "system", "content": `You are a professional legal translator. Translate to ${targetLangName}. Return ONLY the translated text.` },
                        { "role": "user", "content": sentence }
                    ]
                }),
                signal: AbortSignal.timeout(20000)
            });

            if (response.ok) {
                const data = await response.json();
                const translatedText = data.choices[0]?.message?.content?.trim();
                if (translatedText) {
                    translationCache[cacheKey] = translatedText;
                    return translatedText;
                }
            } else if (response.status === 429) {
                console.warn(`Translation OR Key ${openRouterKey.substring(0, 8)} is Rate Limited. Trying next...`);
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.warn("OpenRouter Translation attempt failed...");
        }
    }

    // --- FALLBACK 1: MYMEMORY (Free, supports many Indian languages) ---
    try {
        const langPair = `en|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=${langPair}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (response.ok) {
            const data = await response.json();
            const translatedText = data.responseData?.translatedText;
            if (translatedText && !translatedText.includes("MYMEMORY WARNING")) {
                translationCache[cacheKey] = translatedText;
                return translatedText;
            }
        }
    } catch (err) {
        console.warn("MyMemory Fallback failed...");
    }

    // --- FALLBACK 2: GOOGLE TRANSLATE FREE ENDPOINT ---
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(sentence)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (response.ok) {
            const data = await response.json();
            const translatedText = data[0]?.map((s: any) => s[0]).join("");
            if (translatedText) {
                translationCache[cacheKey] = translatedText;
                return translatedText;
            }
        }
    } catch (err) {
        console.warn("Google Free Translate failed...");
    }

    // Return original if all fail
    return sentence;
}
