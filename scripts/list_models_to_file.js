
const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GOOGLE_API_KEY);
        const json = await response.json();

        if (json.models) {
            console.log(JSON.stringify(json.models, null, 2));
        } else {
            console.log("No models found or error:", JSON.stringify(json));
        }
    } catch (e) {
        console.error(e);
    }
})();
