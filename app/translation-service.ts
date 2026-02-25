'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { translateText } from "./actions/translate";

/**
 * RECURSIVE TRANSLATION SERVICE
 * 
 * Translates a full analysis result object to any target language.
 * Skips risk levels & severity values (High/Medium/Low).
 */

// UI labels per language code
const UI_LABELS: Record<string, Record<string, string>> = {
    hi: {
        legal_summary: "कानूनी पाठ सारांश",
        what_means: "आपके लिए इसका क्या मतलब है",
        key_clauses: "महत्वपूर्ण खंड",
        red_flags: "जोखिम (Red Flags)",
        analysis_result: "विश्लेषण परिणाम",
        back_to_upload: "वापस अपलोड पर जाएं",
        legal_disclaimer: "यह उपकरण केवल सूचनात्मक उद्देश्यों के लिए है और कानूनी सलाह नहीं देता है।"
    },
    mr: {
        legal_summary: "कायदेशीर मजकूर सारांश",
        what_means: "आपल्यासाठी याचा अर्थ काय",
        key_clauses: "महत्त्वाचे कलम",
        red_flags: "जोखीम",
        analysis_result: "विश्लेषण निकाल",
        back_to_upload: "अपलोडवर परत जा",
        legal_disclaimer: "हे साधन केवळ माहितीच्या उद्देशाने आहे आणि कायदेशीर सल्ला देत नाही."
    },
    gu: {
        legal_summary: "કાનૂની ટેક્સ્ટ સારાંશ",
        what_means: "આ તમારા માટે શું અર્થ ધરાવે છે",
        key_clauses: "મહત્ત્વપૂર્ણ કલમો",
        red_flags: "જોखिम",
        analysis_result: "વિશ્લેષણ પરિણામ",
        back_to_upload: "અપલોડ પર પાછા જાઓ",
        legal_disclaimer: "આ ટૂલ માત્ર માહિતી હેતુ માટે છે અને કાનૂની સલાહ નથી."
    },
    ta: {
        legal_summary: "சட்ட உரை சுருக்கம்",
        what_means: "இது உங்களுக்கு என்ன அர்த்தம்",
        key_clauses: "முக்கிய பிரிவுகள்",
        red_flags: "அபாய அறிகுறிகள்",
        analysis_result: "பகுப்பாய்வு முடிவு",
        back_to_upload: "பதிவேற்றத்திற்கு திரும்பு",
        legal_disclaimer: "இந்த கருவி தகவல் நோக்கத்திற்காக மட்டுமே வழங்கப்படுகிறது."
    },
    te: {
        legal_summary: "చట్టపరమైన వచన సారాంశం",
        what_means: "ఇది మీకు ఏమి అర్థమవుతుంది",
        key_clauses: "ముఖ్యమైన అంశాలు",
        red_flags: "ప్రమాద సంకేతాలు",
        analysis_result: "విశ్లేషణ ఫలితం",
        back_to_upload: "అప్‌లోడ్‌కు తిరిగి వెళ్ళండి",
        legal_disclaimer: "ఈ సాధనం సమాచార ప్రయోజనాల కోసం మాత్రమే అందించబడింది."
    },
    kn: {
        legal_summary: "ಕಾನೂನು ಪಠ್ಯ ಸಾರಾಂಶ",
        what_means: "ಇದು ನಿಮಗೆ ಏನು ಅರ್ಥ",
        key_clauses: "ಪ್ರಮುಖ ಷರತ್ತುಗಳು",
        red_flags: "ಅಪಾಯ ಸಂಕೇತಗಳು",
        analysis_result: "ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ",
        back_to_upload: "ಅಪ್‌ಲೋಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
        legal_disclaimer: "ಈ ಸಾಧನ ಮಾಹಿತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ."
    },
    ml: {
        legal_summary: "നിയമ ടെക്‌സ്‌റ്റ് സംഗ്രഹം",
        what_means: "ഇത് നിങ്ങൾക്ക് എന്ത് അർഥമാക്കുന്നു",
        key_clauses: "പ്രധാന വ്യവസ്ഥകൾ",
        red_flags: "അപകട സൂചനകൾ",
        analysis_result: "വിശകലന ഫലം",
        back_to_upload: "അപ്‌ലോഡിലേക്ക് മടങ്ങുക",
        legal_disclaimer: "ഈ ഉപകരണം വിവര ആവശ്യങ്ങൾക്ക് മാത്രമാണ്."
    },
    bn: {
        legal_summary: "আইনি পাঠ সারাংশ",
        what_means: "এটি আপনার জন্য কী অর্থ রাখে",
        key_clauses: "গুরুত্বপূর্ণ ধারাসমূহ",
        red_flags: "ঝুঁকির সংকেত",
        analysis_result: "বিশ্লেষণ ফলাফল",
        back_to_upload: "আপলোডে ফিরে যান",
        legal_disclaimer: "এই সরঞ্জামটি শুধুমাত্র তথ্যমূলক উদ্দেশ্যে প্রদান করা হয়েছে।"
    },
    pa: {
        legal_summary: "ਕਾਨੂੰਨੀ ਪਾਠ ਸਾਰ",
        what_means: "ਇਸਦਾ ਤੁਹਾਡੇ ਲਈ ਕੀ ਅਰਥ ਹੈ",
        key_clauses: "ਮਹੱਤਵਪੂਰਨ ਧਾਰਾਵਾਂ",
        red_flags: "ਜੋਖਮ ਦੇ ਸੰਕੇਤ",
        analysis_result: "ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ",
        back_to_upload: "ਅਪਲੋਡ ਤੇ ਵਾਪਸ ਜਾਓ",
        legal_disclaimer: "ਇਹ ਸੰਦ ਕੇਵਲ ਜਾਣਕਾਰੀ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਹੈ।"
    },
    en: {
        legal_summary: "Legal Text Summarization",
        what_means: "What this means for you",
        key_clauses: "Key Clauses Breakdown",
        red_flags: "Red Flags",
        analysis_result: "Analysis Result",
        back_to_upload: "Back to Upload",
        legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice."
    }
};

export async function translateAnalysisResult(data: any, targetLang: string): Promise<any> {
    try {
        if (!data) throw new Error("No data provided");

        // Default to English if lang is not recognized
        const lang = targetLang || 'en';

        console.log(`Translating full analysis to ${lang}...`);

        const SKIP_VALUES = ['High', 'Medium', 'Low', 'high', 'medium', 'low'];

        const translateObject = async (obj: any): Promise<any> => {
            if (typeof obj === 'string' && obj.trim().length > 0) {
                if (SKIP_VALUES.includes(obj.trim())) return obj;
                try {
                    return await translateText(obj, lang);
                } catch {
                    return obj; // fallback to original
                }
            } else if (Array.isArray(obj)) {
                return await Promise.all(obj.map(item => translateObject(item)));
            } else if (typeof obj === 'object' && obj !== null) {
                const newObj: any = {};
                for (const key in obj) {
                    newObj[key] = await translateObject(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        const translatedData = await translateObject(data);
        const labels = UI_LABELS[lang] || UI_LABELS['en'];

        return { data: translatedData, labels };

    } catch (error) {
        console.error("Translation Pipeline failed:", error);
        return { data, labels: UI_LABELS['en'] };
    }
}
