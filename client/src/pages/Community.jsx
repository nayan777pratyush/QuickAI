import React, { useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Heart, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken, isLoaded: authLoaded } = useAuth()
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedAnimations, setLikedAnimations] = useState({})
  const [lastTap, setLastTap] = useState({})
  
  const fetchCreations = async () => {
    if (!authLoaded || !userLoaded || !user) {
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setCreations(data.creations);
        toast.success('Community creations loaded successfully');
      } else {
        toast.error(data.message || 'Unknown error from API');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load creations';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle double-click/tap to like functionality
  const handleDoubleTap = (creationId, event) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    if (lastTap[creationId] && (now - lastTap[creationId]) < DOUBLE_TAP_DELAY) {
      // Double tap detected
      event.preventDefault();
      toggleLike(creationId);
      
      // Clear the last tap to prevent triple-tap issues
      setLastTap(prev => ({ ...prev, [creationId]: 0 }));
    } else {
      // Single tap - just record the time
      setLastTap(prev => ({ ...prev, [creationId]: now }));
    }
  };
  const toggleLike = async (id) => {
    if (!userLoaded || !authLoaded || !user) {
      toast.error('Please ensure you are signed in');
      return;
    }
    
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/user/toggle-like-creations',
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success(data.message)
        setLikedAnimations(prev => ({ ...prev, [id]: true }))
        setTimeout(() => setLikedAnimations(prev => ({ ...prev, [id]: false })), 700)
        fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  useEffect(() => {
    if (authLoaded && userLoaded) {
      if (user) {
        fetchCreations();
      } else {
        setLoading(false);
        toast.error('Please sign in to view community');
      }
    }
  }, [authLoaded, userLoaded, user?.id]);

  // Show a loading spinner while Clerk is verifying authentication
  if (!authLoaded || !userLoaded) {
    return (
      <div className='w-full h-full flex flex-col justify-center items-center p-4 bg-white'>
        <Loader2 className='w-8 h-8 md:w-10 md:h-10 animate-spin text-primary' />
        <p className='mt-4 text-xs md:text-sm text-gray-500'>Loading authentication...</p>
      </div>
    );
  }

  // If authentication is loaded but there is no user, prompt to sign in.
  if (!user) {
    return (
      <div className='w-full h-full flex flex-col justify-center items-center p-4 bg-white'>
        <p className='text-sm md:text-base text-gray-500 mb-4 text-center'>
          Please sign in to view the community creations.
        </p>
      </div>
    );
  }

  // Show loading spinner for data fetching
  if (loading) {
    return (
      <div className='w-full h-full flex flex-col justify-center items-center p-4 bg-white'>
        <Loader2 className='w-8 h-8 md:w-10 md:h-10 animate-spin text-primary' />
        <p className='mt-4 text-xs md:text-sm text-gray-500'>Loading community creations...</p>
      </div>
    );
  }

  const isVideo = url => url?.endsWith('.mp4') || url?.endsWith('.webm') || url?.endsWith('.mov')
  const isGif = url => url?.endsWith('.gif')

  return (
    <div className='w-full h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-hidden bg-white'>
      {/* Header with responsive text */}
      <h2 className='text-base sm:text-lg font-semibold mb-3 md:mb-4 px-1'>
        Community Creations
      </h2>
      
      {/* Scrollable container with better mobile spacing */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden'>
        {/* Responsive grid: 2 cols on mobile, scaling up on larger screens */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 pb-4'>
          {creations.length > 0 ? creations.map((creation) => (
            <div 
              key={creation.id} 
              className='relative group w-full rounded-md sm:rounded-lg overflow-hidden bg-gray-100'
              style={{ aspectRatio: '1/1' }}
            >
              {/* Media content with proper aspect ratio */}
              {isVideo(creation.content) ? (
                <video
                  src={creation.content}
                  className='absolute inset-0 w-full h-full object-cover cursor-pointer'
                  controls
                  playsInline
                  onDoubleClick={(e) => handleDoubleTap(creation.id, e)}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : isGif(creation.content) ? (
                <video
                  src={creation.content}
                  className='absolute inset-0 w-full h-full object-cover cursor-pointer'
                  autoPlay
                  loop
                  muted
                  playsInline
                  onDoubleClick={(e) => handleDoubleTap(creation.id, e)}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <img
                  src={creation.content}
                  alt="creation"
                  className='absolute inset-0 w-full h-full object-cover cursor-pointer'
                  loading="lazy"
                  onDoubleClick={(e) => handleDoubleTap(creation.id, e)}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}

              {/* Overlay with responsive text and spacing */}
              <div className='absolute inset-0 flex flex-col justify-between p-2 sm:p-3 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200'>
                {/* Prompt text - responsive sizing and line clamping */}
                <p className='text-[10px] sm:text-xs md:text-sm text-white line-clamp-2 sm:line-clamp-3 drop-shadow-lg'>
                  {creation.prompt}
                </p>
                
                {/* Like button and count - responsive sizing */}
                <div className='flex items-center gap-1 text-white relative'>
                  <p className='text-xs sm:text-sm font-medium drop-shadow-lg'>
                    {creation.likes?.length || 0}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(creation.id);
                    }}
                    className='p-1 -m-1 hover:scale-110 active:scale-95 transition-transform'
                    aria-label={creation.likes?.includes(user.id) ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`h-4 w-4 sm:h-5 sm:w-5 cursor-pointer transition-all duration-200 drop-shadow-lg ${
                        creation.likes?.includes(user.id) 
                          ? 'fill-red-500 text-red-600' 
                          : 'text-white hover:text-red-400 hover:fill-red-400/20'
                      }`}
                    />
                  </button>
                  
                  {/* Animated heart on like */}
                  {likedAnimations[creation.id] && (
                    <Heart className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 fill-red-500 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-ping pointer-events-none' />
                  )}
                </div>
              </div>
            </div>
          )) : 
            // Empty state - responsive sizing
            <div className='col-span-full text-center text-gray-500 py-8 sm:py-10'>
              <p className='mb-3 sm:mb-4 text-sm sm:text-base'>
                No creations have been published yet.
              </p>
              <button 
                onClick={fetchCreations}
                className='px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500 text-white text-sm sm:text-base rounded-md hover:bg-purple-600 active:scale-95 transition-all'
              >
                Retry Loading
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default Community