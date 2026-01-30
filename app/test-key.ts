'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function testGeminiKey() {
    try {
        const key = process.env.GOOGLE_API_KEY;
        if (!key) return { success: false, message: "No key found in environment" };

        const genAI = new GoogleGenerativeAI(key);
        // Use gemini-2.5-flash-lite for testing
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        return { success: true, message: "Response received: " + text.substring(0, 50) + "..." };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}
