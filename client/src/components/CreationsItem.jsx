import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { ExternalLink } from 'lucide-react'

const CreationsItem = ({item}) => {

    const [expanded, setExpanded] = useState(false);

    // Function to handle opening links in new tab
    const openInNewTab = (url, event) => {
        event.stopPropagation(); // Prevent the expand/collapse from triggering
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Check if content is a URL (for images, videos, etc.)
    const isUrl = (str) => {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };

    // Check if content is a video URL
    const isVideo = (url) => {
        return url?.endsWith('.mp4') || url?.endsWith('.webm') || url?.endsWith('.mov');
    };

  return (
    <div onClick={() => setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'>
        <div className='flex justify-between items-center gap-4'>
            <div className='flex-1'>
                <h2>{item.prompt}</h2>
                <p className='text-gray-500'>{item.type} - {new Date(item.creation_at).toLocaleDateString()}</p>
            </div>
            <div className='flex items-center gap-2'>
                {/* Open in browser button for URL content */}
                {expanded && isUrl(item.content) && (
                    <button 
                        onClick={(e) => openInNewTab(item.content, e)}
                        className='bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-100 transition-colors'
                        title="Open in browser"
                    >
                        <ExternalLink className='w-3 h-3' />
                        Open
                    </button>
                )}
                <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>{item.type}</button>
            </div>
        </div>
        {
            expanded && (
                <div>
                    {
                        item.type === 'image' ? (
                            <div>
                                <img 
                                    src={item.content} 
                                    alt="creation" 
                                    className='mt-3 w-full max-w-md cursor-pointer hover:opacity-90 transition-opacity' 
                                    onClick={(e) => openInNewTab(item.content, e)}
                                    title="Click to open in new tab"
                                />
                            </div>
                        ) : isVideo(item.content) ? (
                            <div className='mt-3'>
                                <video 
                                    src={item.content} 
                                    controls 
                                    className='w-full max-w-md'
                                    onClick={(e) => e.stopPropagation()} // Prevent expand/collapse when clicking video controls
                                />
                                <button 
                                    onClick={(e) => openInNewTab(item.content, e)}
                                    className='mt-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100 transition-colors flex items-center gap-1'
                                >
                                    <ExternalLink className='w-3 h-3' />
                                    Open video in browser
                                </button>
                            </div>
                        ) : isUrl(item.content) ? (
                            <div className='mt-3'>
                                <a 
                                    href={item.content} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className='text-blue-600 hover:text-blue-800 underline break-all'
                                >
                                    {item.content}
                                </a>
                            </div>
                        ) : (
                            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                                <div className='reset-tw'>
                                    <Markdown>{item.content}</Markdown>
                                </div>
                            </div>
                        )
                    }
                </div>
            )
        }
    </div>
  )
}

export default CreationsItem