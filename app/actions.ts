'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * BACKEND ACTIONS
 * Handles file reading, text extraction, and security verification.
 */

/**
 * Extracts raw text from uploaded files (PDF, DOCX, TXT).
 * Uses specialized libraries for each format.
 */
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
                // @ts-ignore
                const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
                const data = await pdf(buffer);
                let rawText = (data.text || '').replace(/\0/g, '').trim();

                console.log(`[Extractor] PDF Text Length: ${rawText.length}`);

                // If text is very short/missing, or contains common "scanned document" patterns, use Vision
                if (rawText.length < 150) {
                    console.log("[Extractor] PDF looks like a scan or is empty. Using Vision mode...");
                    const base64 = buffer.toString('base64');
                    // We send it as a base64 string that startGemini in analyze.ts can handle
                    text = `IMAGE_DATA:application/pdf;base64,${base64}`;
                } else {
                    // SMART SAMPLING for large docs
                    if (rawText.length > 20000) {
                        const start = rawText.substring(0, 10000);
                        const mid = rawText.substring(rawText.length / 2 - 2500, rawText.length / 2 + 2500);
                        const end = rawText.substring(rawText.length - 5000);
                        text = `${start}\n\n[...Middle Section...]\n${mid}\n\n[...End Section...]\n${end}`;
                    } else {
                        text = rawText;
                    }
                }
            } catch (e) {
                console.error("PDF Parse Error - Falling back to Vision", e);
                const base64 = buffer.toString('base64');
                text = `IMAGE_DATA:application/pdf;base64,${base64}`;
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                // @ts-ignore
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;

                if (text.length > 30000) {
                    text = text.substring(0, 25000) + "\n\n[...Omitted for length...]";
                }
            } catch (e) {
                console.error("Mammoth Error", e);
                return { text: '', error: 'Failed to extract text from DOCX' };
            }
        } else if (file.type.startsWith('image/')) {
            const base64 = buffer.toString('base64');
            text = `IMAGE_DATA:${file.type};base64,${base64}`;
        } else {
            text = buffer.toString('utf-8').substring(0, 30000);
        }

        // Only clean if it's not raw image data
        if (!text.startsWith('IMAGE_DATA:')) {
            text = text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
        }

        return { text };
    } catch (error) {
        console.error('Extraction error:', error);
        return { text: '', error: 'We could not read this document format correctly.' };
    }
}

export async function verifyRecaptcha(token: string, action: string) {
    const projectID = "legallens-ai-24087";
    const apiKey = (process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "").replace(/["']/g, "").trim();
    const siteKey = "6Lfci2UsAAAAAPi-lmckbc7N8WdrP2CBE1nxpBPX";

    if (!apiKey) {
        console.error("[Recaptcha] Missing GOOGLE_API_KEY environment variable");
        return { success: false, error: "Config missing: GOOGLE_API_KEY" };
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    try {
        console.log(`[Recaptcha] Verifying token for action: ${action}`);
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                event: {
                    token: token,
                    siteKey: siteKey,
                    expectedAction: action
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Recaptcha] Assessment API failed:", JSON.stringify(data));

            // FAIL-SAFE: If the API is blocked or restricted, don't lock the user out.
            // This allows the app to function even if GCP configuration is incomplete.
            if (data.error?.message?.includes("blocked") || response.status === 403) {
                console.warn("[Recaptcha] Assessment API is blocked/restricted. Proceeding with caution (Fail-Open).");
                return { success: true, score: 1.0, error: "API_BLOCKED_FAIL_OPEN" };
            }

            return { success: false, error: data.error?.message || `API Status ${response.status}` };
        }

        const score = data.riskAnalysis?.score ?? 0;
        console.log(`[Recaptcha] Assessment score: ${score}`);

        return {
            success: score >= 0.3,
            score,
            error: score < 0.3 ? "Low security score" : undefined
        };
    } catch (error) {
        console.error("[Recaptcha] Server Error:", error);
        // FAIL-SAFE: On server error, allow the user to proceed
        return { success: true, score: 1.0, error: "SERVER_ERROR_FAIL_OPEN" };
    }
}
