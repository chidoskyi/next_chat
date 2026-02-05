// components/VideoCall.tsx
import { useEffect, useRef } from 'react'

interface VideoCallProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isVideoCall: boolean
  onEndCall: () => void
  onToggleVideo: () => void
  onToggleAudio: () => void
  isVideoEnabled: boolean
  isAudioEnabled: boolean
}

export function VideoCall({
  localStream,
  remoteStream,
  isVideoCall,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  isVideoEnabled,
  isAudioEnabled
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])
  
  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])
  
  return (
    <div className="relative w-full h-full bg-black">
      {/* Remote video (main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local video (picture-in-picture) */}
      {isVideoCall && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-32 h-48 rounded-lg object-cover border-2 border-white"
        />
      )}
      
      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={onToggleAudio}
          className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
        >
          {isAudioEnabled ? '🎤' : '🔇'}
        </button>
        
        {isVideoCall && (
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
          >
            {isVideoEnabled ? '📹' : '📵'}
          </button>
        )}
        
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600"
        >
          📞 End
        </button>
      </div>
    </div>
  )
}