import React, { useState } from 'react'
import { Thumbnail } from '@remotion/player';
import RemotionVideo from './RemotionVideo';
import PlayerDialog from './PlayerDialog';

const VideoList = ({ VideoList }) => {
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [videoId, setVideoId] = useState(null); // FIXED: Added null as initial value

  return (
    <div className='mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
      {VideoList?.map((video, index) => (
        // FIXED: Added return statement (was missing 'return' keyword, had implicit return without parentheses)
        <div
          key={video?.id || index} // FIXED: Added key prop
          className='cursor-pointer hover:scale-105 transition-all'
          onClick={() => {
            setOpenPlayerDialog(Date.now());
            setVideoId(video?.id);
          }}
        >
          <Thumbnail
            component={RemotionVideo}
            compositionWidth={250}
            compositionHeight={390}
            frameToDisplay={30}
            durationInFrames={120}
            fps={30}
            style={{
              borderRadius: 15
            }}
            inputProps={{
              ...video,
              setDurationFrame: (v) => console.log(v), // FIXED: Changed setDurationInFrame to setDurationFrame
            }}
          />
        </div>
      ))}
      <PlayerDialog playVideo={openPlayerDialog} videoId={videoId} />
    </div>
  )
}

export default VideoList