import React, { useEffect } from 'react'
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig, Audio } from 'remotion';

const RemotionVideo = ({ script, imageList, audioFileUrl, captions, setDurationFrame }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // FIXED: Use useEffect to call setDurationFrame instead of calling it during render
  useEffect(() => {
    if (captions && captions.length > 0) {
      const duration = captions[captions.length - 1]?.end / 1000 * fps;
      setDurationFrame(duration);
    }
  }, [captions, fps, setDurationFrame]);

  const getDurationFrame = () => {
    if (captions && captions.length > 0) {
      return captions[captions.length - 1]?.end / 1000 * fps;
    }
    return 0;
  }

  const getCurrentCaptions = () => {
    if (!captions || captions.length === 0) return '';
    const currentTime = frame / 30 * 1000;
    const currentCaption = captions.find((word) => currentTime >= word.start && currentTime <= word.end)
    return currentCaption ? currentCaption?.text : '';
  }

  if (!script || !imageList || imageList.length === 0) return null;

  return (
    <AbsoluteFill className='bg-black'>
      {imageList?.map((item, index) => {
        const startTime = (index * getDurationFrame()) / imageList?.length;
        const duration = getDurationFrame();

        const scale = interpolate(
          frame,
          [startTime, startTime + duration / 2, startTime + duration],
          index % 2 == 0 ? [1, 1.8, 1] : [1.8, 1, 1.8],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )

        return (
          <Sequence key={index} from={startTime} durationInFrames={getDurationFrame()}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Img
                src={item}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${scale})`
                }}
              />
              <AbsoluteFill style={{
                color: 'white',
                justifyContent: 'center',
                top: undefined,
                bottom: 50,
                height: 150,
                textAlign: 'center',
                width: '100%'
              }}>
                <h2 className='text-2xl'>{getCurrentCaptions()}</h2>
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        )
      })}
      {audioFileUrl && <Audio src={audioFileUrl} />}
    </AbsoluteFill>
  )
}

export default RemotionVideo


