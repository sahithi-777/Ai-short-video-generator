'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import EmptyState from './_components/EmptyState'
import VideoList from './_components/VideoList'
import { db } from '@/configs/db'; // ADDED: Missing import
import { VideoData } from '@/configs/schema'; // ADDED: Missing import
import { eq } from 'drizzle-orm'; // ADDED: Missing import

const Dashboard = () => {
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) { // FIXED: Better null check
      GetVideoList();
    }
  }, [user])

  const GetVideoList = async () => {
    try {
      const result = await db.select().from(VideoData)
        .where(eq(VideoData?.createdBy, user?.primaryEmailAddress?.emailAddress));
      console.log(result);
      setVideoList(result);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h2 className='font-bold text-2xl text-fuchsia-700'>Dashboard</h2>
        <Link href='/dashboard/create-new'>
          <Button className='bg-fuchsia-700 text-white hover:bg-fuchsia-400'>+ Create New</Button>
        </Link>
      </div>
      {videoList?.length == 0 && (
        <div>
          <EmptyState />
        </div>
      )}
      {videoList?.length > 0 && <VideoList VideoList={videoList} />} {/* FIXED: Added conditional rendering */}
    </div>
  )
}

export default Dashboard