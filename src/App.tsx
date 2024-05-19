import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react'
import { ReactMediaRecorder, useReactMediaRecorder } from 'react-media-recorder';
import Webcam from 'react-webcam';
import { useRecoilState } from 'recoil';
import { linesTextAtom } from './atoms';
import { BsArrowRight } from 'react-icons/bs';
import { AnimatePresence } from 'framer-motion';
import { motion } from "framer-motion";
import { GiCrowNest, GiCrown } from 'react-icons/gi';
import { LuCrown } from 'react-icons/lu';
import logo from "../public/logo.png";
import { FaCrown } from 'react-icons/fa6';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Timestamp, addDoc, collection, doc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5TJvxL-schfWC6fYs9Htfmhhx6lN_auc",
  authDomain: "e-comartstore.firebaseapp.com",
  projectId: "e-comartstore",
  storageBucket: "e-comartstore.appspot.com",
  messagingSenderId: "549977981975",
  appId: "1:549977981975:web:10ed7b336f471bed1cc852",
  measurementId: "G-C9DT6YYRDR"
};


const videoComponentStyling = "w-full h-full rounded-md bg-black shadow-xl relative z-0";


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
  return <video id="mirrored" ref={videoRef} className={`${videoComponentStyling}`} autoPlay />;
};



function LinesPreview() {

  const [lines, setlines] = useRecoilState(linesTextAtom);
  const [index, setindex] = useState(0);


  const escFunction = (event: any) => {
    if (event.key === "ArrowDown") {
      if (index < lines.split("\n").length - 1) {
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
    <div className='bg-gradient-to-b from-indigo-600 via-indigo-600/90 to-indigo-600/50 outline-indigo-600 text-white/90 outline-dotted absolute z-10 h-full w-full rounded-md flex flex-col justify-between items-start p-10'>
      <div className='relative h-full w-full'>
        <AnimatePresence>
          {
            lines.split("\n").map((line, indexLocal) => {
              if (indexLocal === index) {
                return <motion.div
                style={{ fontFamily: "Roboto" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={index} className='absolute z-10 text-4xl font-bold tracking-normal flex flex-wrap justify-start items-start gap-[7px]'>
                  {
                    line.split(" ").map((word, index) => {
                      return (
                        word.trim() != " " &&
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1, duration: 0.5 }} key={index} className=''>
                          {word.trim()}
                        </motion.div>

                      )
                    })
                  }
                </motion.div>
              }
            })
          }
        </AnimatePresence>
        <div className='w-full flex flex-row justify-between items-end relative z-0 h-full'>
          <div className='flex flex-col justify-start items-start gap-2 w-48 tracking-tight text-xs px-4 py-2 rounded-md bg-indigo-600'>

            <div className='flex flex-row justify-between w-full'>
              <div className='font-medium'>Next Line</div>
              <div className='font-light'>Arrow Down</div>
            </div>

            <div className='flex flex-row justify-between w-full'>
              <div className='font-medium'>Previous Line</div>
              <div className='font-light'>Arrow Up</div>
            </div>
          </div>

          <div className='bg-white px-4 py-1 text-black rounded-full flex flex-row justify-start items-center gap-2'>{lines.split("\n").length - index - 1} More <BsArrowRight /></div>
        </div>
      </div>
    </div>
  );
}



function VideoComponent(props: { setIsProDialogOpen: any, isRecording: boolean, setIsRecording: any }) {
  const [loading, setloading] = useState(false);
  const [format, setformat] = useState("landscape" as "landscape" | "portrait");

  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({
    // video: { width: 416, height: 640, facingMode: { ideal: "user" } },  this is for vertical video
    video: { width: {ideal:1280}, height: {ideal:720} },
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


  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setloading(false);
        startRecording();
      }, 2000);
    }
  }, [loading])


  return (
    <div className='h-full flex flex-col justify-start items-start'>


      <motion.div animate={{ height: props.isRecording == true ? "80%" : "60%" }} className='relative'>
        {
          loading == true &&
          <div className='h-full w-full flex justify-center items-center absolute z-10 bg-black/90'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='text-5xl font-medium tracking-tight text-white/80'>Starting Recording</motion.div>
          </div>
        }
        {
          status == undefined &&
          <div className={"h-full w-full bg-black"}></div>
        }
        {status === "stopped" && mediaBlobUrl && <video className={videoComponentStyling} src={mediaBlobUrl} controls autoPlay />}
        {status == "idle" && <VideoPreview stream={previewStream} />}
        {
          status == "recording" &&
          <div className='h-full w-full relative flex justify-center items-center'>
            <VideoPreview stream={previewStream} />
            <LinesPreview />
          </div>
        }
      </motion.div>

      <div className="flex flex-row justify-start items-start gap-3 mt-10">
        {
          status != "recording" && mediaBlobUrl == undefined &&
          <>
            <button className='bg-indigo-600 border-2 border-indigo-600 hover:shadow-2xl hover:shadow-yellow-400/60 text-sm px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300'
              onClick={() => {
                props.setIsRecording(true);
                setloading(true);
              }}
            >Start Recording</button>

            <button className='bg-transparent border-2 border-indigo-600 border-dotted-2 text-indigo-600 text-sm px-6 py-2 rounded-md shadow-xl hover:scale-105 transition-all duration-300'
              onClick={() => {
                props.setIsProDialogOpen(true);
              }}
            >Vertical Mode</button>
            
          </>
        }
        {
          status != "recording" && mediaBlobUrl != undefined &&
          <button className='bg-indigo-600 hover:shadow-2xl hover:shadow-yellow-400/60 text-sm px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300'
            onClick={() => {
              props.setIsRecording(true);
              setloading(true);
            }}
          >Restart Recording</button>
        }
        {
          status != "recording" && mediaBlobUrl != undefined &&
          <button className='bg-indigo-600/20 px-6 py-2 text-sm rounded-md text-indigo-600 hover:scale-105 transition-all duration-300 flex flex-row justify-start items-center' onClick={() => { downloadVideo() }}>Download <div className='text-xs ml-2 '>(.webm)</div></button>
        }
        {
          status != "recording" && mediaBlobUrl != undefined &&
          <button onClick={() => { props.setIsProDialogOpen(true); }} className='relative flex justify-end items-start hover:scale-105 transition-all duration-300'>
            <LuCrown className='absolute z-10 text-indigo-600 text-md -mt-3' />
            <div className='bg-indigo-600/20 px-6 py-2 text-sm rounded-md text-indigo-600  flex flex-row justify-start items-center'>Download <div className='text-xs ml-2 '>(.mp4)</div></div>

          </button>
        }
        {
          status === "recording" &&
          <button className='bg-red-500/10 text-red-500 px-6 text-sm py-2 rounded-md border-red-500 border-2 border-dotted' onClick={() => { props.setIsRecording(false); stopRecording(); }}>Stop Recording</button>
        }
      </div>


    </div>
  )
}



