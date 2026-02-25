import { translateText } from "@/app/actions/translate";

const UI_LABELS: Record<string, Record<string, string>> = {
    hi: {
        legal_summary: "कानूनी पाठ सारांश",
        what_means: "आपके लिए इसका क्या मतलब है",
        key_clauses: "प्रमुख धाराओं का विवरण",
        red_flags: "चेतावनी संकेत (Red Flags)",
        analysis_result: "विश्लेषण परिणाम",
        back_to_upload: "अपलोड पर वापस जाएं",
        legal_disclaimer: "यह उपकरण केवल जानकारी के लिए है और इसमें कानूनी सलाह शामिल नहीं है।",
        docs_required: "आवश्यक दस्तावेज़"
    },
    mr: {
        legal_summary: "कायदेशीर मजकूर सारांश",
        what_means: "तुमच्यासाठी याचा काय अर्थ आहे",
        key_clauses: "प्रमुख कलमांचा तपशील",
        red_flags: "धोकादायक गुणधर्म (Red Flags)",
        analysis_result: "विश्लेषण अहवाल",
        back_to_upload: "अपलोडवर परत जा",
        legal_disclaimer: "हे साधन केवळ माहितीसाठी आहे आणि ही कायदेशीर सल्ला नाही.",
        docs_required: "आवश्यक कागदपत्रे"
    },
    gu: {
        legal_summary: "કાનૂની લખાણ સારાંશ",
        what_means: "તમારા માટે આનો શું અર્થ છે",
        key_clauses: "મુખ્ય કલમોની સમજ",
        red_flags: "ચેતવણી ચિહ્નો (Red Flags)",
        analysis_result: "વિશ્લેષણ પરિણામ",
        back_to_upload: "અપલોડ પર પાછા જાઓ",
        legal_disclaimer: "આ સાધન માત્ર માહિતી માટે છે અને તે કાનૂની સલાહ નથી.",
        docs_required: "જરૂરી દસ્તાવેજો"
    },
    ta: {
        legal_summary: "சட்ட உரையின் சுருக்கம்",
        what_means: "இது உங்களுக்கு என்ன பொருள்?",
        key_clauses: "முக்கிய பிரிவுகளின் விளக்கம்",
        red_flags: "எச்சரிக்கை அறிகுறிகள்",
        analysis_result: "ஆய்வு முடிவு",
        back_to_upload: "பதிவேற்றத்திற்குத் திரும்பு",
        legal_disclaimer: "இந்தக் கருவி தகவல் நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகிறது, இது சட்ட ஆலோசனையல்ல.",
        docs_required: "தேவையான ஆவணங்கள்"
    },
    te: {
        legal_summary: "చట్టపరమైన పాఠ్యం సారాంశం",
        what_means: "మీకు దీని వల్ల కలిగే అర్థం",
        key_clauses: "ముఖ్యమైన నిబంధనల వివరణ",
        red_flags: "హెచ్చరిక సంਕੇతాలు",
        analysis_result: "విశ్ਲੇషణ ఫలితం",
        back_to_upload: "అప్‌లోడ్ వెనక్కి వెళ్ళండి",
        legal_disclaimer: "ఈ పరికరం కేవలం సమాచారం కోసం మాత్రమే, ఇది చట్టపరమైన సలహా కాదు.",
        docs_required: "అవసరమైన పత్రాలు"
    },
    kn: {
        legal_summary: "ಕಾನೂನು ಪಠ್ಯದ ಸಾರಾಂಶ",
        what_means: "ನಿಮ್ಮ ಪಾಲಿಗೆ ಇದರ ಅರ್ಥವೇನು?",
        key_clauses: "ಪ್ರಮುಖ ನಿಯಮಗಳ ವಿವರ",
        red_flags: "ಎಚ್ಚರಿಕೆ ಇರಲಿ",
        analysis_result: "ವಿಶ್ಲೇಷಣೆ ಫಲਿਤಾಂಶ",
        back_to_upload: "ಅಪ್‌ಲೋಡ್‌ಗೆ ಮರಳಿ",
        legal_disclaimer: "ಈ ಉಪಕರಣವು ಕೇವಲ ಮಾಹಿತಿ ಉದ್ದೇಶಕ್ಕಾಗಿ ಇರಬಹುದು ಮತ್ತು ಇದು ಕಾನೂನು ಸಲಹೆಯಲ್ಲ.",
        docs_required: "ಅಗತ್ಯ ದಾಖಲೆಗಳು"
    },
    ml: {
        legal_summary: "നിയമപരമായ പാഠത്തിൻ്റെ സംഗ്രഹം",
        what_means: "ഇത് നിങ്ങൾക്ക് എന്ത് അർത്ഥമാക്കുന്നു?",
        key_clauses: "പ്രധാന വകുപ്പുകളുടെ വിവരണം",
        red_flags: "ജാഗ്രതാ നിർദ്ദേശങ്ങൾ",
        analysis_result: "വിശകലന ഫലം",
        back_to_upload: "അപ്‌ലോഡിലേക്ക് തിരികെ പോകുക",
        legal_disclaimer: "ഈ ഉപകരണം വിവരങ്ങൾക്കായി മാത്രം നൽകിയിട്ടുള്ളതാണ്, ഇത് നിയമപരമായ ഉപദേശമല്ല.",
        docs_required: "ആവശ്യമായ രേഖകൾ"
    },
    bn: {
        legal_summary: "আইনি পাঠ্যের সারসংক্ষেপ",
        what_means: "আপনার জন্য এর অর্থ কী?",
        key_clauses: "প্রধান ধারার বিবরণ",
        red_flags: "সতর্কতা চিহ্ন",
        analysis_result: "বিশ্লেষণ ফলাফল",
        back_to_upload: "আপলোডে ফিরে যান",
        legal_disclaimer: "এই টুলটি শুধুমাত্র তথ্যের জন্য এবং এটি কোনো আইনি পরামর্শ নয়।",
        docs_required: "প্রয়োজনীয় নথি"
    },
    pa: {
        legal_summary: "ਕਾਨੂੰਨੀ ਪਾਠ ਦਾ ਸਾਰ",
        what_means: "ਤੁਹਾਡੇ ਲਈ ਇਸਦਾ ਕੀ ਮਤਲਬ ਹੈ?",
        key_clauses: "ਮੁੱਖ ਧਾਰਾਵਾਂ ਦਾ ਵੇਰਵਾ",
        red_flags: "ਚੇਤਾਵਨੀ ਸੰਕੇਤ",
        analysis_result: "ਵਿਸ਼ਲੇਸ਼ਣ ਦਾ ਨਤੀਜਾ",
        back_to_upload: "ਅਪਲੋਡ 'ਤੇ ਵਾਪਸ ਜਾਓ",
        legal_disclaimer: "ਇਹ ਸਾਧਨ ਕੇਵਲ ਜਾਣਕਾਰੀ ਲਈ ਹੈ ਅਤੇ ਇਹ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ ਹੈ।",
        docs_required: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼"
    },
    en: {
        legal_summary: "Legal Text Summarization",
        what_means: "What this means for you",
        key_clauses: "Key Clauses Breakdown",
        red_flags: "Red Flags",
        analysis_result: "Analysis Result",
        back_to_upload: "Back to Upload",
        legal_disclaimer: "This tool is provided for informational purposes only and does not constitute legal advice.",
        docs_required: "Documents Required"
    }
};

