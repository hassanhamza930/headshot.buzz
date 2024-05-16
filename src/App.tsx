import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react'
import { ReactMediaRecorder, useReactMediaRecorder } from 'react-media-recorder';
import Webcam from 'react-webcam';
import { useRecoilState } from 'recoil';
import { linesAtom } from './atoms';


const videoComponentStyling = "w-full h-full rounded-md bg-black shadow-indigo-600 shadow-lg";


const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return <video id="mirrored" ref={videoRef} className={videoComponentStyling} autoPlay controls />;
};



function VideoComponent() {
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({ video: { width: 1920, height: 1080 }, askPermissionOnMount: true, blobPropertyBag: { type: "video/webm" } });
 
  const downloadVideo = async () => {
    console.log(mediaBlobUrl);
    if (mediaBlobUrl) {
      console.log(mediaBlobUrl);
      const a = document.createElement('a');
      a.href = mediaBlobUrl;
      a.download = "recording.webm";
      document.body.appendChild(a);
      a.click();
    }
  };



  return (
    <div className='h-full flex flex-col justify-center items-start'>

      <div className="flex flex-row justify-start items-start gap-3 my-10">
        {
          status != "recording" &&
          <button className='bg-blue-600 px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300' onClick={startRecording}>Start Recording</button>
        }
        {
          status != "recording" && mediaBlobUrl != undefined &&
          <button className='bg-black/80 px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300' onClick={() => { downloadVideo() }}>Download</button>
        }
        {
          status === "recording" &&
          <button className='bg-red-600 px-6 py-2 rounded-md text-white' onClick={stopRecording}>Stop Recording</button>
        }
      </div>
      <div className='h-[60%]'>
        {status === "stopped" && mediaBlobUrl && <video className={videoComponentStyling} src={mediaBlobUrl} controls autoPlay />}
        {status =="idle" && <VideoPreview stream={previewStream} />}
        {status =="recording" && <VideoPreview stream={previewStream} />}
      </div>

    </div>
  )
}



function LinesComponent() {
  const [lines, setlines] = useRecoilState(linesAtom);

  return (
    <div className='h-full overflow-y-auto w-96 flex flex-col gap-5 justify-start items-center flex-none rounded-md bg-indigo-600 shadow-2xl p-5 pb-24'>
      {
        lines.map((line, index) => {
          return (
            <textarea value={line} onChange={(e) => {
              let temp = [...lines];
              temp[index] = e.target.value;
              setlines([...temp]);
            }} key={index} placeholder='New Line Text' className='flex flex-none w-full h-24 bg-white rounded-md shadow-2xl px-4 py-2'>
            </textarea>
          )
        })
      }
      <button onClick={() => {
        setlines([...lines, ""])
      }} className='bg-white rounded-md text-black px-5 py-2 text-sm mt-5 hover:scale-105 transition-all duration-300'>
        Add new Line
      </button>
    </div>
  )
}


function App() {



  return (
    <div className='h-screen w-full flex flex-col gap-2 justify-start items-center bg-white p-10'>



      <div className='flex flex-row justify-center items-center gap-5 h-full w-full'>


       <VideoComponent/>

       <LinesComponent/>

      </div>


    </div>


  )
}

export default App
