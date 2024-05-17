import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react'
import { ReactMediaRecorder, useReactMediaRecorder } from 'react-media-recorder';
import Webcam from 'react-webcam';
import { useRecoilState } from 'recoil';
import { linesAtom } from './atoms';
import { BsArrowRight } from 'react-icons/bs';
import { AnimatePresence } from 'framer-motion';
import { motion } from "framer-motion";

const videoComponentStyling = "w-full h-full rounded-md bg-black shadow-indigo-600 shadow-lg relative z-0";


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
  return <video id="mirrored" ref={videoRef} className={videoComponentStyling} autoPlay />;
};



function LinesPreview() {

  const [lines, setlines] = useRecoilState(linesAtom);
  const [index, setindex] = useState(0);


  const escFunction = (event: any) => {
    if (event.key === "ArrowDown") {
      if (index < lines.length - 1) {
        setindex(index + 1);
      }
    }
    else if (event.key === "ArrowUp") {
      if (index > 0) {
        setindex(index - 1);
      }
    }
  };


  useEffect(() => {
    document.removeEventListener("keyup", escFunction);
    document.addEventListener("keyup", escFunction);
    return () => {
      document.removeEventListener("keyup", escFunction);
    };
  }, [index]);





  return (
    <div className='bg-gradient-to-b from-black via-black/80 to-black/50 outline-indigo-600 text-white outline-dotted absolute z-10 h-full w-full rounded-md flex flex-col justify-between items-start p-10'>
      <div className='relative h-full w-full'>
      <AnimatePresence>
        {
          lines.map((line, indexLocal) => {
            if (indexLocal === index) {
              return <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={index} className='absolute z-10 text-5xl font-medium tracking-tight flex flex-wrap justify-start items-start gap-2'>
                {
                  line.split(" ").map((word, index) => {
                    return (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{delay:index*0.1,duration:0.5}} key={index} className=''>
                        {word}
                      </motion.div>
                    )
                  })
                }
              </motion.div>
            }
          })
        }
      </AnimatePresence>
      <div className='w-full flex justify-end items-end relative z-0 h-full'>
        <div className='bg-white px-4 py-1 text-black rounded-full flex flex-row justify-start items-center gap-2'>{lines.length - index - 1} More <BsArrowRight /></div>
      </div>
      </div>
    </div>
  );
}



function VideoComponent(props: { setIsRecording: any }) {
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({
    video: { width: 1920, height: 1080 },
    askPermissionOnMount: true,
    blobPropertyBag: { type: "video/webm" },
  });




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
    <div className='h-full flex flex-col justify-start items-start'>


      <div className='h-[60%]'>
        {status === "stopped" && mediaBlobUrl && <video className={videoComponentStyling} src={mediaBlobUrl} controls autoPlay />}
        {status == "idle" && <VideoPreview stream={previewStream} />}
        {
          status == "recording" &&
          <div className='h-full w-full relative flex justify-center items-center'>
            <VideoPreview stream={previewStream} />
            <LinesPreview />
          </div>
        }
      </div>

      <div className="flex flex-row justify-start items-start gap-3 my-10">
        {
          status != "recording" &&
          <button className='bg-blue-600 px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300'
            onClick={() => {
              props.setIsRecording(true);
              setTimeout(() => {
                startRecording();
              }, 700);
            }}
          >Start Recording</button>
        }
        {
          status != "recording" && mediaBlobUrl != undefined &&
          <button className='bg-black/80 px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300' onClick={() => { downloadVideo() }}>Download</button>
        }
        {
          status === "recording" &&
          <button className='bg-red-600 px-6 py-2 rounded-md text-white' onClick={()=>{props.setIsRecording(false);stopRecording();}}>Stop Recording</button>
        }
      </div>


    </div>
  )
}



function LinesComponent() {
  const [lines, setlines] = useRecoilState(linesAtom);

  return (
    <div className='h-full overflow-y-auto w-96 flex flex-col gap-2 justify-start items-center flex-none rounded-md bg-indigo-600 shadow-2xl p-5 pb-24'>
      {
        lines.map((line, index) => {
          return (
            <textarea value={line} onChange={(e) => {
              let temp = [...lines];
              temp[index] = e.target.value;
              setlines([...temp]);
            }} key={index} placeholder='New Line Text' className='flex flex-none w-full h-36 shadow-yellow-400/20 bg-black/60 text-white rounded-md shadow-2xl px-4 py-2'>
            </textarea>
          )
        })
      }
      <button onClick={() => {
        setlines([...lines, ""])
      }} className='bg-white shadow-2xl shadow-yellow-400/60 rounded-md text-black px-5 py-2 text-sm mt-5 hover:scale-105 transition-all duration-300'>
        Add new Line +
      </button>
    </div>
  )
}


function App() {

  const [isRecording, setisRecording] = useState(false);


  return (
    <>
      <div className='h-screen w-full flex flex-col gap-2 justify-start items-center bg-white p-10'>

        <div className='flex flex-row justify-center items-start gap-5 h-full w-full'>

          <VideoComponent setIsRecording={setisRecording} />

          {
            isRecording === false &&
            <LinesComponent />
          }

        </div>

      </div>

    </>


  )
}

export default App
