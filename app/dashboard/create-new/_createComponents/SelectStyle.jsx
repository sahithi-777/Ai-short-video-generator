'use client'
import React from 'react'
import { useState } from 'react'
import Image from 'next/image'

const SelectStyle = ({ onUserSelect }) => {
    const styleOptions=[
        {
            name:'Cartoon',
            image:'/Cartoon.png'
        },
        {
            name:'Anime',
            image:'/Anime.png'
        },
        {
            name:'Ghibli',
            image:'/Ghibli.png'
        },
        {
            name:'Aesthetic',
            image:'/Aesthetic.png'
        },
        {
            name:'Comic',
            image:'/Comic.png'
        },
        {
            name:'GTA',
            image:'/GTA.png'
        },
        {
            name:'Oil Painting',
            image:'/OilPainting.png'
        },
        {
            name:'Water Color',
            image:'/WaterColor.png'
        },
        {
            name:'Pencil Sketch',
            image:'/Sketch.png'
        },
        {
            name:'Realistic',
            image:'/Realistic.png'
        }
    ]
    const [selectedOption, setSelectedOption] = useState();
  return (
    <div className='mt-7'>
        <h2 className='font-bold text-xl text-fuchsia-600'>Style</h2>
        <p className='text-gray-600'>Select your Video Style</p>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-5 mt-4'>
            {styleOptions.map((item,index)=>{
                return (
                    <div 
                        key={index}  
                        className={`relative hover:scale-105 transition-all cursor-pointer rounded-lg
                        ${selectedOption===item.name?'border-4 border-fuchsia-600':''}`}
                    >
                        <Image 
                            src={item.image} 
                            alt={item.name} 
                            height={128} 
                            width={128} 
                            className='h-40 object-cover rounded-lg w-full cursor-pointer'
                            onClick={()=>{
                                setSelectedOption(item.name)
                                if(onUserSelect) {
                                    onUserSelect('imageStyle', item.name)
                                }
                            }}
                        />
                        <h2 className='absolute p-1 bg-black bottom-0 w-full text-white text-center rounded-b-lg'>
                            {item.name}
                        </h2>
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default SelectStyle