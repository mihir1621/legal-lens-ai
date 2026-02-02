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
