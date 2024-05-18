import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RecoilRoot } from 'recoil'
import logo from '../public/logo.png'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    {
      window.innerWidth < 1000 ?
        <div className='fixed z-50 h-screen w-full bg-black/80 backdrop-blur-xl flex flex-col gap-2 justify-center items-center bg-indigo-600 text-white'>
          <div style={{backgroundImage:`url('${logo}')`}} className='h-24 w-24 bg-cover bg-center border-white border-2 border-dotted rounded-md'>

          </div>
          <div className='text-5xl font-bold -ml-1 mb-5 tracking-tight text-center mt-10'>Desktop Only</div>
          <div className='text-sm font-normal -ml-1 mb-5 tracking-tight text-center px-10'>RecordEasy is made with love be run on desktop, Please visit the site on a PC or Laptop to get started</div>
        </div> :
        <App />
    }
  </RecoilRoot>
)
