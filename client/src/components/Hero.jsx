import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import Lottie from "lottie-react";
import runningMan from "../assets/running-man.json";


const Hero = () => {

    const navigate = useNavigate();

  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>

        <div className='text-center mb-6'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto loading-[1.2]'>
                Create amazing content <br/> with <span className='text-primary'>AI tools</span></h1>

            <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>
                Transform your content creation with our suite of premium AI tools.
                Write articles, generate images, and enhance your workflow.
            </p>
        </div>

        <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
            <button onClick={() => navigate('/ai')} 
            className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>
                Start Creating Now
            </button>

            <button 
              onClick={() => navigate('/ai/community')}
              className="bg-black text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer flex items-center justify-center gap-3"
            >
              <span className="font-medium">Get Inspired</span>
              <Lottie 
                animationData={runningMan} 
                loop 
                style={{ width: 30, height: 25 }} 
              />
            </button>

        </div>

        <div className='flex justify-center gap-4 mt-8 mx:auto text-gray-600'>
            <img src={assets.user_group} alt='' className='h-8'/>
            Trusted by over 10k+ creators worldwide
        </div>

    </div>
  )
}

export default Hero