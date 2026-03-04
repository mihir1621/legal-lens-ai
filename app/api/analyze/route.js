/* [LegalLens API v3.7 - CACHE BUSTER: 0304-M] */
import Groq from "groq-sdk";

export const maxDuration = 60; // Hint for Vercel

export async function POST(req) {
    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY || "missing_key",
            timeout: 9000, // 9 seconds to stay under Vercel 10s ceiling
        });

        const { text, userId, fileName } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            return Response.json({ error: "INTERNAL_ERROR: GROQ_API_KEY is missing in environment variables." }, { status: 500 });
        }

        if (!text) {
            return Response.json({ error: "ERR_NO_DATA: No document data received." }, { status: 400 });
        }

        const isVisionInput = text.startsWith('IMAGE_DATA:');
        let finalResult;

        console.log(`[Analyzer] Processing: ${fileName} | Vision: ${isVisionInput}`);

        const SCHEMA_GUIDE = `
        Return EXCLUSIVELY a JSON object where EVERY explanation is point-wise. NO paragraphs/essays.
        MANDATORY: ALWAYS OUTPUT ALL TEXT IN THE ENGLISH LANGUAGE, even if the input document is in another language.
        {
          "summary": ["Point 1 of document purpose", "Point 2 of document scope"],
          "what_it_means": ["Specific actionable point for the user 1", "Specific actionable point for the user 2"],
          "key_clauses": [{"title": "EXACT CLAUSE NAME", "explanation": "Short, bulleted explanation of what this does", "risk": "Low|Medium|High"}],
          "risks": [{"reason": "Direct, blunt risk point 1", "severity": "High|Medium"}],
          "documents_required": [{"name": "Specific document", "purpose": "Why it is needed", "how_to_obtain": ["Concrete step 1", "Step 2"]}]
        }
        STRICT RULES: 
        1. Use short, snappy sentences. 
        2. Use bullet points for EVERY field. 
        3. NO generic placeholders. 
        4. Focus on the SPECIFIC content of "${fileName}".
        `;

        if (isVisionInput) {
            // --- VISION FLOW ---
            const parts = text.split(';base64,');
            const mimeType = parts[0].replace('IMAGE_DATA:', '');
            const base64Data = parts[1];
            const isImage = mimeType.includes('image/');

            if (isImage) {
                try {
                    const completion = await groq.chat.completions.create({
                        model: "llama-3.2-11b-vision-preview",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "text",
                                        text: `Deeply analyze this document image using ONLY point-wise explanations. ${SCHEMA_GUIDE}`
                                    },
                                    {
                                        type: "image_url",
                                        image_url: { url: `data:${mimeType};base64,${base64Data}` }
                                    }
                                ]
                            }
                        ],
                        temperature: 0.1,
                        response_format: { type: "json_object" }
                    });
                    finalResult = JSON.parse(completion.choices[0].message.content);
                } catch (visionErr) {
                    console.error("[Vision API Error]", visionErr);
                    throw new Error(`GROQ_API_ERROR: ${visionErr.message}`);
                }
            } else {
                // PDF Scan Fallback
                try {
                    const completion = await groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are an expert legal analyzer. Provide point-wise strategic advice." },
                            { role: "user", content: `Analyze this scanned document in point-wise JSON format. ${SCHEMA_GUIDE}` }
                        ],
                        temperature: 0.1,
                        response_format: { type: "json_object" }
                    });
                    finalResult = JSON.parse(completion.choices[0].message.content);
                } catch (visionErr) {
                    console.error("[Vision API Error - Fallback]", visionErr);
                    throw new Error(`GROQ_API_ERROR: ${visionErr.message}`);
                }
            }
        } else {
            // --- TEXT FLOW (Optimized for Vercel 10s Limit) ---
            const cleanedText = text.replace(/IMAGE_DATA:[^,]+,([a-zA-Z0-9+/=]+)/g, "").trim();
            // Take first 15k characters for a single high-speed pass
            const relevantText = (cleanedText || "Standard Content").slice(0, 15000);

            console.log(`[Groq Text] Performing single-pass analysis (15k chars)...`);

            try {
                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: `You are a Legal Simplifier. Provide ONLY point-wise analysis. NO ESSAYS. ${SCHEMA_GUIDE}` },
                        { role: "user", content: `Analyze this document in short bullet points: ${relevantText}` }
                    ],
                    temperature: 0.1,
                    max_tokens: 1200,
                    response_format: { type: "json_object" }
                });
                finalResult = JSON.parse(completion.choices[0].message.content);
            } catch (err) {
                console.error("[Single Pass Error]", err.message);
                throw new Error("ANALYSIS_TIMEOUT: Analysis is taking too long on Vercel. Please try a shorter segment.");
            }

            // Standardize output
            finalResult = {
                summary: Array.isArray(finalResult.summary) ? finalResult.summary : [finalResult.summary || "Summary generation failed."],
                what_it_means: finalResult.what_it_means || [],
                key_clauses: finalResult.key_clauses || [],
                risks: finalResult.risks || [],
                documents_required: finalResult.documents_required || []
            };
        }

        // Final Mapping for Point-wise UI
        const result = {
            summary_simple: Array.isArray(finalResult.summary) ? finalResult.summary.map(s => `• ${s}`).join("\n") : `• ${finalResult.summary}`,
            what_it_means: finalResult.what_it_means?.length > 0 ? finalResult.what_it_means : ["Document impact summarized in points."],
            key_clauses: (finalResult.key_clauses || []).map((c) => ({
                title: c.title || "Key Clause",
                explanation: Array.isArray(c.explanation) ? c.explanation.join(" ") : c.explanation,
                risk: c.risk || "Medium"
            })),
            red_flags: (finalResult.risks || []).map((r) => ({
                reason: r.reason || "Legal risk detected",
                severity: r.severity || "High"
            })),
            documents_required: (finalResult.documents_required || []).map((d) => ({
                name: d.name || "Required Document",
                purpose: d.purpose || "Necessary for legalization.",
                how_to_obtain: Array.isArray(d.how_to_obtain) ? d.how_to_obtain : [d.how_to_obtain || "Official portal."]
            }))
        };

        return Response.json({ result: result });

    } catch (error) {
        console.error("Groq Final Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

function chunkText(text, size = 5500) {
    const chunks = [];
    if (!text) return chunks;
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}
