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
import PlayerDialog from '../_components/PlayerDialog'

const CreateNew = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState();
  const [videoData, setVideoData] = useContext(VideoDataContext);
  const { user } = useUser();
  const router = useRouter();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue);
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: fieldValue }));
  }

  const SaveVideoData = async (scriptData, audioUrl, captionsData, images) => {
    try {
      let imageUrls = [];
      if (images?.images && Array.isArray(images.images)) {
        imageUrls = images.images.map(img => img.url).filter(url => url);
      } else if (images?.imageUrls && Array.isArray(images.imageUrls)) {
        imageUrls = images.imageUrls;
      }
      
      console.log('Saving video data with images:', imageUrls.length);
      
      const result = await axios.post('/api/save-video-data', {
        script: scriptData,
        audioFileUrl: audioUrl,
        captions: captionsData,
        imageList: imageUrls,
        createdBy: user?.primaryEmailAddress?.emailAddress
      });

      if (result.data.Error) {
        throw new Error(result.data.Error);
      }
      
      const videoId = result.data.data?.id || result.data?.id;
      setVideoId(videoId);
      setVideoData(result.data.data);
      
      return result.data;
    } catch (err) {
      console.error('Error saving video data:', err);
      throw err;
    }
  };

  const GenerateImagesForAllScenes = async (scenes, videoId) => {
    try {
      const result = await axios.post('/api/generate-images-batch', {
        scenes: scenes,
        videoId: videoId || `video_${Date.now()}`
      });
      
      if (result.data.Error) {
        throw new Error(result.data.Error);
      }
      
      return result.data;
    } catch (err) {
      console.error('Image generation error:', err);
      throw err;
    }
  };

  const GenerateAudioForAllScenes = async (scenes) => {
    try {
      const result = await axios.post('/api/get-audio', {
        scenes: scenes
      });
      
      if (result.data.Error) {
        throw new Error(result.data.Error);
      }
      
      return result.data;
    } catch (err) {
      console.error('Audio generation error:', err);
      throw err;
    }
  };

  const GenerateAudioCaption = async (fileUrl) => {
    try {
      const resp = await axios.post('/api/get-caption', {
        audioFileUrl: fileUrl
      });
      
      if (resp.data.timedOut) {
        console.warn('Caption generation timed out');
        return [];
      }

      return resp?.data?.result || resp?.data?.response || [];
    } catch (err) {
      console.error('Caption generation error:', err);
      return [];
    }
  };

  const GetVideoScript = async () => {
    setLoading(true);
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

      const result = await axios.post('/api/get-video-script', {
        prompt: prompt
      });

      if (result.data.Error) {
        throw new Error(result.data.Error);
      }

      const videoScriptData = result.data.result;
      if (!videoScriptData || !videoScriptData.scenes || !Array.isArray(videoScriptData.scenes)) {
        throw new Error('Invalid video script format received');
      }

      console.log('Video script generated with', videoScriptData.scenes.length, 'scenes');

      const videoId = `video_${Date.now()}`;

      // Generate audio
      console.log('Generating audio...');
      const audioResult = await GenerateAudioForAllScenes(videoScriptData.scenes);
      
      if (!audioResult || !audioResult.audioFileUrl) {
        throw new Error('No audio file URL returned from audio generation');
      }

      // Generate images
      console.log('Generating images...');
      const imageResult = await GenerateImagesForAllScenes(videoScriptData.scenes, videoId);
      
      if (!imageResult || !imageResult.images) {
        throw new Error('No images returned from image generation');
      }

      // Generate captions
      console.log('Generating captions...');
      const captionResult = await GenerateAudioCaption(audioResult.audioFileUrl);

      // Save to database
      console.log('Saving video to database...');
      const savedData = await SaveVideoData(
        videoScriptData,
        audioResult.audioFileUrl,
        captionResult,
        imageResult
      );

      console.log('Video created successfully:', savedData);
      setPlayVideo(true);

    } catch (err) {
      const errorMessage = err.response?.data?.Error || err.response?.data?.message || err.message || 'Failed to generate video';
      console.error('Error details:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='md:px-20'>
      <h2 className='font-bold text-4xl text-center text-fuchsia-600'>Create New Video</h2>
    
      <div className='mt-10 shadow-md p-10'>
        <SelectTopic onUserSelect={onHandleInputChange} />
        <SelectStyle onUserSelect={onHandleInputChange} />
        <SelectDuration onUserSelect={onHandleInputChange} />
        
        {error && (
          <div className='mt-4 p-4 bg-red-100 text-red-700 rounded'>
            <p className='font-semibold'>Error</p>
            <p className='text-sm mt-1'>{error}</p>
          </div>
        )}
        
        <Button 
          className='mt-10 w-full bg-fuchsia-500' 
          onClick={GetVideoScript}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Video'}
        </Button>
      </div>

      <CustomLoading loading={loading} />
      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  )
}

export default CreateNew