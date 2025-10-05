import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useClerk, useUser } from '@clerk/clerk-react'
import { Sparkles, Zap, Crown } from 'lucide-react'

const Footer = () => {

    const { openSignIn } = useClerk();
    const { isSignedIn, user } = useUser();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Handle subscription logic here
            alert('Thank you for subscribing!');
            setEmail('');
        }
    };

    return (
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500 mt-20">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">
                <div className="md:max-w-96">
                    <img className="h-9" src={assets.logo} alt="logo"/>
                    <p className="mt-6 text-sm">
                        Experience the power of AI with Quick AI. <br/> 
                        Transform your content creation with our suite of premium AI tools.
                        Write articles, generate images, and more - all in one place.
                    </p>

                    {/* Social Connect */}
                    <div className='mt-8'>
                        <p className="text-xs text-gray-700 mb-2 font-medium">Connect with us:</p>
                        <div className="flex gap-2">
                            <a href="#" className="bg-blue-500 text-white w-9 h-9 rounded flex items-center justify-center hover:bg-blue-600 transition-colors font-bold text-sm">
                                f
                            </a>
                            <a href="#" className="bg-sky-400 text-white w-9 h-9 rounded flex items-center justify-center hover:bg-sky-500 transition-colors font-bold text-sm">
                                𝕏
                            </a>
                            <a href="#" className="bg-pink-500 text-white w-9 h-9 rounded flex items-center justify-center hover:bg-pink-600 transition-colors font-bold text-sm">
                                in
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20">
                    {/* <div>
                        <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Contact us</a></li>
                            <li><a href="#">Privacy policy</a></li>
                        </ul>
                    </div> */}
                    
                    {!isSignedIn ? (
                        <div className="min-w-[280px]">
                            <h2 className="font-semibold text-gray-800 mb-5">Subscribe to our newsletter</h2>
                            <div className="text-sm space-y-2">
                                <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                                <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-4">
                                    <input 
                                        className="border border-gray-500/30 placeholder-gray-500 focus:ring-2 ring-indigo-600 outline-none w-full max-w-64 h-9 rounded px-2" 
                                        type="email" 
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={openSignIn} 
                                        className="bg-primary w-24 h-9 text-white rounded cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-[280px]">
                            <h2 className="font-semibold text-gray-800 mb-5">You're all set! 🎉</h2>
                            
                            {/* Stats Card */}
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white mb-4">
                                <p className="text-xs opacity-90 mb-3">Your AI Journey</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-bold">∞</p>
                                        <p className="text-xs opacity-90">Creations</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">∞</p>
                                        <p className="text-xs opacity-90">Possibilities</p>
                                    </div>
                                    <Sparkles className="w-8 h-8 opacity-80" />
                                </div>
                            </div>

                            {/* Pro Tip */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-amber-900">Pro Tip</p>
                                        <p className="text-xs text-amber-800 mt-1">Try combining multiple AI tools for amazing results!!</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            <p className="pt-4 text-center text-xs md:text-sm pb-5">
                Copyright {new Date().getFullYear()} © <a href="https://prebuiltui.com">Pratyush</a>. All Right Reserved.
            </p>
        </footer>
    )
}

export default Footer