
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testModel(name) {
    console.log(`Testing ${name}...`);
    try {
        const model = genAI.getGenerativeModel({ model: name });
        const res = await model.generateContent("Hi");
        console.log(`${name}: SUCCESS`);
    } catch (e) {
        console.log(`${name}: FAILED - ${e.message}`);
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-8b");
    await testModel("gemini-1.5-pro");
    await testModel("gemini-pro");
}

run();