export async function translateAnalysisResult(data: any, targetLang: string) {
    if (targetLang === 'en') return { data, labels: UI_LABELS.en };

    const translatedData = { ...data };

    try {
        // 1. Translate Summary
        if (data.summary_simple) {
            translatedData.summary_simple = await translateText(data.summary_simple, targetLang);
        }

        // 2. Translate what_it_means array
        if (data.what_it_means && Array.isArray(data.what_it_means)) {
            translatedData.what_it_means = await Promise.all(
                data.what_it_means.map((item: string) => translateText(item, targetLang))
            );
        }

        // 3. Translate key_clauses array
        if (data.key_clauses && Array.isArray(data.key_clauses)) {
            translatedData.key_clauses = await Promise.all(
                data.key_clauses.map(async (clause: any) => ({
                    ...clause,
                    title: await translateText(clause.title, targetLang),
                    explanation: await translateText(clause.explanation, targetLang)
                }))
            );
        }

        // 4. Translate red_flags array
        if (data.red_flags && Array.isArray(data.red_flags)) {
            translatedData.red_flags = await Promise.all(
                data.red_flags.map(async (flag: any) => ({
                    ...flag,
                    reason: await translateText(flag.reason, targetLang)
                }))
            );
        }

        // 5. Translate documents_required array
        if (data.documents_required && Array.isArray(data.documents_required)) {
            translatedData.documents_required = await Promise.all(
                data.documents_required.map(async (doc: any) => ({
                    ...doc,
                    name: await translateText(doc.name, targetLang),
                    purpose: await translateText(doc.purpose, targetLang),
                    how_to_obtain: await Promise.all(
                        (doc.how_to_obtain || []).map((step: string) => translateText(step, targetLang))
                    )
                }))
            );
        }

        return {
            data: translatedData,
            labels: UI_LABELS[targetLang] || UI_LABELS.hi // Fallback to Hindi if lang not found
        };
    } catch (error) {
        console.error("Error translating analysis result:", error);
        return { data, labels: UI_LABELS[targetLang] || UI_LABELS.en };
    }
}
