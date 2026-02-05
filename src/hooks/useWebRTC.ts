// hooks/useWebRTC.ts
import { useRef, useCallback, useEffect, useState } from 'react'
import messageAPI from "@/src/services/messageService";
import axios from 'axios';

interface WebRTCConfig {
  iceServers?: RTCIceServer[]
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (stream: MediaStream) => void
  onIceCandidate?: (candidate: RTCIceCandidate) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
}

// Fallback STUN-only — calls still work on most networks without TURN,
// they just can't traverse strict NATs / firewalls.
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]

export const useWebRTC = (config: WebRTCConfig = {}) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef    = useRef<MediaStream | null>(null)
  const remoteStreamRef   = useRef<MediaStream | null>(null)
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])

  // Config in a ref — callbacks never change identity, PC survives renders
  const configRef = useRef(config)
  configRef.current = config

  // Streams as state so components re-render when they change
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  const [connectionState,      setConnectionState]      = useState<RTCPeerConnectionState>('new')
  const [isLocalVideoEnabled,  setIsLocalVideoEnabled]  = useState(true)
  const [isLocalAudioEnabled,  setIsLocalAudioEnabled]  = useState(true)

  // ── ICE server fetching (once per session) ────────────────────────
  const iceServersRef     = useRef<RTCIceServer[] | null>(null)
  const iceServersFetchingRef = useRef(false)

const fetchIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
  if (iceServersRef.current) return iceServersRef.current;
  if (iceServersFetchingRef.current) return FALLBACK_ICE_SERVERS;

  iceServersFetchingRef.current = true;
  
  try {
    console.log('🧊 Fetching TURN credentials from /api/turn-credentials...');
    
    // Directly get the data (not a Response object)
    const data = await messageAPI.getTurnCredentials();
    
    // Check if request failed
    if (!data) {
      console.warn('⚠️ Failed to fetch TURN credentials (null response)');
      iceServersRef.current = FALLBACK_ICE_SERVERS;
      return FALLBACK_ICE_SERVERS;
    }
    
    // Check Metered API success status
    if (data.s !== 'success') {
      console.warn(`⚠️ TURN endpoint returned error: ${data.s}`);
      iceServersRef.current = FALLBACK_ICE_SERVERS;
      return FALLBACK_ICE_SERVERS;
    }
    
    // Extract iceServers from Metered response
    const servers: RTCIceServer[] = data.v.iceServers.map(server => ({
      urls: server.urls,
      username: server.username,
      credential: server.credential,
    }));
    
    if (servers.length === 0) {
      console.warn('⚠️ Empty iceServers response, falling back to STUN only');
      iceServersRef.current = FALLBACK_ICE_SERVERS;
      return FALLBACK_ICE_SERVERS;
    }
    
    console.log('✅ Got TURN + STUN servers:', servers.map(s => s.urls));
    iceServersRef.current = servers;
    return servers;
    
  } catch (err) {
    console.warn('⚠️ TURN fetch failed, falling back to STUN only:', err);
    iceServersRef.current = FALLBACK_ICE_SERVERS;
    return FALLBACK_ICE_SERVERS;
  } finally {
    iceServersFetchingRef.current = false;
  }
}, []);

  // ── Peer connection init (now async because of fetchIceServers) ────
  const initializePeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current

    const iceServers = await fetchIceServers()

    console.log('🔌 Initializing RTCPeerConnection...')
    const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 New ICE candidate:', event.candidate.candidate)
        configRef.current.onIceCandidate?.(event.candidate)
      } else {
        console.log('🧊 ICE gathering completed')
      }
    }

    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState)
    }

    pc.ontrack = (event) => {
      console.log('📹 Remote track received:', event.track.kind)
      if (event.streams?.[0]) {
        remoteStreamRef.current = event.streams[0]
        setRemoteStream(event.streams[0])
        configRef.current.onRemoteStream?.(event.streams[0])
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', pc.connectionState)
      setConnectionState(pc.connectionState)
      configRef.current.onConnectionStateChange?.(pc.connectionState)
    }

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState)
    }

    pc.onsignalingstatechange = () => {
      console.log('📡 Signaling state:', pc.signalingState)
    }

    peerConnectionRef.current = pc
    console.log('✅ RTCPeerConnection initialized')
    return pc
  }, [fetchIceServers])

  // ── getUserMedia ───────────────────────────────────────────────────
  const getUserMedia = useCallback(async (
    constraints: MediaStreamConstraints = { audio: true, video: true }
  ): Promise<MediaStream> => {
    try {
      console.log('🎥 Requesting user media...', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      localStreamRef.current = stream
      setLocalStream(stream)
      configRef.current.onLocalStream?.(stream)

      const vt = stream.getVideoTracks()[0]
      const at = stream.getAudioTracks()[0]
      if (vt) setIsLocalVideoEnabled(vt.enabled)
      if (at) setIsLocalAudioEnabled(at.enabled)

      console.log('✅ Got user media:', stream.getTracks().map(t => `${t.kind}:${t.label}`))
      return stream
    } catch (error) {
      console.error('❌ Failed to get user media:', error)
      throw error
    }
  }, [])

  // ── createOffer (caller) ───────────────────────────────────────────
  const createOffer = useCallback(async (isVideoCall = true): Promise<RTCSessionDescriptionInit> => {
    try {
      console.log('📞 Creating offer for', isVideoCall ? 'video' : 'audio', 'call...')

      const stream = await getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: isVideoCall
          ? { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, facingMode: 'user', frameRate: { ideal: 30 } }
          : false
      })

      const pc = await initializePeerConnection()
      stream.getTracks().forEach(track => {
        console.log('➕ Adding local track:', track.kind, track.label)
        pc.addTrack(track, stream)
      })

      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: isVideoCall })
      await pc.setLocalDescription(offer)
      console.log('✅ Offer created')
      return offer
    } catch (error) {
      console.error('❌ Failed to create offer:', error)
      throw error
    }
  }, [getUserMedia, initializePeerConnection])

  // ── createAnswer (callee) ──────────────────────────────────────────
  const createAnswer = useCallback(async (
    offer: RTCSessionDescriptionInit,
    isVideoCall = true
  ): Promise<RTCSessionDescriptionInit> => {
    try {
      console.log('📞 Creating answer...')
      if (!offer?.type || !offer?.sdp) throw new Error('Invalid offer: missing type or sdp')

      const stream = await getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: isVideoCall
          ? { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, facingMode: 'user', frameRate: { ideal: 30 } }
          : false
      })

      const pc = await initializePeerConnection()
      stream.getTracks().forEach(track => {
        console.log('➕ Adding local track:', track.kind, track.label)
        pc.addTrack(track, stream)
      })

      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer.sdp }))
      console.log('✅ Remote description (offer) set')

      // Flush any ICE candidates that arrived before remote desc was ready
      if (pendingIceCandidatesRef.current.length > 0) {
        console.log(`🧊 Flushing ${pendingIceCandidatesRef.current.length} pending ICE candidates`)
        for (const c of pendingIceCandidatesRef.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)) }
          catch (e) { console.warn('Pending candidate failed:', e) }
        }
        pendingIceCandidatesRef.current = []
      }

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      console.log('✅ Answer created')
      return answer
    } catch (error) {
      console.error('❌ Failed to create answer:', error)
      throw error
    }
  }, [getUserMedia, initializePeerConnection])

  // ── setRemoteAnswer (caller receives callee's answer) ─────────────
  const setRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionRef.current
      if (!pc) throw new Error('Peer connection not initialized')

      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('✅ Remote answer set')

      if (pendingIceCandidatesRef.current.length > 0) {
        console.log(`🧊 Flushing ${pendingIceCandidatesRef.current.length} pending ICE candidates`)
        for (const c of pendingIceCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c))
        }
        pendingIceCandidatesRef.current = []
      }
    } catch (error) {
      console.error('❌ Failed to set remote answer:', error)
      throw error
    }
  }, [])

  // ── addIceCandidate ────────────────────────────────────────────────
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionRef.current
      if (!pc || !pc.remoteDescription) {
        console.warn('⚠️ Queuing ICE candidate (PC or remote desc not ready)')
        pendingIceCandidatesRef.current.push(candidate)
        return
      }
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('✅ ICE candidate added')
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error)
    }
  }, [])

  // ── toggles ────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks()
    if (tracks) {
      tracks.forEach(t => { t.enabled = !t.enabled })
      setIsLocalVideoEnabled(tracks[0]?.enabled ?? false)
    }
  }, [])

  const toggleAudio = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks()
    if (tracks) {
      tracks.forEach(t => { t.enabled = !t.enabled })
      setIsLocalAudioEnabled(tracks[0]?.enabled ?? false)
    }
  }, [])

  // ── switchCamera ───────────────────────────────────────────────────
  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return
    const vt = localStreamRef.current.getVideoTracks()[0]
    if (!vt) return

    try {
      const next = vt.getSettings().facingMode === 'user' ? 'environment' : 'user'
      console.log(`📹 Switching camera → ${next}`)
      vt.stop()

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      const newVt = newStream.getVideoTracks()[0]

      const pc = peerConnectionRef.current
      if (pc) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) await sender.replaceTrack(newVt)
      }

      const at = localStreamRef.current.getAudioTracks()[0]
      const updated = new MediaStream([newVt, at].filter(Boolean))
      localStreamRef.current = updated
      setLocalStream(updated)
      configRef.current.onLocalStream?.(updated)
      console.log('✅ Camera switched')
    } catch (error) {
      console.error('❌ switchCamera failed:', error)
    }
  }, [])

  // ── cleanup ────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebRTC...')
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => { t.stop(); console.log('🛑 Stopped:', t.kind) })
      localStreamRef.current = null
      setLocalStream(null)
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(t => t.stop())
      remoteStreamRef.current = null
      setRemoteStream(null)
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    pendingIceCandidatesRef.current = []
    setConnectionState('closed')
    console.log('✅ WebRTC cleanup done')
  }, [])

  useEffect(() => { return () => { cleanup() } }, [cleanup])

  return {
    connectionState,
    localStream,
    remoteStream,
    isLocalVideoEnabled,
    isLocalAudioEnabled,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    addIceCandidate,
    toggleVideo,
    toggleAudio,
    switchCamera,
    cleanup,
  }
}