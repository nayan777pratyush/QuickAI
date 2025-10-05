import React, { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const VoiceButton = ({ text }) => {
    const [isSpeaking, setIsSpeaking] = useState(false)

    const speak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
    }

    return (
        <button 
            onClick={speak}
            className="p-2 hover:bg-gray-100 rounded-full"
            title={isSpeaking ? "Stop speaking" : "Read aloud"}
        >
            {isSpeaking ? <VolumeX className="w-5 h-5 text-gray-600" /> : <Volume2 className="w-5 h-5 text-gray-600" />}
        </button>
    )
}

export default VoiceButton
