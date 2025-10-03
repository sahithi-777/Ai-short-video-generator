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
  const [error, setError] = useState(null);
  const [videoScript, setVideoScript] = useState();

  const onHandleInputChange = (fieldName, fieldValue) => {
    console.log(fieldName, fieldValue);
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: fieldValue }));
  }

  // Get Video Script
  const GetVideoScript = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.topic || !formData.duration || !formData.imageStyle) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      const prompt = `Write a script to generate ${formData.duration} video on topic ${formData.topic} along with AI image prompt ${formData.imageStyle} format for each scene and give me result in JSON format with imagePrompt and ContextText as fields`;
      
      console.log('Sending prompt:', prompt);

      const result = await axios.post('/api/get-video-script', {
        prompt: prompt
      })

      console.log('Response:', result.data);
      
      if (result.data.Error) {
        setError(result.data.Error)
      } else {
        // Handle successful response
        videoScript = result.data.result;
        setVideoScript(videoScript);
        console.log('Video script generated:', result.data.result)
        // You can add further processing here
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.Error || err.message || 'Failed to generate video script')
    } finally {
      setLoading(false)
    }
  }

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
        
        {/* Create Button */}
        <Button 
          className='mt-10 w-full bg-fuchsia-500' 
          onClick={GetVideoScript}
          disabled={loading}
        >Create Video
        </Button>
      </div>
      <CustomLoading loading={loading} />
    </div>
  )
}

export default CreateNew