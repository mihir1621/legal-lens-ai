"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const translationCache: Record<string, string> = {};

export async function translateText(text: string) {
    const sentence = text.trim();
    if (!sentence) return "";

    if (translationCache[sentence]) {
        return translationCache[sentence];
    }

    // --- PRIORITY 1: GOOGLE GEMINI (via OpenRouter) ---
    try {
        const openRouterKey = process.env.NEXT_PUBLIC_APIKEY || process.env.HF_TOKEN;
        if (openRouterKey) {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey.replace(/["']/g, "").trim()}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "LegalLens AI",
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                    "messages": [
                        { "role": "system", "content": "You are a professional legal translator. Translate the following text strictly into Hindi. Return ONLY the translated text." },
                        { "role": "user", "content": sentence }
                    ]
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const translatedText = data.choices[0]?.message?.content?.trim();
                if (translatedText) {
                    translationCache[sentence] = translatedText;
                    return translatedText;
                }
            }
        }
    } catch (err) {
        console.warn("Gemini Priority Translation failed, trying local service...");
    }

    // --- FALLBACK 1: LOCAL PYTHON SERVICE ---
    try {
        const serviceUrl = process.env.TRANSLATION_SERVICE_URL || "http://localhost:8001";
        const res = await fetch(`${serviceUrl}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: sentence }),
        });

        if (res.ok) {
            const data = await res.json();
            if (data.translation) {
                translationCache[sentence] = data.translation;
                return data.translation;
            }
        }
    } catch (err) {
        console.warn("Primary Translation Service failed, trying cloud fallbacks...");
    }

    // --- FALLBACK 2: GOOGLE TRANSLATE API X ---
    try {
        const { translate } = await import('google-translate-api-x');
        const res = await translate(sentence, { to: 'hi' });
        if (res.text) {
            translationCache[sentence] = res.text;
            return res.text;
        }
    } catch (err) {
        console.warn("Google Translate Fallback failed...");
    }

    // --- FALLBACK 3: MYMEMORY API (Free Translation) ---
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=en|hi`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const translatedText = data.responseData?.translatedText;
            if (translatedText && !translatedText.includes("MYMEMORY WARNING")) {
                translationCache[sentence] = translatedText;
                return translatedText;
            }
        }
    } catch (err) {
        console.warn("MyMemory Fallback failed...");
    }

    // --- FALLBACK 4: HUGGING FACE TRANSLATOR ---
    try {
        const hfToken = process.env.HF_TOKEN || process.env.NEXT_PUBLIC_APIKEY;
        if (hfToken) {
            const response = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-hi", {
                method: "POST",
                headers: { "Authorization": `Bearer ${hfToken.replace(/["']/g, "").trim()}` },
                body: JSON.stringify({ inputs: sentence }),
            });
            if (response.ok) {
                const data = await response.json();
                const translatedText = Array.isArray(data) ? data[0].translation_text : data.translation_text;
                if (translatedText) {
                    translationCache[sentence] = translatedText;
                    return translatedText;
                }
            }
        }
    } catch (err) {
        console.warn("Hugging Face Translator Fallback failed...");
    }

    // --- FALLBACK 5: MANUAL GOOGLE API FETCH ---
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(sentence)}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const translatedText = data[0].map((s: any) => s[0]).join("");
            if (translatedText) {
                translationCache[sentence] = translatedText;
                return translatedText;
            }
        }
    } catch (err) {
        console.warn("Manual Google API Fallback failed...");
    }

    // --- FINAL FALLBACK: RETURN ORIGINAL ---
    return sentence;
}

export async function translateDocument(text: string) {
    const translation = await translateText(text);

    await addDoc(collection(db, "translations"), {
        original: text,
        translated: translation,
        createdAt: Date.now(),
    });

    return translation;
}
