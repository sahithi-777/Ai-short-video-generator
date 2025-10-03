// AiModel.js
const { GoogleGenAI } = require('@google/generative-ai');

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

const config = {
  responseModalities: ['IMAGE', 'TEXT'],
  temperature: 1,
  maxOutputTokens: 8192,
  topP: 0.95,
  topK: 64,
  responseMimeType: 'application/json',
};

const model = ai.getGenerativeModel({
  model: 'gemini-2.5-flash-image-preview',
  generationConfig: config,
});

const chatSession = model.startChat({
  history: [
    {
      role: 'user',
      parts: [
        {
          text: "Write a script to generate 30 seconds video on topic Interesting Historical story along with AI image prompt Realistic for each scene and give me result in JSON format imagePrompt and ContextText as fields",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "scenes": [\n    {\n      "imagePrompt": "A medieval knight in shining armor standing in a lush green field with a castle in the background, under a bright blue sky",\n      "contextText": "In the heart of the medieval era, a brave knight stands tall, ready to defend his kingdom."\n    },\n    {\n      "imagePrompt": "A bustling medieval marketplace with vendors selling goods, people in period clothing, and colorful tents",\n      "contextText": "The marketplace is alive with activity as merchants and townsfolk go about their daily lives."\n    },\n    {\n      "imagePrompt": "A grand medieval castle on a hilltop during sunset, with banners flying and a moat surrounding it",\n      "contextText": "As the sun sets, the majestic castle stands as a symbol of power and protection for the realm."\n    }\n  ]\n}'
        }
      ]
    }
  ],
});

export { chatSession };