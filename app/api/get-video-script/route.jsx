// app/api/get-video-script/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    // Check if API key exists
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('API Key is missing!');
      return NextResponse.json({ 
        'Error': 'API Key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file' 
      }, { status: 500 });
    }

    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });

    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
      history: [
        {
          role: 'user',
          parts: [
            {
              text: "Write a script to generate 30 seconds video on topic Interesting Historical story along with AI image prompt Realistic for each scene and give me result in JSON format with imagePrompt and ContextText as fields",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: '{"scenes":[{"imagePrompt":"A medieval knight in shining armor standing in a lush green field with a castle in the background, under a bright blue sky","contextText":"In the heart of the medieval era, a brave knight stands tall, ready to defend his kingdom."},{"imagePrompt":"A bustling medieval marketplace with vendors selling goods, people in period clothing, and colorful tents","contextText":"The marketplace is alive with activity as merchants and townsfolk go about their daily lives."},{"imagePrompt":"A grand medieval castle on a hilltop during sunset, with banners flying and a moat surrounding it","contextText":"As the sun sets, the majestic castle stands as a symbol of power and protection for the realm."}]}'
            }
          ]
        }
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    console.log('AI Response:', responseText);

    // Remove markdown code blocks if present
    let cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to parse the JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text:', cleanedResponse);
      return NextResponse.json({ 
        'Error': 'Failed to parse AI response',
        'RawResponse': cleanedResponse 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 'result': parsedResult });
  } catch (e) {
    console.error('API Error:', e);
    console.error('Error stack:', e.stack);
    return NextResponse.json({ 
      'Error': e.message,
      'Type': e.constructor.name,
      'Details': e.stack 
    }, { status: 500 });
  }
}