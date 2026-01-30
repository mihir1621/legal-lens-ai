'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function extractTextFromFile(formData: FormData): Promise<{ text: string; error?: string }> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { text: '', error: 'No file uploaded' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`Extracting: ${file.name} (${file.type}), Size: ${buffer.length}, IsBuffer: ${Buffer.isBuffer(buffer)}`);

        let text = '';

        if (file.type === 'application/pdf') {
            try {
                // Use pdfjs-dist for robust parsing with dynamic import for ESM
                // @ts-ignore
                const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

                // Convert Buffer to Uint8Array
                const uint8Array = new Uint8Array(buffer);

                const loadingTask = pdfjsLib.getDocument({
                    data: uint8Array,
                    useSystemFonts: true,
                    disableFontFace: true
                });

                const doc = await loadingTask.promise;
                let fullText = "";

                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    const textContent = await page.getTextContent();
                    const strings = textContent.items.map((item: any) => item.str);
                    fullText += strings.join(" ") + "\n";
                }

                text = fullText;
            } catch (e) {
                console.error("PDF Parse Error", e);
                throw new Error("Failed to parse PDF on server: " + (e instanceof Error ? e.message : String(e)));
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                // @ts-ignore
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
            } catch (e) {
                console.error("Mammoth Error", e);
                return { text: '', error: 'Failed to extract text from DOCX' };
            }
        } else {
            // Assume text/plain
            text = buffer.toString('utf-8');
        }

        // Basic cleaning to remove excessive whitespace
        text = text.replace(/\s+/g, ' ').trim();

        return { text };
    } catch (error) {
        console.error('Extraction error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown Error';
        return { text: '', error: `Failed to extract text: ${msg}` };
    }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    try {
        // Use gemini-2.5-flash-lite as verified working model with quota
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Translate the following text accurately into ${targetLanguage}. Maintain the original meaning and tone, but make it natural for a native speaker of ${targetLanguage}. Do not add explanations, just return the translated text.\n\nText: "${text.substring(0, 5000)}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Translation Error:", error);
        throw new Error("Failed to translate text.");
    }
}

export async function translateAnalaysisResult(data: any, targetLanguage: string): Promise<any> {
    // gemini-2.5-flash-lite is the verified working model
    const models = ["gemini-2.5-flash-lite"];

    const runTranslation = async (retryCount = 0): Promise<any> => {
        try {
            const currentModelName = models[0];
            const model = genAI.getGenerativeModel({ model: currentModelName });

            const prompt = `
            Translate the values of the following document analysis JSON object into ${targetLanguage}.
            
            IMPORTANT RULES:
            1. Maintain the exact JSON structure and keys (like "summary_simple", "red_flags", "key_clauses", "what_it_means").
            2. Only translate the string values. Do not translate keys.
            3. Also translate the section headers/titles if they were part of the JSON, but since they are hardcoded in the UI, I will provide you a separate object for UI labels below.
            
            PART 1: DATA TRANSLATION
            Translate this JSON data:
            ${JSON.stringify(data)}

            PART 2: UI LABELS TRANSLATION
            Also translate these specific UI labels into ${targetLanguage}:
            - "Simple Explanation"
            - "What this means for you"
            - "Key Clauses Breakdown"
            - "Red Flags"
            - "Analysis Result"
            - "Back to Upload"
            
            Output a SINGLE JSON object with two top-level keys:
            {
               "data": { ...translated_data_json... },
               "labels": {
                  "simple_explanation": "...",
                  "what_means": "...",
                  "key_clauses": "...",
                  "red_flags": "...",
                  "analysis_result": "...",
                  "back_to_upload": "..."
               }
            }
            
            Return ONLY the valid JSON string. Do not wrap in markdown or code blocks.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            // Robust JSON extraction
            let cleanText = textResponse.trim();
            cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

            const firstOpen = cleanText.indexOf('{');
            const lastClose = cleanText.lastIndexOf('}');

            if (firstOpen !== -1 && lastClose !== -1) {
                cleanText = cleanText.substring(firstOpen, lastClose + 1);
            }

            return JSON.parse(cleanText);

        } catch (error) {
            console.error(`Translation attempt ${retryCount + 1} failed:`, error);

            // Limit retries to 3 total attempts
            if (retryCount < 3) {
                const errorMsg = String(error);
                const isQuotaError = errorMsg.includes("429") || errorMsg.includes("Quota") || errorMsg.includes("503");

                // Exponential Backoff: 4s, 8s, 16s
                const waitMs = isQuotaError ? (retryCount + 1) * 4000 : 2000;

                console.log(`Waiting ${waitMs}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
                return runTranslation(retryCount + 1);
            }

            const userFriendlyError = String(error).includes("429")
                ? "Translation service busy. Please try again later."
                : String(error);
            throw new Error(userFriendlyError);
        }
    };

    try {
        return await runTranslation();
    } catch (error) {
        throw new Error(`Failed to translate analysis result: ${error instanceof Error ? error.message : String(error)}`);
    }
}
