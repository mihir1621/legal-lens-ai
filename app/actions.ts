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
                let rawText = data.text;

                // SMART SAMPLING: If it's a huge document, take the beginning and the end
                // Most important legal info (parties, definitions) is at the start.
                // Signatures and specific items are at the end.
                if (rawText.length > 8000) {
                    const start = rawText.substring(0, 6000);
                    const end = rawText.substring(rawText.length - 2000);
                    rawText = `${start}\n\n[...Parts omitted for speed...]\n\n${end}`;
                }

                // If text is very short or empty, consider it a scan
                if (!rawText || rawText.trim().length < 50) {
                    const base64 = buffer.toString('base64');
                    text = `IMAGE_DATA:application/pdf;base64,${base64}`;
                } else {
                    text = rawText;
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

                if (text.length > 8000) {
                    text = text.substring(0, 7500) + "\n\n[...Omitted for length...]";
                }
            } catch (e) {
                console.error("Mammoth Error", e);
                return { text: '', error: 'Failed to extract text from DOCX' };
            }
        } else if (file.type.startsWith('image/')) {
            // It's an image, convert to base64
            const base64 = buffer.toString('base64');
            text = `IMAGE_DATA:${file.type};base64,${base64}`;
        } else {
            // Assume text/plain
            text = buffer.toString('utf-8').substring(0, 8000);
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
