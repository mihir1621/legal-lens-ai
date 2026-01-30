
const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GOOGLE_API_KEY);
        const json = await response.json();

        if (json.models) {
            const names = json.models.map(m => m.name.replace('models/', ''));
            console.log("Found models:", names);

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

            for (const name of names) {
                // Skip vision/audio only models if possible (by name heuristic)
                if (name.includes('audio') || name.includes('image') || name.includes('veo')) continue;

                console.log(`Testing ${name}...`);
                try {
                    const model = genAI.getGenerativeModel({ model: name });
                    const res = await model.generateContent("Test");
                    console.log(`✅ ${name}: WORKING! Response: ${res.response.text().substring(0, 20)}...`);
                } catch (e) {
                    console.log(`❌ ${name}: Failed - ${e.message.split('[')[0]}...`); // Short error
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
