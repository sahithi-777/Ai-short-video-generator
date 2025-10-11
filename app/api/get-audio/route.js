// app/api/get-audio/route.js
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ElevenLabsClient } from "elevenlabs";
import { UTApi } from "uploadthing/server";

export async function POST(req) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ElevenLabs API Key is missing!');
      return NextResponse.json({ 
        'Error': 'API Key is not configured. Please add ELEVENLABS_API_KEY to your .env.local file' 
      }, { status: 500 });
    }

    const body = await req.json();
    const { text, scenes } = body;

    // Support both single text and array of scenes
    let fullText = '';
    
    if (scenes && Array.isArray(scenes)) {
      // Combine all scene texts with longer pauses
      // Using multiple periods creates natural pauses in speech
      fullText = scenes
        .map(scene => scene.contextText || scene.contentText || scene.text)
        .filter(text => text && text.trim().length > 0)
        .join('. ... ... ');
      console.log(`🎙️ Generating audio for ${scenes.length} scenes`);
    } else if (text) {
      fullText = text;
      console.log('🎙️ Generating audio for single text');
    } else {
      return NextResponse.json({ 
        'Error': 'Invalid request. Either "text" or "scenes" array is required.' 
      }, { status: 400 });
    }

    if (!fullText || fullText.trim().length === 0) {
      return NextResponse.json({ 
        'Error': 'Text content is empty.' 
      }, { status: 400 });
    }

    // Log the actual scenes being processed
    if (scenes && Array.isArray(scenes)) {
      console.log('📋 Scenes breakdown:');
      scenes.forEach((scene, index) => {
        const text = scene.contextText || scene.contentText || scene.text;
        console.log(`   Scene ${index + 1}: "${text?.substring(0, 50)}..." (${text?.length || 0} chars)`);
      });
    }

    if (fullText.length > 5000) {
      return NextResponse.json({ 
        'Error': 'Combined text is too long. Maximum length is 5000 characters.' 
      }, { status: 400 });
    }

    console.log('📝 Full text length:', fullText.length, 'characters');
    console.log('📝 Text preview:', fullText.substring(0, 200) + '...');

    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Generate audio with optimal settings
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
    
    console.log('🎤 Calling ElevenLabs API...');
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: fullText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    });

    // Convert audio stream to buffer
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Generate unique filename
    const filename = `story_${uuidv4()}.mp3`;
    
    console.log('📤 Uploading to UploadThing...');
    
    // Initialize UploadThing API
    const utapi = new UTApi();
    
    // Create a File object from the buffer
    const audioFile = new File([audioBuffer], filename, { type: 'audio/mpeg' });
    
    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles(audioFile);
    
    if (!uploadResponse.data) {
      throw new Error('Failed to upload to UploadThing');
    }
    
    const fileSizeKB = (audioBuffer.length / 1024).toFixed(2);
    console.log(`✅ Audio uploaded to UploadThing: ${filename} (${fileSizeKB} KB)`);
    console.log(`🔗 URL: ${uploadResponse.data.url}`);

    return NextResponse.json({ 
      success: true,
      id: uuidv4(),
      filename: filename,
      audioFileUrl: uploadResponse.data.url,
      fileKey: uploadResponse.data.key,
      fileSize: audioBuffer.length,
      fileSizeKB: fileSizeKB,
      text: fullText,
      sceneCount: scenes?.length || 1
    });

  } catch (e) {
    console.error('❌ Audio Generation Error:', e);
    console.error('Error stack:', e.stack);
    
    let errorMessage = e.message;

    if (e.message?.includes('quota')) {
      errorMessage = 'ElevenLabs API quota exceeded. Please check your account.';
    } else if (e.message?.includes('unauthorized') || e.message?.includes('401')) {
      errorMessage = 'Invalid ElevenLabs API key.';
    } else if (e.message?.includes('voice')) {
      errorMessage = 'Voice ID not found or invalid.';
    } else if (e.message?.includes('UploadThing')) {
      errorMessage = 'Failed to upload audio file to storage.';
    }

    return NextResponse.json({ 
      success: false,
      'Error': errorMessage,
      'Type': e.constructor.name,
      'Details': process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}