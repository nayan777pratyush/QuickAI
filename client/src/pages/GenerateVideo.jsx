import { Sparkles, Video, Download, Share2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateVideo = () => {
  const videoStyle = [
  "Realistic",
  "Anime Style",
  "Cartoon Style",
  "Fantasy Style",
  "Cinematic",
  "3D Style",
  "Portrait Style",
  "Cyberpunk Neon",
  "Pixel Art",
  "Watercolor Painting",
  "Minimalist Line Art",
  "Oil Painting",
  "Steampunk",
  "Low Poly 3D",
  "Noir (Black & White Film)",
  "Vaporwave / Synthwave",
  "Paper Cutout Stop Motion",
  "Comic Book / Pop Art",
  "Claymation",
  "Dreamy Surrealism"
];

  
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [videoError, setVideoError] = useState(false);
  
  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(180); // 3 minutes
  
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);
   
  const { getToken } = useAuth()

  // Progress simulation based on typical generation times
  const updateProgress = () => {
    if (!startTimeRef.current) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setTimeElapsed(elapsed);
    
    // Progress curve: slower at start, faster in middle, slower at end
    let newProgress;
    if (elapsed < 30) {
      newProgress = (elapsed / 30) * 15; // 0-15% in first 30s
      setStatus('Initializing video generation...');
    } else if (elapsed < 60) {
      newProgress = 15 + ((elapsed - 30) / 30) * 20; // 15-35% in next 30s
      setStatus('Processing your prompt...');
    } else if (elapsed < 120) {
      newProgress = 35 + ((elapsed - 60) / 60) * 35; // 35-70% in next 60s
      setStatus('Creating video frames...');
    } else if (elapsed < 180) {
      newProgress = 70 + ((elapsed - 120) / 60) * 20; // 70-90% in next 60s
      setStatus('Rendering final video...');
    } else {
      newProgress = 90 + ((elapsed - 180) / 60) * 8; // 90-98% after 3min
      setStatus('Almost ready...');
    }
    
    setProgress(Math.min(newProgress, 98)); // Never show 100% until actually done
    setEstimatedTimeLeft(Math.max(180 - elapsed, 0));
  };

  const startProgressTracking = () => {
    startTimeRef.current = Date.now();
    setProgress(0);
    setTimeElapsed(0);
    
    progressIntervalRef.current = setInterval(updateProgress, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error('Please describe what you want to see in the video');
      return;
    }

    if (input.length < 10) {
      toast.error('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      setContent('');
      setVideoError(false);
      
      // Start progress tracking
      startProgressTracking();

      const prompt = `Generate a high-quality video of ${input} in the style ${selectedStyle}`;

      toast.loading('Starting video generation...', { id: 'video-generation' });

      const { data } = await axios.post('/api/ai/generate-video', { prompt, publish }, {
        headers: {Authorization: `Bearer ${await getToken()}`},
        timeout: 1200000 // 20 minute timeout
      });

      stopProgressTracking();

      if (data.success) {
        setProgress(100);
        setStatus('Video generated successfully!');
        setContent(data.content);
        toast.success('🎬 Video generated successfully!', { id: 'video-generation' });
      } else {
        toast.error(data.message || 'Failed to generate video', { id: 'video-generation' });
      }

    } catch (error) {
      stopProgressTracking();
      console.error('Video generation error:', error);
      
      let errorMessage = 'Failed to generate video';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Video generation is taking longer than expected.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { id: 'video-generation' });
    }
    
    setLoading(false);
  }

  const handleVideoError = () => {
    setVideoError(true);
    toast.error('Failed to load video. Please try again.');
  }

  const handleDownload = async () => {
    if (!content) return;
    
    try {
      toast.loading('Preparing download...', { id: 'download' });
      
      const response = await fetch(content);
      if (!response.ok) throw new Error('Failed to fetch video');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!', { id: 'download' });
    } catch (error) {
      toast.error('Failed to download video', { id: 'download' });
    }
  }

  const handleShare = async () => {
    if (!content) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Video',
          text: `Check out this AI-generated video: ${input}`,
          url: content
        });
      } else {
        await navigator.clipboard.writeText(content);
        toast.success('Video URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share video');
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

        <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
          <div className='flex items-center gap-3'>
            <Sparkles className='w-6 text-[#031a27]'/>
            <h1 className='text-xl font-semibold'>AI Video Generator</h1>
          </div>

          <p className='mt-6 text-sm font-medium'>Describe your video</p>
          <textarea 
            onChange={(e) => setInput(e.target.value)} 
            value={input} 
            rows={4}
            className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
            placeholder='Be specific and detailed... e.g., "A majestic golden eagle soaring gracefully over snow-capped mountains at golden hour, with dramatic clouds in the background"'
            required
            disabled={loading}
          />
          
          <div className='mt-2 flex justify-between text-xs'>
            <span className={input.length < 10 ? 'text-red-500' : 'text-green-600'}>
              {input.length < 10 ? `${10 - input.length} more characters needed` : '✓ Good description length'}
            </span>
            <span className='text-gray-500'>{input.length}/500</span>
          </div>

          <p className='mt-4 text-sm font-medium'>Style</p>
          <div className='mt-3 flex gap-3 flex-wrap'>
            {videoStyle.map((item) => (
              <span 
                onClick={() => !loading && setSelectedStyle(item)} 
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-all duration-200 ${
                  selectedStyle === item 
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300' 
                    : `text-gray-500 border-gray-300 ${!loading ? 'hover:border-gray-400 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`
                }`} 
                key={item}
              >
                {item}
              </span>
            ))}
          </div>

          <div className='my-6 flex items-center gap-2'>
            <label className='relative cursor-pointer'>
              <input type="checkbox" 
                onChange={(e) => setPublish(e.target.checked)} 
                checked={publish}
                className='sr-only peer'
                disabled={loading}
              />
              <div className={`w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-indigo-800 transition ${loading ? 'opacity-50' : ''}`}></div>
              <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
            </label>
            <p className='text-sm'>Make this video Public</p>
          </div>

          <button 
            disabled={loading || input.length < 10} 
            type="submit"
            className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#39048e] to-[#011723] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
          >
            {loading ? 
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> 
              : 
              <Video className='w-5'/>
            }            
            {loading ? 'Generating Video...' : 'Generate Video'}
          </button>

          {loading && (
            <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
              <div className='flex items-center gap-2 mb-3'>
                <Clock className='w-4 h-4 text-blue-600' />
                <span className='text-sm font-medium text-blue-800'>
                  Generating Video... {formatTime(estimatedTimeLeft)} estimated remaining
                </span>
              </div>
              
              <div className='w-full bg-blue-200 rounded-full h-3'>
                <div 
                  className='bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-1000 flex items-center justify-end pr-2'
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && <span className='text-xs text-white font-medium'>{Math.round(progress)}%</span>}
                </div>
              </div>
              
              <div className='flex items-center justify-between mt-2'>
                <p className='text-xs text-blue-700'>{status}</p>
                <p className='text-xs text-blue-600'>Elapsed: {formatTime(timeElapsed)}</p>
              </div>
              
              <div className='mt-3 text-xs text-blue-600 space-y-1'>
                <p>💡 High-quality video generation takes 2-5 minutes</p>
                <p>🎬 Your patience will be rewarded with amazing results!</p>
                <p>⚡ Keep this tab open - we'll notify you when ready</p>
              </div>
            </div>
          )}
        </form>

        <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Video className='w-5 h-5 text-[#2a0334]'/>
              <h1 className='text-xl font-semibold'>Generated Video</h1>
            </div>
            
            {content && (
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleDownload}
                  className='p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                  title='Download Video'
                >
                  <Download className='w-4 h-4'/>
                </button>
                <button
                  onClick={handleShare}
                  className='p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                  title='Share Video'
                >
                  <Share2 className='w-4 h-4'/>
                </button>
              </div>
            )}
          </div>

          {!content ? (
            <div className='flex-1 flex justify-center items-center'>
              {loading ? (
                <div className='text-center'>
                  <div className='relative mx-auto mb-4'>
                    <Video className='w-16 h-16 text-gray-300' />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                  </div>
                  
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>Creating Your Video</h3>
                  <p className='text-sm text-gray-600 mb-4'>{status}</p>
                  
                  <div className='max-w-xs mx-auto'>
                    <div className='flex justify-between text-xs text-gray-500 mb-1'>
                      <span>{Math.round(progress)}% Complete</span>
                      <span>{formatTime(estimatedTimeLeft)} left</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div 
                        className='bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000'
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-sm flex flex-col items-center gap-5 text-gray-700'>
                  <Video className='w-9 h-9'/>
                  <div className='text-center'>
                    <p className='mb-2'>Enter a detailed topic and click "Generate Video" to get started.</p>
                    <p className='text-xs text-gray-500'>💡 Tip: Be specific and descriptive for best results</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='mt-4 h-full'>
              {videoError ? (
                <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
                  <AlertCircle className='w-12 h-12 mb-4 text-red-400'/>
                  <p className='text-sm text-center mb-4'>Failed to load video</p>
                  <a 
                    href={content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-indigo-600 hover:text-indigo-800 text-sm underline'
                  >
                    Open video in new tab
                  </a>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2 mb-3'>
                    <CheckCircle className='w-5 h-5 text-green-600' />
                    <span className='text-sm font-medium text-green-800'>Video Ready!</span>
                  </div>
                  
                  <video 
                    src={content} 
                    controls 
                    className='w-full h-auto rounded-lg shadow-sm'
                    onError={handleVideoError}
                    preload="metadata"
                    poster="" // You can add a poster image here
                  >
                    <source src={content} type="video/mp4" />
                    Your browser does not support the video tag.
                    <a href={content} target="_blank" rel="noopener noreferrer">
                      Download video instead
                    </a>
                  </video>
                </>
              )}
              
              {content && !videoError && (
                <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                  <p className='text-xs text-gray-600 mb-1'>
                    <strong>Prompt:</strong> {input}
                  </p>
                  <p className='text-xs text-gray-600'>
                    <strong>Style:</strong> {selectedStyle}
                  </p>
                  {publish && (
                    <span className='inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                      Public
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  )
}

export default GenerateVideo