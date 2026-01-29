# LegalLens AI

LegalLens is an AI-powered legal document simplifier that helps users understand contracts, rental agreements, and policies instantly.

## Features

- **Upload & Analyze**: Support for PDF, DOCX, and Text.
- **AI Simplification**: Explains complex terms in simple English.
- **Risk Detection**: Highlights dangerous clauses (e.g., non-refundable deposits).
- **Comparison**: Compare two contracts side-by-side.
- **History**: Track previously analyzed documents.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Locally**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

To enable real AI features and Firebase Storage:

1. Create a `.env.local` file in the root.
2. Add your keys:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # AI Provider (OpenAI / Gemini)
   OPENAI_API_KEY=your_openai_key
   # or
   GOOGLE_API_KEY=your_gemini_key
   ```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Backend Flow**: Server Actions for file parsing (pdf-parse, mammoth)

## Disclaimer

This tool provides informational simplification and is not legal advice.
