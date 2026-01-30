
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function test(name) {
    try {
        const m = genAI.getGenerativeModel({ model: name });
        await m.generateContent("hi");
        console.log(`${name}: OK`);
    } catch (e) {
        console.log(`${name}: FAIL`);
    }
}

async function run() {
    await test("gemini-1.5-flash-001");
    await test("gemini-1.5-flash-002");
    await test("gemini-1.5-pro-002");
    await test("gemini-1.0-pro");
}

run();
