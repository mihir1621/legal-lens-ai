'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

// OpenRouter SDK replaced by native fetch for better control
// const openrouter = ... (removed)

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
                // Translation logic moved to app/translation-service.ts
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
