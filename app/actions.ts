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
                text = data.text;
            } catch (e) {
                console.error("PDF Parse Error", e);
                // Fallback to simple string conversion if pdf-parse fails
                text = buffer.toString('utf-8');
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

export async function verifyRecaptcha(token: string, action: string) {
    const projectID = "legallens-ai-24087";
    const apiKey = process.env.GOOGLE_API_KEY;
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
