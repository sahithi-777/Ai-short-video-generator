
import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';

const Header = () => {
return (
    <div className='p-3 px-5 flex items-center justify-between shadow-md'>
            <div className='flex gap-3 items-center'>
                    <Image src={'/logo.png'} alt='Logo' width={100} height={100}/>
                    <h2 className='bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent text-2xl font-bold'>AI Short Video Generator</h2>
            </div>
            <div className='flex gap-3 items-center'>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Get Started
                </Button>
               <Button>Dashboard</Button>
                <UserButton/>
            </div>
    </div>
)
}

export default Header