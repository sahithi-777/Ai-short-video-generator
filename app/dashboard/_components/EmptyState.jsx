import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'

const EmptyState = () => {
  return (
    <div className='p-5 flex items-center flex-col mt-10 border-2 border-dotted py-24'>
      <h2>No videos found. Please create a new video.</h2>
      <Link href='/dashboard/create-new'>
        <Button className='bg-fuchsia-700 text-white hover:bg-fuchsia-400 mt-5'>
          + Create New Short Video
        </Button>
      </Link>
    </div>
  )
}

export default EmptyState