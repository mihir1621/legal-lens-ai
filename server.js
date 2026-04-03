import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env.local"), override: true });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// ✅ STEP 1: Pre-processing function
function processDocument(text) {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  const wordCount = cleanedText.split(" ").length;
  if (wordCount > 4000) {
    return { error: "Document too long. Please upload a smaller file." };
  }

  const limitedText = cleanedText.slice(0, 15000);
  return { text: limitedText };
}


// ✅ Health Check
app.get("/", (req, res) => {
  res.json({ status: "✅ LegalLens AI server is running", endpoint: "POST /analyze" });
});


// ✅ STEP 2: API Route
app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    const processed = processDocument(text);
    if (processed.error) {
      return res.json({ error: processed.error });
    }

    // ✅ STEP 3: PROMPT
    const prompt = `
You are a strict and reliable legal AI assistant.

Return ONLY valid JSON. No extra text.

Rules:
- Do NOT hallucinate
- If information is missing, return empty arrays []
- Keep responses concise and professional

Limits:
- Summary ≤ 120 words
- Max 7 key_clauses
- Max 5 risks
- Max 5 obligations

Output format:
{
  "summary": "",
  "key_clauses": [
    { "title": "", "description": "" }
  ],
  "risks": [
    { "issue": "", "severity": "Low|Medium|High", "explanation": "" }
  ],
  "important_dates": [
    { "date": "", "context": "" }
  ],
  "obligations": [
    { "party": "", "duty": "" }
  ],
  "red_flags": [],
  "confidence_score": 0
}

Analyze the following legal document:

"""
${processed.text}
"""
`;

    // ✅ STEP 4: AI Call
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ STEP 5: Parse response
    let data;
    try {
      data = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      return res.json({ error: "AI returned invalid JSON" });
    }

    // ✅ STEP 6: Send result
    res.json(data);

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ STEP 7: Start server
app.listen(5000, () => {
  console.log("✅ LegalLens AI server running on http://localhost:5000");
});
