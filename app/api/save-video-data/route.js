import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { script, audioFileUrl, captions, imageList, createdBy } = await req.json();

    console.log('📥 Incoming data:', {
      scriptLength: script?.scenes?.length,
      audioUrl: audioFileUrl?.substring(0, 50),
      imageCount: Array.isArray(imageList) ? imageList.length : 'not array',
      createdBy
    });

    // Validate
    if (!script) {
      return NextResponse.json({ Error: 'Script is required' }, { status: 400 });
    }
    if (!audioFileUrl || typeof audioFileUrl !== 'string') {
      return NextResponse.json({ Error: 'Valid audio URL is required' }, { status: 400 });
    }
    if (!createdBy) {
      return NextResponse.json({ Error: 'Creator email is required' }, { status: 400 });
    }

    // ✅ Normalize captions to array
    let captionData = [];
    if (Array.isArray(captions)) {
      captionData = captions;
    } else if (captions && typeof captions === 'object') {
      captionData = [captions];
    }

    // ✅ Normalize imageList to array
    let images = [];
    if (Array.isArray(imageList)) {
      images = imageList.filter(url => typeof url === 'string' && url.trim().length > 0);
    }

    console.log('✅ Normalized: captions =', captionData.length, 'items, images =', images.length, 'URLs');

    // Insert into database
    const result = await db.insert(VideoData).values({
      script: script,
      audioFileUrl: audioFileUrl.trim(),
      captions: captionData,
      imageList: images, // ✅ This will be stored as varchar array
      createdBy: createdBy.trim()
    }).returning();

    console.log('✅ Video saved successfully. ID:', result[0].id);

    return NextResponse.json({
      success: true,
      videoId: result[0].id,
      message: 'Video data saved successfully',
      data: result[0]
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      { 
        Error: 'Failed to save video data',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ Error: 'User email is required' }, { status: 400 });
    }

    const videos = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData.createdBy, userEmail))
      .orderBy(desc(VideoData.createdAt));

    console.log(`✅ Retrieved ${videos.length} videos for ${userEmail}`);

    return NextResponse.json({
      success: true,
      videos: videos,
      count: videos.length
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching video data:', error);
    return NextResponse.json(
      { Error: 'Failed to fetch video data', details: error.message },
      { status: 500 }
    );
  }
}