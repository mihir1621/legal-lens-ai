"use client";

import { translateText } from "@/app/actions/translate";
import { useState } from "react";

export default function Translator() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    async function handleTranslate() {
        const result = await translateText(input);
        setOutput(result);
    }

    return (
        <div className="p-6 space-y-4">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 border rounded text-black"
                placeholder="Enter English text..."
            />
            <button
                onClick={handleTranslate}
                className="bg-violet-600 text-white px-4 py-2 rounded"
            >
                Translate
            </button>
            <div className="p-4 bg-gray-100 rounded min-h-[50px] text-black">
                {output || "Translated text will appear here..."}
            </div>
        </div>
    );
}
