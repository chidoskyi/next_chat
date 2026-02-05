// hooks/useCalls.ts
import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCurrentCall,
  setCurrentCall,
} from '@/src/store/slices/messageSlice'
import type { Call } from '@/src/types/message'
import type { User } from '@/src/types/users'
import { useWebRTC } from './useWebRTC'
import { useWebSocket } from '@/src/hooks/useWebSocket'
import { toast } from '@/src/components/ui/use-toast'

export const useCalls = (token: string | null) => {
  const dispatch = useDispatch()
  const { call: callWs } = useWebSocket(token)
  const currentCall = useSelector(selectCurrentCall)
  const [incomingCall, setIncomingCall] = useState<Call | null>(null)

  // ============================================================
  // REFS — stable across renders, no stale closures
  // ============================================================

  const activeCallIdRef   = useRef<string | null>(null)
  // 🔥 Persists call_type across the entire call lifecycle.
  //    Set once in incoming_call, read in call_answered.
  //    Never lost even if currentCall flickers to null between renders.
  const callTypeRef       = useRef<'audio' | 'video' | null>(null)
  // 🔥 Persists the FULL call object set in incoming_call.
  //    call_answered spreads from THIS, not from the Redux selector.
  const callObjectRef     = useRef<Call | null>(null)

  const currentCallRef = useRef<Call | null>(currentCall)
  currentCallRef.current = currentCall

  // Candidates that fire during createOffer before we have a call ID
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([])

  // ============================================================
  // WebRTC — put into a ref so it NEVER appears in a dep array.
  //          The useEffect below must mount exactly once and stay alive.
  // ============================================================

  const onIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    const callId = activeCallIdRef.current
    if (callId) {
      console.log('🧊 Sending ICE candidate | type:', candidate.type, '| call:', callId)
      callWs.sendIceCandidate(callId, candidate.toJSON())
    } else {
      console.log('🧊 Buffering ICE candidate (no call ID yet) | type:', candidate.type)
      pendingCandidatesRef.current.push(candidate)
    }
  }, [callWs])

  const onConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
    console.log('🔌 WebRTC connection state:', state)
    if (state === 'failed' || state === 'disconnected') {
      const callId = activeCallIdRef.current
      if (callId) {
        console.warn('⚠️ Connection failed/disconnected — hanging up')
        callWs.endCall(callId)
        activeCallIdRef.current = null
        callTypeRef.current = null
        callObjectRef.current = null
        pendingCandidatesRef.current = []
        dispatch(setCurrentCall(null))
        setIncomingCall(null)
      }
    }
  }, [callWs, dispatch])

  const webrtcConfigRef = useRef({
    onIceCandidate,
    onConnectionStateChange,
  })
  webrtcConfigRef.current.onIceCandidate = onIceCandidate
  webrtcConfigRef.current.onConnectionStateChange = onConnectionStateChange

  const webrtc = useWebRTC(webrtcConfigRef.current)

  // 🔥 webrtc into a ref — the effect reads webrtcRef.current,
  //    so webrtc is NOT in the dep array and the effect never re-runs.
  const webrtcRef = useRef(webrtc)
  webrtcRef.current = webrtc

  // ============================================================
  // Flush buffered candidates
  // ============================================================
  const flushPendingCandidates = useCallback((callId: string) => {
    const pending = pendingCandidatesRef.current
    if (pending.length === 0) return

    console.log(`🧊 Flushing ${pending.length} buffered candidate(s) → call ${callId}`)
    pending.forEach((candidate) => {
      callWs.sendIceCandidate(callId, candidate.toJSON())
    })
    pendingCandidatesRef.current = []
  }, [callWs])

  // ============================================================
  // Event listeners — mount ONCE, stay alive for the lifetime of
  // the component.  Everything mutable is read via refs.
  // ============================================================

  useEffect(() => {
    if (!callWs) return

    console.log('👂 [useCalls] Mounting call event listeners')

    // ----------------------------------------------------------
    // incoming_call
    // ----------------------------------------------------------
    const unsubIncoming = callWs.on('incoming_call', async (data) => {
      console.log('========================================')
      console.log('📞 INCOMING_CALL EVENT')
      console.log('  Call ID     :', data.call_id)
      console.log('  Caller     :', data.caller_username, `(${data.caller_id})`)
      console.log('  Type       :', data.call_type)
      console.log('  is_caller  :', data.is_caller)
      console.log('========================================')

      // 🔥 Persist everything we'll need later — before ANY async work
      activeCallIdRef.current = data.call_id
      callTypeRef.current     = data.call_type   // 'audio' | 'video'
      console.log('🔥 activeCallIdRef →', data.call_id, '| callTypeRef →', data.call_type)

      const caller: User = {
        id: data.caller_id,
        username: data.caller_username,
        email: '',
        display_name: data.caller_username,
        email_verified: false,
        created_at: new Date().toISOString(),
        is_online: true,
        last_seen: null,
        profile: {
          id: `temp-profile-${data.caller_id}`,
          bio: '',
          avatar: null,
          phone: '',
          location: '',
          is_private: false,
          gender: '',
          website: '',
          birthday: '',
        }
      }

      const call: Call = {
        id: data.call_id,
        call_type: data.call_type,
        conversation: data.conversation_id,
        caller,
        status: data.is_caller ? 'invited' : 'ringing',
        offer_sdp: data.offer_sdp,
        answer_sdp: null,
        participants: [],
        duration: null,
        duration_display: '00:00',
        initiated_at: new Date().toISOString(),
        answered_at: null,
        ended_at: null,
      }

      // 🔥 Persist the full call object — call_answered will read this
      callObjectRef.current = call

      if (data.is_caller) {
        console.log('👤 You are the CALLER — waiting for answer')
        dispatch(setCurrentCall(call))
        flushPendingCandidates(data.call_id)
        toast({ title: 'Calling...', description: `${data.call_type === 'audio' ? 'Voice' : 'Video'} call initiated` })
      } else {
        console.log('📱 You are the RECEIVER')
        setIncomingCall(call)
        callWs.joinCall?.(data.call_id)
        toast({ title: 'Incoming Call', description: `${data.caller_username} is calling...`, duration: 10000 })
      }
    })

    // ----------------------------------------------------------
    // call_answered   (caller receives this after answerer accepts)
    // ----------------------------------------------------------
    const unsubAnswered = callWs.on('call_answered', async (data) => {
      console.log('========================================')
      console.log('✅ CALL ANSWERED')
      console.log('  answer_sdp :', data.answer_sdp ? 'Present' : 'Missing')
      console.log('  callTypeRef:', callTypeRef.current)
      console.log('========================================')

      try {
        let answer: RTCSessionDescriptionInit
        try {
          answer = typeof data.answer_sdp === 'string'
            ? JSON.parse(data.answer_sdp)
            : data.answer_sdp
        } catch {
          answer = { type: 'answer' as const, sdp: data.answer_sdp }
        }

        console.log('📝 Setting remote answer on PeerConnection...')
        await webrtcRef.current.setRemoteAnswer(answer)
        console.log('✅ Remote answer set')

        // 🔥 Build the answered call from callObjectRef (always valid)
        //    instead of currentCallRef (can be null during re-renders).
        const baseCall = callObjectRef.current
        if (baseCall) {
          const answeredCall: Call = {
            ...baseCall,
            status: 'answered',
            answered_at: new Date().toISOString(),
          }
          console.log('📦 Dispatching answered call | call_type:', answeredCall.call_type)
          dispatch(setCurrentCall(answeredCall))
        } else {
          // Fallback: shouldn't happen, but if it does build a minimal object
          console.warn('⚠️ callObjectRef was null in call_answered — using fallback')
          const callId = activeCallIdRef.current || data.call_id
          dispatch(setCurrentCall({
            id: callId,
            call_type: callTypeRef.current || 'audio',
            conversation: '',
            caller: { id: '', username: 'Unknown', email: '', display_name: 'Unknown', email_verified: false, created_at: '', is_online: false, last_seen: null, profile: { id: '', bio: '', avatar: null, phone: '', location: '', is_private: false, gender: '', website: '', birthday: '' } },
            status: 'answered',
            offer_sdp: null,
            answer_sdp: data.answer_sdp,
            participants: [],
            duration: null,
            duration_display: '00:00',
            initiated_at: new Date().toISOString(),
            answered_at: new Date().toISOString(),
            ended_at: null,
          }))
        }

        toast({ title: 'Call Connected', description: 'You are now in a call' })
      } catch (error) {
        console.error('❌ Failed to process answer:', error)
        toast({ title: 'Call failed', description: 'Failed to establish connection', variant: 'destructive' })
      }
    })

    // ----------------------------------------------------------
    // ice_candidate
    // ----------------------------------------------------------
    const unsubIce = callWs.on('ice_candidate', async (data) => {
      console.log('🧊 ICE candidate RECEIVED | type:', data.candidate?.type)
      try {
        await webrtcRef.current.addIceCandidate(data.candidate)
      } catch (error) {
        console.error('❌ Failed to add ICE candidate:', error)
      }
    })

    // ----------------------------------------------------------
    // call_ended
    // ----------------------------------------------------------
    const unsubEnded = callWs.on('call_ended', (data) => {
      console.log('📴 Call ended | duration:', data.duration)
      activeCallIdRef.current   = null
      callTypeRef.current       = null
      callObjectRef.current     = null
      pendingCandidatesRef.current = []
      webrtcRef.current.cleanup()
      dispatch(setCurrentCall(null))
      setIncomingCall(null)

      const mins = Math.floor((data.duration || 0) / 60)
      const secs = ((data.duration || 0) % 60).toString().padStart(2, '0')
      toast({ title: 'Call ended', description: `Duration: ${mins}:${secs}` })
    })

    // ----------------------------------------------------------
    // call_rejected
    // ----------------------------------------------------------
    const unsubRejected = callWs.on('call_rejected', (data) => {
      console.log('❌ Call rejected by', data.username)
      activeCallIdRef.current   = null
      callTypeRef.current       = null
      callObjectRef.current     = null
      pendingCandidatesRef.current = []
      webrtcRef.current.cleanup()
      dispatch(setCurrentCall(null))
      setIncomingCall(null)
      toast({ title: 'Call rejected', description: `${data.username} declined the call` })
    })

    return () => {
      console.log('🧹 [useCalls] Unmounting call event listeners')
      unsubIncoming()
      unsubAnswered()
      unsubIce()
      unsubEnded()
      unsubRejected()
    }
    // 🔥 ONLY callWs and dispatch here.
    //    webrtc is accessed via webrtcRef — not a dep.
    //    flushPendingCandidates is accessed via closure over callWs which IS a dep.
    //    This effect mounts ONCE and stays alive.
  }, [callWs, dispatch, flushPendingCandidates])

  // ============================================================
  // Public actions
  // ============================================================

  /** Caller initiates a new call */
  const startCall = useCallback(async (
    conversationId: string,
    callType: 'audio' | 'video'
  ) => {
    try {
      console.log('========================================')
      console.log('📞 STARTING CALL')
      console.log('  Conversation:', conversationId)
      console.log('  Type        :', callType)
      console.log('========================================')

      pendingCandidatesRef.current = []

      const offer = await webrtcRef.current.createOffer(callType === 'video')
      console.log('✅ Offer created, sending to server...')
      console.log(`📦 ${pendingCandidatesRef.current.length} candidate(s) buffered, waiting for call ID`)

      callWs.initiateCall(conversationId, callType, JSON.stringify(offer))
      console.log('📤 initiateCall sent — waiting for incoming_call echo to flush buffer')
    } catch (error) {
      console.error('❌ Failed to initiate call:', error)
      webrtcRef.current.cleanup()
      activeCallIdRef.current   = null
      callTypeRef.current       = null
      callObjectRef.current     = null
      pendingCandidatesRef.current = []
      throw error
    }
  }, [callWs])

  /** Answerer accepts an incoming call */
  const acceptCall = useCallback(async (
    callId: string,
    offerSdp: string,
    callType: 'audio' | 'video'
  ) => {
    try {
      console.log('========================================')
      console.log('✅ ACCEPTING CALL | id:', callId, '| type:', callType)
      console.log('========================================')

      activeCallIdRef.current = callId
      callTypeRef.current     = callType

      let offer: RTCSessionDescriptionInit
      try {
        offer = typeof offerSdp === 'string' ? JSON.parse(offerSdp) : offerSdp
      } catch {
        offer = { type: 'offer' as const, sdp: offerSdp }
      }

      if (!offer.type || !offer.sdp) {
        throw new Error('Invalid offer: missing type or sdp')
      }

      const answer = await webrtcRef.current.createAnswer(offer, callType === 'video')
      console.log('✅ Answer created, sending to server...')

      callWs.answerCall(callId, JSON.stringify(answer))

      // Move the call into Redux as answered — modal switches to active controls
      const baseCall = callObjectRef.current   // the incomingCall we saved earlier
      const acceptedCall: Call = {
        ...(baseCall ?? {
          id: callId,
          caller: { id: '', username: 'Unknown', email: '', display_name: 'Unknown', email_verified: false, created_at: '', is_online: false, last_seen: null, profile: { id: '', bio: '', avatar: null, phone: '', location: '', is_private: false, gender: '', website: '', birthday: '' } },
          conversation: '',
          offer_sdp: offerSdp,
          answer_sdp: null,
          participants: [],
          duration: null,
          duration_display: '00:00',
          initiated_at: new Date().toISOString(),
          ended_at: null,
        }),
        call_type: callType,
        status: 'answered',
        answered_at: new Date().toISOString(),
      } as Call

      dispatch(setCurrentCall(acceptedCall))
      setIncomingCall(null)

      console.log('========================================')
    } catch (error) {
      console.error('❌ Failed to answer call:', error)
      webrtcRef.current.cleanup()
      activeCallIdRef.current   = null
      callTypeRef.current       = null
      callObjectRef.current     = null
      pendingCandidatesRef.current = []
      throw error
    }
  }, [callWs, dispatch])

  /** Answerer declines an incoming call */
  const rejectCall = useCallback((callId: string) => {
    console.log('❌ Rejecting call:', callId)
    activeCallIdRef.current   = null
    callTypeRef.current       = null
    callObjectRef.current     = null
    pendingCandidatesRef.current = []
    callWs.rejectCall(callId)
    dispatch(setCurrentCall(null))
    setIncomingCall(null)
  }, [callWs, dispatch])

  /** Either side ends an active call */
  const hangUp = useCallback(async (callId: string) => {
    console.log('📴 Hanging up call:', callId)
    activeCallIdRef.current   = null
    callTypeRef.current       = null
    callObjectRef.current     = null
    pendingCandidatesRef.current = []
    webrtcRef.current.cleanup()
    callWs.endCall(callId)
    dispatch(setCurrentCall(null))
    setIncomingCall(null)
  }, [callWs, dispatch])

  // ============================================================
  return {
    currentCall,
    incomingCall,
    connectionState: webrtc.connectionState,
    localStream:     webrtc.localStream,
    remoteStream:    webrtc.remoteStream,
    isLocalVideoEnabled: webrtc.isLocalVideoEnabled,
    isLocalAudioEnabled: webrtc.isLocalAudioEnabled,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    toggleVideo:   webrtc.toggleVideo,
    toggleAudio:   webrtc.toggleAudio,
    switchCamera:  webrtc.switchCamera,
  }
}