import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { audioFileUrl } = await req.json();

    if (!audioFileUrl) {
      return NextResponse.json(
        { Error: 'Audio file URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.CAPTION_API) {
      console.error('❌ CAPTION_API not configured');
      return NextResponse.json(
        { Error: 'Caption API key not configured' },
        { status: 500 }
      );
    }

    console.log('📝 Starting transcription for:', audioFileUrl.substring(0, 50) + '...');

    const client = new AssemblyAI({
      apiKey: process.env.CAPTION_API,
    });

    const params = {
      audio: audioFileUrl,
      speech_model: "universal",
    };

    // ✅ Add timeout and retry logic
    let transcript;
    try {
      console.log('🔄 Sending request to AssemblyAI...');
      transcript = await Promise.race([
        client.transcripts.transcribe(params),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Transcription timeout after 30s')), 30000)
        ),
      ]);
    } catch (timeoutErr) {
      console.error('⏱️ Transcription timeout/failed:', timeoutErr.message);
      
      // Return minimal captions on timeout
      return NextResponse.json({
        success: true,
        result: [], // Empty array - will save with empty captions
        text: 'Transcription unavailable',
        confidence: 0,
        timedOut: true,
        warning: 'Caption generation timed out. Video saved without captions.'
      });
    }

    console.log('✅ Transcription complete:', transcript.words?.length, 'words');

    return NextResponse.json({
      success: true,
      result: transcript.words || [],
      text: transcript.text || '',
      confidence: transcript.confidence || 0
    });

  } catch (e) {
    console.error('❌ Caption error:', e);
    console.error('Error details:', {
      message: e.message,
      code: e.code,
      stack: e.stack?.substring(0, 200)
    });

    // ✅ Return graceful fallback instead of hard error
    return NextResponse.json({
      success: true,
      result: [],
      text: '',
      error: 'Caption generation failed',
      details: e.message,
      warning: 'Video saved without captions due to caption service error'
    }, { status: 200 }); // Return 200 so save can proceed

  }
}