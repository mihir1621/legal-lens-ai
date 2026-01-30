'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function analyzeLegalText(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
      "${text.substring(0, 30000)}" // Limit text to avoid token limits if necessary
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean up markdown code blocks if present
    textResponse = textResponse.replace(/^```json\n/, '').replace(/\n```$/, '');

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : String(error)}`);
  }
}
