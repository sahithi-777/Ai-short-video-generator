'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import EmptyState from './_components/EmptyState'
const Dashboard = () => {
  const [videoList, setVideoList] = useState([]);
  return (
    <div>
      <div className='flex items-center justify-between'>
        <h2 className='font-bold text-2xl text-fuchsia-700'>Dashboard</h2>
        <Link href='/dashboard/create-new'>
                <Button className={'bg-fuchsia-700 text-white hover:bg-fuchsia-400 '}>+ Create New</Button>
                </Link>
          </div>
          {videoList?.length==0&&<div>
            <EmptyState/>
            </div>}
    </div>
  )
}

export default Dashboard