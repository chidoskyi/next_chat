// hooks/useVoiceRecorder.ts - Voice note recording with RecordRTC (SSR-safe)
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type RecordRTCType = any

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const recorderRef = useRef<RecordRTCType | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const RecordRTCRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    
    import('recordrtc').then((module) => {
      RecordRTCRef.current = module.default
      console.log('✅ RecordRTC loaded')
    }).catch((error) => {
      console.error('❌ Failed to load RecordRTC:', error)
    })
  }, [])

// hooks/useVoiceRecorder.ts
const startRecording = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    });
    
    streamRef.current = stream;
    const RecordRTC = RecordRTCRef.current;
    
    // 🔥 FIX: Use MP3 for Safari compatibility
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    const recorder = new RecordRTC(stream, {
      type: 'audio',
      mimeType: isSafari ? 'audio/mp3' : 'audio/webm',  // 🔥 MP3 for Safari
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      desiredSampRate: 16000,
      timeSlice: 100,
      disableLogs: false,
    });
    
    recorder.startRecording();
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordingDuration(0);
    
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Failed to start recording:', error);
    throw error;
  }
}, [isClient]);

const stopRecording = useCallback(async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!recorderRef.current) {
      reject(new Error('No recorder instance'));
      return;
    }
    
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current!.getBlob();
      
      // 🔥 FIX: Use correct file extension
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const extension = isSafari ? 'mp3' : 'webm';
      const mimeType = isSafari ? 'audio/mp3' : 'audio/webm';
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      const file = new File(
        [blob], 
        `voice-note-${Date.now()}.${extension}`,  // 🔥 Correct extension
        { type: mimeType }
      );
      
      console.log('✅ Recording stopped:', {
        name: file.name,
        size: file.size,
        type: file.type,
        duration: recordingDuration
      });
      
      setIsRecording(false);
      recorderRef.current = null;
      resolve(file);
    });
  });
}, [recordingDuration]);

  const cancelRecording = useCallback(() => {
    console.log('❌ Cancelling recording...')
    
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        recorderRef.current = null
      })
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }

    setIsRecording(false)
    setRecordingDuration(0)
  }, [])

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    isReady: isClient && RecordRTCRef.current !== null,
  }
}