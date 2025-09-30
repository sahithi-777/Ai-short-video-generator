'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import {useState} from 'react'
import SelectTopic from './_createComponents/SelectTopic'
import SelectStyle from './_createComponents/SelectStyle'
import SelectDuration from './_createComponents/SelectDuration'
const CreateNew = () => {
    const [formData, setFormData] = useState([])
    const onHandleInputChange=(fieldName,fieldValue)=>{
        console.log(fieldName,fieldValue);
        setFormData((prevFormData)=>({...prevFormData,[fieldName]:fieldValue}));

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
            {/* Create Button */}
            <Button className='mt-10 w-full bg-fuchsia-500'>Create Video</Button>
        </div>
    </div>
  )
}

export default CreateNew