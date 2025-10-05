import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react';
import { Protect, useAuth, useUser } from '@clerk/clerk-react';
import CreationsItem from '../components/CreationsItem';
import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [debugInfo, setDebugInfo] = useState('');
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  // const addDebugInfo = (info) => {
  //   console.log('DEBUG:', info);
  //   setDebugInfo(prev => prev + '\n' + info);
  // };

  const getDashboardData = async () => {
    // addDebugInfo('getDashboardData called');
    // addDebugInfo(`Auth loaded: ${authLoaded}, User loaded: ${userLoaded}, User exists: ${!!user}`);
    
    if (!authLoaded || !userLoaded || !user) {
      // addDebugInfo('Conditions not met, returning early');
      return;
    }

    try {
      setLoading(true);
      // addDebugInfo('About to get token');
      
      const token = await getToken();
      // addDebugInfo(`Token obtained: ${token ? 'YES' : 'NO'}`);
      // addDebugInfo(`Base URL: ${axios.defaults.baseURL}`);
      
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // addDebugInfo(`API Response: ${JSON.stringify(data)}`);

      if (data.success) {
        setCreations(data.creations);
        // addDebugInfo(`Creations set: ${data.creations?.length} items`);
        toast.success('Dashboard data loaded successfully');
      } else {
        // addDebugInfo(`API returned success: false, message: ${data.message}`);
        toast.error(data.message || 'Unknown error from API');
      }
    } catch (error) {
      // addDebugInfo(`Error caught: ${error.message}`);
      // addDebugInfo(`Error response: ${JSON.stringify(error.response?.data)}`);
      // addDebugInfo(`Error status: ${error.response?.status}`);
      
      // console.error('Dashboard API Error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      // addDebugInfo('Loading set to false');
    }
  };

  useEffect(() => {
    // addDebugInfo(`useEffect triggered - Auth: ${authLoaded}, User: ${userLoaded}, UserID: ${user?.id}`);
    
    if (authLoaded && userLoaded) {
      if (user) {
        // addDebugInfo('Calling getDashboardData');
        getDashboardData();
      } else {
        // addDebugInfo('No user found, stopping loading');
        setLoading(false);
        toast.error('Please sign in to view dashboard');
      }
    } else {
      // addDebugInfo('Auth or user not loaded yet');
    }
  }, [authLoaded, userLoaded, user?.id]);

  // Show loading spinner while Clerk is loading
  if (!authLoaded || !userLoaded) {
    return (
      <div className='h-full flex flex-col justify-center items-center'>
        <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
        <p className='mt-4 text-sm text-gray-500'>Loading authentication...</p>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className='h-full flex flex-col justify-center items-center'>
        <p className='text-gray-500 mb-4'>Please sign in to view your dashboard.</p>
        {/* <pre className='text-xs bg-gray-100 p-4 rounded max-w-md overflow-auto'>
          {debugInfo}
        </pre> */}
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      {/* Debug Info Panel */}
      {/* <div className='mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded'>
        <details>
          <summary className='cursor-pointer text-sm font-medium'>Debug Info (Click to expand)</summary>
          <pre className='text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40'>
            Auth Loaded: {String(authLoaded)}
            User Loaded: {String(userLoaded)}
            User ID: {user?.id || 'None'}
            Base URL: {axios.defaults.baseURL}
            Loading: {String(loading)}
            Creations Count: {creations.length}
            
            {debugInfo}
          </pre>
        </details>
      </div> */}

      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Total Creations Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='premium' fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex flex-col justify-center items-center h-3/4'>
          <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
          <p className='mt-4 text-sm text-gray-500'>Loading dashboard data...</p>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {creations.length > 0 ? (
            creations.map((item) => <CreationsItem key={item.id} item={item} />)
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No creations yet. Start creating something amazing!</p>
              <button 
                onClick={getDashboardData}
                className='mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'
              >
                Retry Loading
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard