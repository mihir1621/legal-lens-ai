'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

export async function extractTextFromFile(formData: FormData): Promise<{ text: string; error?: string }> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { text: '', error: 'No file uploaded' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let text = '';

        if (file.type === 'application/pdf') {
            try {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mod = await import('pdf-parse');
                const PDFParse = mod.PDFParse || (mod as any).default?.PDFParse || (mod as any).default;

                // Handle different import structures (CJS vs ESM interop)
                const P = (PDFParse || mod) as any;

                // Check if it's the class (v2) or function (v1) - just in case
                if (typeof P === 'function' && P.prototype && P.prototype.getText) {
                    const parser = new P({ data: buffer });
                    const data = await parser.getText();
                    text = data.text;
                    await parser.destroy();
                } else if (typeof P === 'function') {
                    // Fallback to v1 if somehow we got that?
                    const data = await P(buffer);
                    text = data.text;
                } else {
                    throw new Error("Could not find PDFParse class or function");
                }
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
                throw new Error("Failed to parse DOCX on server");
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
