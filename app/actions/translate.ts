"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const translationCache: Record<string, string> = {};

export async function translateText(text: string) {
    const sentence = text.trim();
    if (translationCache[sentence]) {
        console.log("Returning cached translation (Next.js action)");
        return translationCache[sentence];
    }

    const serviceUrl = process.env.TRANSLATION_SERVICE_URL || "http://localhost:8001";
    console.log(`Calling translation service at: ${serviceUrl}`);

    const res = await fetch(`${serviceUrl}/translate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Service Error (${res.status}):`, errorText);
        throw new Error(`Translation service returned ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textFallback = await res.text();
        console.error("Expected JSON but got:", textFallback.substring(0, 100));
        throw new Error("Invalid response from translation service (Not JSON)");
    }

    const data = await res.json();
    const translation = data.translation;
    translationCache[sentence] = translation;
    return translation;
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
