'use server';

/**
 * HIGH-PRIORITY VISION ANALYSIS ENGINE (Version 10.0)
 * 
 * Specifically optimized for Direct Gemini Vision to ensure
 * "High-Density" analysis works in one go for scans/images.
 */

interface LegalAnalysis {
    summary_simple: string;
    what_it_means: string[];
    key_clauses: Array<{ title: string; explanation: string; risk: string }>;
    red_flags: Array<{ reason: string; severity: string }>;
}

export async function analyzeLegalText(text: string): Promise<LegalAnalysis> {
    const isVisionMode = text.startsWith('IMAGE_DATA:');
    let base64Data = '';
    let mimeType = '';
    let cleanedText = text;

    if (isVisionMode) {
        const parts = text.split(';base64,');
        mimeType = parts[0].replace('IMAGE_DATA:', '');
        base64Data = parts[1];
        console.log(`Vision Mode Active. Type: ${mimeType}, Size: ${base64Data.length}`);
    } else {
        cleanedText = text.trim();
        if (cleanedText.length === 0) {
            return {
                summary_simple: "ERROR: Empty document detected.",
                what_it_means: ["Analysis failed: 0 characters found."],
                key_clauses: [],
                red_flags: []
            };
        }
    }

    const googleKey = (process.env.GOOGLE_API_KEY || "").replace(/["']/g, "").trim();
    const orKey = (process.env.NEXT_PUBLIC_APIKEY || "").replace(/["']/g, "").trim();

    const systemPrompt = `You are a Senior Legal Strategist. Provide a "Full Clarification" of the document.
    STRICT RULES:
    1. Language: ALWAYS respond in professional English.
    2. Format: Use a numbered list (1., 2., 3.) in the summary for all mandates.
    3. Style: Detailed, high-density, thematic breakdown. 
    4. If the input is an image or scan, perform deep visual OCR first.`;

    const userPrompt = `Analyze this legal document and provide a full expert clarification in English.
    
    Structure your JSON response exactly like this:
    {
        "summary_simple": "Detailed 6-8 sentence summary. MUST include 1. 2. 3. numbered list of mandates.",
        "what_it_means": [
            "CITIZENS: [Detailed bullet points...]",
            "CONTRACTORS/BUILDERS: [Detailed bullet points...]",
            "AUTHORITIES: [Detailed bullet points...]",
            "IN SHORT: Overall takeaway."
        ],
        "key_clauses": [
            {
                "title": "📌 [A/B/C]. [Theme Name]",
                "explanation": "Detailed breakdown... \\n👉 Impact: Detailed impact of this section.",
                "risk": "Low/Medium/High"
            }
        ],
        "red_flags": [
            {
                "reason": "⚠️ [Category]: [Detailed reasoning for the risk...]",
                "severity": "Low/Medium/High"
            }
        ]
    }

    ${isVisionMode ? "READ AND ANALYZE THE ATTACHED IMAGE/PDF VISUALLY." : `DOCUMENT TEXT: ${cleanedText.substring(0, 15000)}`}`;

    // --- STRATEGY 1: DIRECT GOOGLE GEMINI (Most Reliable for Vision) ---
    if (googleKey) {
        try {
            console.log("Attempting Direct Gemini Vision Strategy...");
            const contents = isVisionMode ? [
                {
                    parts: [
                        { text: `${systemPrompt}\n\n${userPrompt}` },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }
            ] : [
                { parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
            ];

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
                }),
                signal: AbortSignal.timeout(60000)
            });

            if (res.ok) {
                const data = await res.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                    console.log("Success with Direct Gemini Vision.");
                    return JSON.parse(content);
                }
            } else {
                const err = await res.text();
                console.warn("Direct Gemini Vision failed:", err.substring(0, 200));
            }
        } catch (e) { console.error("Direct Gemini Error:", e); }
    }

    // --- STRATEGY 2: OPENROUTER VISION FALLBACK ---
    if (orKey) {
        try {
            console.log("Attempting OpenRouter Vision fallback...");
            const messageContent: any = isVisionMode ? [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
            ] : userPrompt;

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${orKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: isVisionMode ? "google/gemini-2.0-flash-lite-preview-02-05:free" : "google/gemini-2.0-flash-lite-preview-02-05:free",
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: messageContent }],
                    response_format: { type: "json_object" }
                }),
                signal: AbortSignal.timeout(60000)
            });

            if (res.ok) {
                const data = await res.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) return JSON.parse(content);
            }
        } catch (e) { console.warn("OR Vision failed"); }
    }

    // --- FINAL FALLBACK ---
    return {
        summary_simple: "HIGH-DENSITY VISION ERROR: The AI cloud is unable to process this image/scan at the moment. Please ensure the image is clear or try uploading a digital PDF.",
        what_it_means: ["Your document was received, but the visual reasoning chain failed."],
        key_clauses: [],
        red_flags: []
    };
}
