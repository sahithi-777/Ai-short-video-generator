'use client'
import React, { useContext, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import SelectTopic from './_createComponents/SelectTopic'
import SelectStyle from './_createComponents/SelectStyle'
import SelectDuration from './_createComponents/SelectDuration'
import CustomLoading from './_createComponents/CustomLoading'
import { VideoDataContext } from '@/app/api/_context/VideoDataContext'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const CreateNew = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoScript, setVideoScript] = useState();
  const [audioData, setAudioData] = useState(null); 
  const [captions, setCaptions] = useState();
  const [imageData, setImageData] = useState(null);
  const [videoData, setVideoData] = useContext(VideoDataContext);
  const { user } = useUser();
  const router = useRouter();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue);
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: fieldValue }));
  }

  // Save video data to database
 const SaveVideoData = async (scriptData, audioUrl, captionsData, images) => {
  try {
    console.log('💾 Saving video data to database...');
    
    // ✅ FIXED - Safe extraction with fallback
    let imageUrls = [];
    if (images?.images && Array.isArray(images.images)) {
      imageUrls = images.images.map(img => img.url).filter(url => url);
    } else if (images?.imageUrls && Array.isArray(images.imageUrls)) {
      imageUrls = images.imageUrls;
    }
    
    console.log('📸 Image URLs to save:', imageUrls);
    
    const result = await axios.post('/api/save-video-data', {
      script: scriptData,
      audioFileUrl: audioUrl,
      captions: captionsData,
      imageList: imageUrls, // This must be an array
      createdBy: user?.primaryEmailAddress?.emailAddress
    });

    if (result.data.Error) {
      throw new Error(result.data.Error);
    }

    console.log('✅ Video data saved:', result.data);
    setVideoData(result.data.data);
    return result.data;
  } catch (err) {
    console.error('❌ Error saving video data:', err);
    throw err;
  }
};

  // Generate images for all scenes
  const GenerateImagesForAllScenes = async (scenes, videoId) => {
    try {
      console.log('🖼️ Generating images for all scenes...');
      console.log('📊 Number of scenes:', scenes.length);
      
      const result = await axios.post('/api/generate-images-batch', {
        scenes: scenes,
        videoId: videoId || `video_${Date.now()}`
      });
      
      if (result.data.Error) {
        throw new Error(result.data.Error);
      }
      
      console.log('✅ Images generated:', result.data);
      return result.data;
    } catch (err) {
      console.error('❌ Image Generation Error:', err);
      throw err;
    }
  };

  // Generate single audio file for all scenes
  const GenerateAudioForAllScenes = async (scenes) => {
    try {
      console.log('🎙️ Generating single audio for all scenes...');
      console.log('📊 Number of scenes:', scenes.length);
      
      const result = await axios.post('/api/get-audio', {
        scenes: scenes
      });
      
      if (result.data.Error) {
        throw new Error(result.data.Error);
      }
      
      console.log('✅ Single audio generated:', result.data);
      return result.data;
    } catch (err) {
      console.error('❌ Audio Generation Error:', err);
      throw err;
    }
  };

  // Get Video Script and generate audio and images
  const GetVideoScript = async () => {
    setLoading(true);
    setAudioLoading(false);
    setImageLoading(false);
    setError(null);

    try {
      // Validate form data
      if (!formData.topic || !formData.duration || !formData.imageStyle) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Check if user is logged in
      if (!user) {
        setError('Please sign in to create videos');
        setLoading(false);
        return;
      }

      const prompt = `Write a script to generate ${formData.duration} video on topic ${formData.topic} along with AI image prompt ${formData.imageStyle} format for each scene and give me result in JSON format with imagePrompt and contextText as fields`;

      console.log('📝 Sending prompt:', prompt);

      const result = await axios.post('/api/get-video-script', {
        prompt: prompt
      });

      console.log('📄 Response:', result.data);

      if (result.data.Error) {
        setError(result.data.Error);
        setLoading(false);
        return;
      }

      const videoScriptData = result.data.result;
      if (!videoScriptData || !videoScriptData.scenes || !Array.isArray(videoScriptData.scenes)) {
        setError('Invalid video script format received');
        setLoading(false);
        return;
      }

      setVideoScript(videoScriptData);
      console.log('✅ Video script generated:', videoScriptData);
      console.log('🎬 Total scenes:', videoScriptData.scenes.length);

      // Generate unique video ID
      const videoId = `video_${Date.now()}`;

      // ✅ Generate audio for all scenes
      setAudioLoading(true);
      const audioResult = await GenerateAudioForAllScenes(videoScriptData.scenes);
      setAudioData(audioResult);
      setAudioLoading(false);

      console.log('✅ Audio generation complete!');

      // ✅ Generate images for all scenes
      setImageLoading(true);
      const imageResult = await GenerateImagesForAllScenes(videoScriptData.scenes, videoId);
      setImageData(imageResult);
      setImageLoading(false);

      console.log('✅ Image generation complete!');
      console.log('📊 Images generated:', imageResult.successfulImages);

      // ✅ Generate captions
      const captionResult = await GenerateAudioCaption(audioResult.audioFileUrl);

      // ✅ Save all data to database
      setLoading(true);
      const savedData = await SaveVideoData(
        videoScriptData,
        audioResult.audioFileUrl,
        captionResult,
        imageResult
      );
      setLoading(false);

      console.log('🎉 All done! Video ID:', savedData.videoId);

      // Optionally redirect to video page or show success
      // router.push(`/dashboard/video/${savedData.videoId}`);

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.Error || err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
      setAudioLoading(false);
      setImageLoading(false);
    }
  };

  const GenerateAudioCaption = async(fileUrl) => {
  try {
    setLoading(true);

    console.log('🎙️ Starting caption generation...');
    const resp = await axios.post('/api/get-caption', {
      audioFileUrl: fileUrl
    });
    
    console.log('📝 Caption response:', resp.data);
    
    // ✅ Handle timeout gracefully
    if (resp.data.timedOut) {
      console.warn('⏱️ Caption generation timed out - proceeding without captions');
      setError('Caption generation timed out. Video saved without captions.');
      return [];
    }

    // ✅ Use correct response structure with fallback
    const captionData = resp?.data?.result || resp?.data?.response || [];
    console.log('✅ Captions generated:', captionData.length, 'items');
    setCaptions(captionData);
    setLoading(false);
    
    return captionData;
  } catch (err) {
    console.error('❌ Caption generation error:', err);
    // ✅ Don't fail the entire process - return empty captions
    setError('Caption generation failed. Continuing without captions.');
    setLoading(false);
    return [];
  }
};

  return (
    <div className='md:px-20'>
      <h2 className='font-bold text-4xl text-center text-fuchsia-600'>Create New Video</h2>
    
      <div className='mt-10 shadow-md p-10'>
        {/* Select Topic */}
        <SelectTopic onUserSelect={onHandleInputChange} />

        {/* Select Style */}
        <SelectStyle onUserSelect={onHandleInputChange} />
        
        {/* Duration */}
        <SelectDuration onUserSelect={onHandleInputChange} />
        
        {/* Error Message */}
        {error && (
          <div className='mt-4 p-4 bg-red-100 text-red-700 rounded'>
            {error}
          </div>
        )}
        
        {/* Audio Success Message */}
        {audioData && (
          <div className='mt-4 p-4 bg-green-100 text-green-700 rounded'>
            <p className='font-semibold'>✅ Audio Generated Successfully!</p>
            <p className='text-sm mt-1'>File: {audioData.filename}</p>
            <p className='text-sm'>Size: {audioData.fileSizeKB} KB</p>
            <audio controls className='mt-2 w-full'>
              <source src={audioData.audioFileUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {/* Image Success Message */}
        {imageData && (
          <div className='mt-4 p-4 bg-blue-100 text-blue-700 rounded'>
            <p className='font-semibold'>✅ Images Generated & Uploaded to UploadThing!</p>
            <p className='text-sm mt-1'>Success: {imageData.successfulImages}/{imageData.totalScenes}</p>
            <p className='text-sm'>☁️ Storage: UploadThing CDN</p>
            {imageData.failedImages > 0 && (
              <p className='text-sm text-red-600'>Failed: {imageData.failedImages}</p>
            )}
            <div className='grid grid-cols-3 gap-2 mt-3'>
              {imageData.images.slice(0, 6).map((img, index) => (
                <div key={index} className='relative'>
                  <img 
                    src={img.url} 
                    alt={`Scene ${img.sceneIndex + 1}`}
                    className='w-full h-24 object-cover rounded'
                  />
                  <span className='absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded'>
                    {img.sceneIndex + 1}
                  </span>
                </div>
              ))}
            </div>
            {imageData.images.length > 6 && (
              <p className='text-xs mt-2 text-gray-600'>
                +{imageData.images.length - 6} more images
              </p>
            )}
          </div>
        )}

        {/* Database Save Success */}
        {videoData && (
          <div className='mt-4 p-4 bg-purple-100 text-purple-700 rounded'>
            <p className='font-semibold'>🎉 Video Saved to Database!</p>
            <p className='text-sm mt-1'>Video ID: {videoData.id}</p>
          </div>
        )}
        
        {/* Loading Status */}
        {(loading || audioLoading || imageLoading) && (
          <div className='mt-4 p-4 bg-yellow-100 text-yellow-700 rounded'>
            {loading && <p>⏳ Processing...</p>}
            {audioLoading && <p>🎙️ Generating audio...</p>}
            {imageLoading && <p>🖼️ Generating images...</p>}
          </div>
        )}
        
        {/* Create Button */}
        <Button 
          className='mt-10 w-full bg-fuchsia-500' 
          onClick={GetVideoScript}
          disabled={loading || audioLoading || imageLoading}
        >
          {loading ? 'Processing...' : 
           audioLoading ? 'Generating Audio...' : 
           imageLoading ? 'Generating Images...' : 
           'Create Video'}
        </Button>
      </div>
      <CustomLoading loading={loading || audioLoading || imageLoading} />
    </div>
  )
}

export default CreateNew