function LinesComponent() {
  const [linesText, setlinesText] = useRecoilState(linesTextAtom);

  return (
    <div className='h-full overflow-y-auto w-[550px] flex flex-col gap-2 justify-start items-center flex-none rounded-md bg-indigo-600 shadow-2xl p-5'>
      <textarea value={linesText} onChange={(e) => { setlinesText(e.target.value) }} key={"linesText"} placeholder='New Line Text' className='flex flex-none w-full h-full shadow-yellow-400/20 bg-black/20 text-white rounded-md shadow-2xl px-4 py-2'>
      </textarea>
    </div>
  )
}


function App() {

  const [isRecording, setisRecording] = useState(false);
  const [proDialogOpen, setproDialogOpen] = useState(false);
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore();

  useEffect(() => {
    addDoc(collection(db, "visits"), { time: Timestamp.now() })
  }, [])


  function GoProDialog() {

    const [email, setemail] = useState("");

    return (
      <div className='fixed z-50 h-screen w-full bg-black/80 backdrop-blur-xl flex justify-center items-center'>
        <div style={{ fontFamily: "Roboto" }} className='w-[650px] flex flex-col justify-start items-start bg-white  text-indigo-600 shadow-2xl shadow-yellow-400/60 backdrop-blur-xl rounded-xl p-10 tracking-tight'>
          <div className='text-6xl font-bold -ml-1 mb-5 tracking-tight'>Sound 10x more professional on video</div>
          {
            ["Record in Vertical Mode with upto 4k High Res", "Download in .mp4 format", "Save your videos in your cloud library to share across multiple devices", "AI powered human like scripts to quickly scaffold"].map((point) => {
              return (
                <div className='flex flex-row justify-start items-center gap-2 mt-2'>
                  <FaCrown className='text-md' />
                  <div>{point}</div>
                </div>
              )
            })
          }
          <input value={email} onChange={(e) => { setemail(e.target.value) }} placeholder='johndoe@gmail.com' className='outline-none mt-10 w-full px-5 py-2 border-[3px] border-indigo-600 border-dotted rounded-xl text-indigo-600' />
          <div className='flex flex-col justify-center items-start gap-2 w-full mt-5'>
            <button onClick={async () => {
              if (email.trim() == "") {
                return
              }
              await addDoc(collection(db, "emails"), {
                email: email,
                time: Timestamp.now()
              });
              setproDialogOpen(false);
              alert("Thanks for your interest, Keep an eye on your inbox. We'll get back to out to you soon!")
            }} className='bg-indigo-600 hover:shadow-2xl hover:shadow-yellow-400/60 text-sm px-6 py-2 rounded-md text-white shadow-xl hover:scale-105 transition-all duration-300'>Get Started</button>
            <div className='text-xs text-indigo-600'>No credit card required</div>
            <button onClick={() => { setproDialogOpen(false); }} className='text-md text-indigo-600 underline mt-10'>I'll buy later</button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <>
      {
        proDialogOpen == true &&
        <GoProDialog />
      }
      <div className='absolute z-10 w-full flex justify-center items-center'>
        <div className='w-[50%] rounded-b-xl border-dotted border-[3px] border-t-0 border-indigo-600  h-16 flex flex-row justify-between items-center px-10'>
          <div className='flex flex-row justify-start items-center gap-2'>
            <div className='h-8 w-8 rounded-md bg-cover bg-center' style={{ backgroundImage: `url('${logo}')` }}></div>
            <div style={{ fontFamily: "Roboto" }} className='text-xl font-bold tracking-tight text-indigo-600'>RecordEasy</div>
          </div>
          <button onClick={() => { setproDialogOpen(true); }} className='text-sm font-normal tracking-tight  bg-indigo-600 px-10 py-2 rounded-md text-white hover:scale-105 transition-all duration-300 hover:shadow-md hover:shadow-yellow-600/60'>Go Pro</button>
        </div>
      </div>

      <div className='h-screen w-full flex flex-col gap-2 justify-start items-center bg-white p-10 pt-24'>

        <div className='flex flex-row justify-center items-start gap-5 h-full w-full'>

          <VideoComponent setIsProDialogOpen={setproDialogOpen} isRecording={isRecording} setIsRecording={setisRecording} />

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
