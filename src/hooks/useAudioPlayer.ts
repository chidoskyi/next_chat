// hooks/useAudioPlayer.ts
'use client'
import { useEffect, useRef } from 'react'

export const useAudioPlayer = (
  audioUrl: string | null,
  isPlaying: boolean,
  onEnded?: () => void
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    if (!audioUrl) return
    
    // Create audio element
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        onEnded?.()
      }
    }
    
    // Play or pause
    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioUrl, isPlaying, onEnded])
  
  return audioRef
}