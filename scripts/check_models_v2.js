
const API_KEY = process.env.GOOGLE_API_KEY;

async function list() {
    try {
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY);
        const data = await res.json();
        console.log("Status:", res.status);
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.version}) [${m.supportedGenerationMethods.join(', ')}]`);
            });
        } else {
            console.log("Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

list();
