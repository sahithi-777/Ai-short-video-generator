
import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';

const Header = () => {
return (
    <div className='p-3 px-5 flex items-center justify-between shadow-md'>
            <div className='flex gap-3 items-center'>
                    <Image src={'/logo.png'} alt='Logo' width={30} height={30} className='rounded-full'/>
                    <h2 className='bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent text-xl font-bold'>Smart Shorts</h2>
            </div>
            <div className='flex gap-3 items-center'>
               <Button className='bg-fuchsia-700 text-white hover:bg-fuchsia-400'>Dashboard</Button>
                <UserButton/>
            </div>
    </div>
)
}

export default Header