// app/api/generate-images-batch/route.js
// Uses Pollinations.ai - FREE, NO API KEY REQUIRED!
import { NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { UTApi } from 'uploadthing/server';

// Initialize UploadThing API
const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

// Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate image using Pollinations.ai (Free, no API key)
const generateImage = async (prompt, sceneIndex, retryCount = 0) => {
  try {
    console.log(`🎨 Generating image ${sceneIndex + 1}: ${prompt.substring(0, 60)}...`);
    
    // Pollinations.ai - completely free
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Image ${sceneIndex + 1} generated successfully`);
    return {
      success: true,
      data: Buffer.from(response.data),
      sceneIndex
    };

  } catch (error) {
    console.error(`❌ Error generating image ${sceneIndex + 1}:`, error.message);
    
    if (retryCount < 3) {
      console.log(`🔄 Retrying image ${sceneIndex + 1} (attempt ${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return generateImage(prompt, sceneIndex, retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message,
      sceneIndex
    };
  }
};

// Save image temporarily
const saveTempImage = (imageBuffer, filename, directory) => {
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, imageBuffer);
  return filePath;
};

// Upload to UploadThing
const uploadToUploadThing = async (filePath, filename) => {
  try {
    console.log(`☁️ Uploading ${filename} to UploadThing...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const file = new File([fileBuffer], filename, { type: 'image/png' });
    
    const response = await utapi.uploadFiles([file]);
    
    if (response[0].data) {
      console.log(`✅ Uploaded: ${response[0].data.url}`);
      return {
        success: true,
        url: response[0].data.url,
        key: response[0].data.key,
        name: response[0].data.name,
        size: response[0].data.size
      };
    } else {
      throw new Error(response[0].error || 'Upload failed');
    }
  } catch (error) {
    console.error(`❌ Upload error for ${filename}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Cleanup local file
const cleanupLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`⚠️ Cleanup failed:`, error.message);
  }
};

export async function POST(req) {
  const tempDir = path.join(process.cwd(), 'temp-images');
  
  try {
    const { scenes, videoId } = await req.json();

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { Error: 'Invalid scenes data' },
        { status: 400 }
      );
    }

    if (!process.env.UPLOADTHING_TOKEN) {
      return NextResponse.json(
        { Error: 'UploadThing token not configured' },
        { status: 500 }
      );
    }

    console.log(`🎬 Starting image generation for ${scenes.length} scenes`);
    console.log(`🤖 Using Pollinations.ai (Free)`);

    const timestamp = Date.now();
    const sessionId = videoId || `video_${timestamp}`;
    ensureDirectoryExists(tempDir);

    // Generate images in batches
    const batchSize = 2;
    const results = [];

    for (let i = 0; i < scenes.length; i += batchSize) {
      const batch = scenes.slice(i, i + batchSize);
      const batchPromises = batch.map((scene, index) => 
        generateImage(scene.imagePrompt, i + index)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scenes.length / batchSize)} complete`);
      
      // Small delay between batches
      if (i + batchSize < scenes.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Upload successful images
    const imageMetadata = [];
    const failedImages = [];

    for (const result of results) {
      if (result.success) {
        const filename = `${sessionId}_scene_${result.sceneIndex + 1}_${timestamp}.png`;
        const tempFilePath = saveTempImage(result.data, filename, tempDir);
        
        const uploadResult = await uploadToUploadThing(tempFilePath, filename);
        
        if (uploadResult.success) {
          imageMetadata.push({
            sceneIndex: result.sceneIndex,
            filename: uploadResult.name,
            url: uploadResult.url,
            key: uploadResult.key,
            size: uploadResult.size,
            prompt: scenes[result.sceneIndex].imagePrompt
          });
        } else {
          failedImages.push({
            sceneIndex: result.sceneIndex,
            error: `Upload failed: ${uploadResult.error}`,
            prompt: scenes[result.sceneIndex].imagePrompt
          });
        }
        
        cleanupLocalFile(tempFilePath);
      } else {
        failedImages.push({
          sceneIndex: result.sceneIndex,
          error: result.error,
          prompt: scenes[result.sceneIndex].imagePrompt
        });
      }
    }

    // Cleanup temp directory
    try {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        fs.rmdirSync(tempDir);
      }
    } catch (error) {
      console.error('⚠️ Directory cleanup failed:', error.message);
    }

    const response = {
      success: true,
      sessionId,
      totalScenes: scenes.length,
      successfulImages: imageMetadata.length,
      failedImages: failedImages.length,
      images: imageMetadata,
      failures: failedImages.length > 0 ? failedImages : undefined,
      storage: 'uploadthing',
      imageProvider: 'pollinations.ai'
    };

    console.log(`✅ Complete! Success: ${imageMetadata.length}/${scenes.length}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Batch generation error:', error);
    
    // Cleanup on error
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => fs.unlinkSync(path.join(tempDir, file)));
        fs.rmdirSync(tempDir);
      }
    } catch (cleanupError) {
      console.error('⚠️ Error cleanup failed:', cleanupError.message);
    }
    
    return NextResponse.json(
      { 
        Error: 'Failed to generate and upload images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}