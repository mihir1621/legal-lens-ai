'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function analyzeLegalText(text: string) {
  const runAnalysis = async (retryCount = 0): Promise<any> => {
    try {
      // Updated to use gemini-2.5-flash-lite as checked by diagnostics
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const prompt = `
            You are an expert legal aide. Analyze the following legal document text and provide a structured JSON response.
            
            The response must be a valid JSON object with the following schema:
            {
                "summary_simple": "A simple, easy-to-understand summary of the document (max 3 sentences).",
                "red_flags": [
                { "text": "The suspicious clause text (translated to English)", "severity": "High/Medium/Low", "reason": "Why this is a red flag" }
                ],
                "key_clauses": [
                { "title": "Clause Title (translated to English)", "explanation": "Simple explanation", "risk": "High/Medium/Low" }
                ],
                "what_it_means": [
                "Actionable point 1 (what the user should do or know)",
                "Actionable point 2"
                ]
            }

            Document Text:
            "${text.substring(0, 15000)}" 
            `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      // Robust JSON parsing
      let cleanText = textResponse.trim();
      cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const firstOpen = cleanText.indexOf('{');
      const lastClose = cleanText.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) {
        cleanText = cleanText.substring(firstOpen, lastClose + 1);
      }

      return JSON.parse(cleanText);

    } catch (error) {
      console.error(`Analysis attempt ${retryCount + 1} failed:`, error);

      if (retryCount < 3) {
        const errorMsg = String(error);
        const isTransientError = errorMsg.includes("429") || errorMsg.includes("Quota") || errorMsg.includes("503");

        if (isTransientError) {
          const waitMs = Math.pow(2, retryCount + 2) * 1000;
          console.log(`Busy/QuotaLimit. Waiting ${waitMs / 1000}s before analysis retry ${retryCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          return runAnalysis(retryCount + 1);
        }
      }

      const userFriendlyError = String(error).includes("429")
        ? "AI Service is currently busy (Rate Limit). Please try again in 30 seconds."
        : String(error);

      throw new Error(`Analysis Failed: ${userFriendlyError}`);
    }
  };

  return await runAnalysis();
}
