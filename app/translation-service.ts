'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { translateText } from "./actions/translate";

/**
 * Translates an analysis result object using the Hugging Face translation service.
 */
export async function translateAnalysisResult(data: any, targetLanguage: string): Promise<any> {
    try {
        if (!data) throw new Error("No data provided for translation");

        console.log(`Deep Translating analysis result to ${targetLanguage}...`);

        // 1. Improved Recursive function to translate string values
        const translateObject = async (obj: any): Promise<any> => {
            if (typeof obj === 'string' && obj.trim().length > 0) {
                // If the string is a risk level or severity, don't translate
                if (['High', 'Medium', 'Low'].includes(obj)) return obj;

                try {
                    return await translateText(obj);
                } catch (err) {
                    console.warn(`Failed to translate string: ${obj.substring(0, 20)}...`, err);
                    return obj; // Fallback to original English for this string
                }
            } else if (Array.isArray(obj)) {
                return await Promise.all(obj.map(item => translateObject(item)));
            } else if (typeof obj === 'object' && obj !== null) {
                const newObj: any = {};
                for (const key in obj) {
                    // Skip keys, only translate values
                    newObj[key] = await translateObject(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        const translatedData = await translateObject(data);

        // 2. Hindi UI Labels
        const labels = targetLanguage.toLowerCase().includes('hindi') || targetLanguage === 'hi' ? {
            legal_summary: "कानूनी पाठ सारांश (Summary)",
            what_means: "आपके लिए इसका क्या मतलब है",
            key_clauses: "महत्वपूर्ण खंड",
            red_flags: "जोखिम (Red Flags)",
            analysis_result: "विश्लेषण परिणाम",
            back_to_upload: "वापस अपलोड पर जाएं",
            legal_disclaimer: "यह उपकरण केवल सूचनात्मक उद्देश्यों के लिए है और कानूनी सलाह नहीं देता है।"
        } : {
            legal_summary: "Legal Text Summarization",
            what_means: "What this means for you",
            key_clauses: "Key Clauses Breakdown",
            red_flags: "Red Flags",
            analysis_result: "Analysis Result",
            back_to_upload: "Back to Upload",
            legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice."
        };

        return {
            data: translatedData,
            labels: labels
        };

    } catch (error) {
        console.error("Deep Translation Pipeline failed:", error);
        // Return original data with English labels so UI doesn't crash
        return {
            data: data,
            labels: {
                legal_summary: "Legal Text Summarization",
                what_means: "What this means for you",
                key_clauses: "Key Clauses Breakdown",
                red_flags: "Red Flags",
                analysis_result: "Analysis Result",
                back_to_upload: "Back to Upload",
                legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice."
            }
        };
    }
}
