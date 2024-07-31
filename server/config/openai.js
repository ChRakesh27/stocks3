const OpenAIApi = require("openai");

const openai = new OpenAIApi({ apiKey: process.env.OPEN_AI_KEY });

module.exports = openai;
