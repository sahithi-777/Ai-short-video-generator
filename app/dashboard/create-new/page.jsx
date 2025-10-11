'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import SelectTopic from './_createComponents/SelectTopic'
import SelectStyle from './_createComponents/SelectStyle'
import SelectDuration from './_createComponents/SelectDuration'
import CustomLoading from './_createComponents/CustomLoading'


const CreateNew = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoScript, setVideoScript] = useState();
  const [audioData, setAudioData] = useState(null); 
  const [captions, setCaptions] = useState();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue);
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: fieldValue }));
  }

  // Generate single audio file for all scenes
  const GenerateAudioForAllScenes = async (scenes) => {
    try {
      console.log('🎙️ Generating single audio for all scenes...');
      console.log('📊 Number of scenes:', scenes.length);
      
      // Debug: Log each scene's text
      scenes.forEach((scene, index) => {
        const text = scene.contextText || scene.contentText || scene.text;
        console.log(`Scene ${index + 1}:`, text);
      });
      
      const result = await axios.post('/api/get-audio', {
        scenes: scenes // Pass all scenes at once
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
  // Get Video Script and generate single audio for all scenes
  const GetVideoScript = async () => {
  setLoading(true);
  setAudioLoading(false);
  setError(null);

  try {
    // Validate form data
    if (!formData.topic || !formData.duration || !formData.imageStyle) {
      setError('Please fill in all fields');
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
      setAudioLoading(false);
      return;
    }

    setVideoScript(videoScriptData);
    console.log('✅ Video script generated:', videoScriptData);
    console.log('🎬 Total scenes:', videoScriptData.scenes.length);

    // ✅ Generate single audio for all scenes
    setAudioLoading(true);
    const audioResult = await GenerateAudioForAllScenes(videoScriptData.scenes);
    setAudioData(audioResult);

    console.log('✅ Audio generation complete!');
    console.log('📊 Audio file:', audioResult.filename);
    console.log('📁 Local path:', audioResult.filePath);
    console.log('🌐 Public URL:', audioResult.audioFileUrl);
    console.log('💾 File size:', audioResult.fileSizeKB, 'KB');

    // ✅ Generate caption for the audio (now we have a valid URL)
    await GenerateAudioCaption(audioResult.audioFileUrl);

  } catch (err) {
    console.error('❌ Error:', err);
    setError(err.response?.data?.Error || err.message || 'Failed to generate video script or audio');
  } finally {
    setLoading(false);
    setAudioLoading(false);
  }
};


  const GenerateAudioCaption = async(fileUrl) => {
     setLoading(true);

     await axios.post('/api/get-caption',{
      audioFileUrl: fileUrl
     }).then(resp=>{
      console.log(resp.data.result);
      setCaptions(resp?.data?.response);
     })
     setLoading(false);
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
        
        {/* Success Message */}
        {audioData && (
          <div className='mt-4 p-4 bg-green-100 text-green-700 rounded'>
            <p className='font-semibold'>✅ Audio Generated Successfully!</p>
            <p className='text-sm mt-1'>File: {audioData.filename}</p>
            <p className='text-sm'>Size: {audioData.fileSizeKB} KB</p>
            <p className='text-sm'>Scenes: {audioData.sceneCount}</p>
            <audio controls className='mt-2 w-full'>
              <source src={audioData.audioFileUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}
        
        {/* Create Button */}
        <Button 
          className='mt-10 w-full bg-fuchsia-500' 
          onClick={GetVideoScript}
          disabled={loading || audioLoading}
        >
          {loading ? 'Generating Script...' : audioLoading ? 'Generating Audio...' : 'Create Video'}
        </Button>
      </div>
      <CustomLoading loading={loading || audioLoading} />
    </div>
  )
}

export default CreateNew