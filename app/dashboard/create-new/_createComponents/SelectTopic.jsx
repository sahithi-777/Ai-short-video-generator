'use client'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

const SelectTopic = ({ onUserSelect }) => {  // Make sure this prop is here
    const options = ['Custom Prompt', 'Random Story', 'Bed Time Story','Fun Facts','Motivational','Jokes']
    const [selectedOption, setSelectedOption] = useState();
  return (
    <div>
        <h2 className='font-bold text-xl text-fuchsia-600'>Content</h2>
        <p className='text-gray-600'>What is the topic of your Video?</p>
        <Select onValueChange={(value)=>{
            setSelectedOption(value)
            if(value != 'Custom Prompt' && onUserSelect) {
                onUserSelect('topic', value)
            }
        }}>
          <SelectTrigger className="w-full mt-2 p-6 text-lg">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            {options.map((item,index)=>{
              return <SelectItem key={index} value={item}>{item}</SelectItem>
            })}
          </SelectContent>
        </Select>
        {selectedOption === 'Custom Prompt' && (
        <Textarea 
            className='mt-3'
            onChange={(e)=> {
                if(onUserSelect) {
                    onUserSelect('topic', e.target.value)
                }
            }}
            placeholder='Write about on which you want to create a video' 
        />
        )}
    </div>
  )
}

export default SelectTopic