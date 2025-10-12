import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Player } from "@remotion/player";
import RemotionVideo from './RemotionVideo';
import { VideoData } from '@/configs/schema';
import { useRouter } from 'next/navigation';
import { db } from '@/configs/db'; // ADDED: Missing import
import { eq } from 'drizzle-orm'; // ADDED: Missing import

const PlayerDialog = ({ playVideo, videoId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [durationInFrame, setDurationInFrame] = useState(100);
  const [loading, setLoading] = useState(false); // ADDED: Loading state
  const router = useRouter();

  useEffect(() => {
    if (playVideo) {
      setOpenDialog(true);
      setLoading(true); // ADDED: Set loading to true
      if (videoId) GetVideoData();
    }
  }, [playVideo, videoId])

  const GetVideoData = async () => {
    try {
      const result = await db.select().from(VideoData)
        .where(eq(VideoData.id, videoId));
      console.log("Video Data fetched:", result);
      if (result && result.length > 0) {
        setVideoData(result[0]);
      } else {
        console.warn("No video data found for ID:", videoId);
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
    } finally {
      setLoading(false); // ADDED: Set loading to false when done
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="bg-white flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold my-5">Your Video is ready.</DialogTitle>
        </DialogHeader>
        {loading && <p className="text-center py-10">Loading video...</p>}
        {!loading && !videoData && <p className="text-center py-10 text-red-500">Error loading video. Please try again.</p>}
        {!loading && videoData && (
          <>
            <Player
              component={RemotionVideo}
              durationInFrames={Number(durationInFrame.toFixed(0))}
              compositionWidth={300}
              compositionHeight={450}
              fps={30}
              controls={true}
              inputProps={{
                ...videoData,
                setDurationFrame: (frameValue) => setDurationInFrame(frameValue)
              }}
            />
            <div className='flex gap-10 mt-10'>
              <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button>Export</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PlayerDialog