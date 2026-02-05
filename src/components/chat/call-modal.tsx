"use client"

import { useEffect, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { 
  Maximize2, Mic, MicOff, Minimize2, Phone, PhoneOff, 
  Video, VideoOff, X, CameraOff, Camera 
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import type { Conversation } from "@/src/types/message"
import type { Call } from "@/src/types/message"
import { useAppSelector } from "@/src/store/hooks"
import { selectCurrentUser } from "@/src/store/slices/authSlice"

interface CallModalProps {
  conversation?: Conversation | null
  currentCall: Call | null
  incomingCall: Call | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isLocalVideoEnabled: boolean
  isLocalAudioEnabled: boolean
  connectionState: string
  onClose: () => void
  onAcceptCall: (callId: string, offerSdp: string, callType: 'audio' | 'video') => Promise<void>
  onRejectCall: (callId: string) => void
  onHangUp: (callId: string) => Promise<void>
  onToggleVideo: () => void
  onToggleAudio: () => void
  onSwitchCamera: () => void
}

export function CallModal({ 
  conversation,
  currentCall,
  incomingCall,
  localStream,
  remoteStream,
  isLocalVideoEnabled,
  isLocalAudioEnabled,
  connectionState,
  onClose,
  onAcceptCall,
  onRejectCall,
  onHangUp,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera,
}: CallModalProps) {
  const [callMinimized, setCallMinimized] = useState(false)
  const [callPosition, setCallPosition] = useState({ x: 20, y: 20 })
  const [isDraggingCall, setIsDraggingCall] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [callDuration, setCallDuration] = useState(0)

  const currentUser = useAppSelector(selectCurrentUser)
  const currentUserId = currentUser?.id
  
  // ─── Callback refs — these fire every time the DOM element mounts,
  //     regardless of whether the stream dep changed.  Solves the
  //     useRef+useEffect race where a remounted <video> never gets
  //     srcObject because the effect dep array didn't change.
  // ────────────────────────────────────────────────────────────────
  const localVideoCallbackRef = useCallback((el: HTMLVideoElement | null) => {
    if (el && localStream) {
      el.srcObject = localStream
    }
  }, [localStream])

  const remoteVideoCallbackRef = useCallback((el: HTMLVideoElement | null) => {
    if (el && remoteStream) {
      el.srcObject = remoteStream
    }
  }, [remoteStream])

  const remoteAudioCallbackRef = useCallback((el: HTMLAudioElement | null) => {
    if (el && remoteStream) {
      el.srcObject = remoteStream
      el.play().catch(() => {})
    }
  }, [remoteStream])

  // ─── Derived state ─────────────────────────────────────────────
  const activeCall = currentCall || incomingCall

  // isIncoming: we have an incomingCall and we are NOT the caller
  const isIncoming = !!incomingCall && incomingCall.caller?.id !== currentUserId

  // isOutgoing: we have a currentCall, WE are the caller, and it hasn't been answered yet
  const isOutgoing = !!currentCall && currentCall.caller?.id === currentUserId && currentCall.status === 'invited'

  // isActive: call has been answered or peer connection is up
  const isActive = currentCall?.status === 'answered' || connectionState === 'connected'

  const callType = activeCall?.call_type  // 'audio' | 'video'

  // ✅ Whether to render the VIDEO layout vs the AUDIO layout.
  //    Video layout shows as soon as callType is video — even while ringing —
  //    so the caller sees their own camera immediately and the receiver sees
  //    the "incoming video call" state instead of the generic audio avatar.
  const isVideoCall = callType === 'video'

  // ─── Display name / avatar ─────────────────────────────────────
  const displayName = (() => {
    if (!activeCall) return 'Unknown'
    if (isIncoming) return activeCall.caller?.username ?? 'Unknown'
    if (conversation?.type === 'direct' && conversation.other_user)
      return conversation.other_user.username
    return conversation?.name ?? activeCall.caller?.username ?? 'Unknown'
  })()

  const avatarSrc = (() => {
    if (isIncoming && activeCall?.caller?.profile?.avatar)
      return activeCall.caller.profile.avatar
    if (conversation?.type === 'direct' && conversation.other_user?.profile?.avatar)
      return conversation.other_user.profile.avatar
    return conversation?.icon_url ?? undefined
  })()

  // ─── Call-type label shown in header & waiting states ──────────
  const callTypeLabel = isVideoCall ? 'Video Call' : 'Voice Call'

  // ─── Hooks ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000)
      return () => clearInterval(interval)
    } else {
      setCallDuration(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isDraggingCall) return
    const onMove = (e: MouseEvent) =>
      setCallPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
    const onUp = () => setIsDraggingCall(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [isDraggingCall, dragOffset])

  // ─── Helpers ───────────────────────────────────────────────────

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const handleEndCall = async () => {
    if (activeCall) await onHangUp(activeCall.id)
    onClose()
  }

  const handleRejectCall = () => {
    if (activeCall) onRejectCall(activeCall.id)
    onClose()
  }

  const handleAcceptCall = async () => {
    if (!activeCall?.offer_sdp) { console.error('❌ Cannot accept: missing offer_sdp'); return }
    try { await onAcceptCall(activeCall.id, activeCall.offer_sdp, activeCall.call_type) }
    catch (e) { console.error('❌ Failed to accept call:', e) }
  }

  // ─── Early return ──────────────────────────────────────────────
  if (!activeCall) return null

  // ─── Status line (below the name in header) ───────────────────
  const statusLine = isIncoming  ? `Incoming ${callTypeLabel}...`
                   : isOutgoing  ? `${callTypeLabel} — Calling...`
                   : isActive    ? formatDuration(callDuration)
                   :               `${callTypeLabel} — Connecting...`

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div
      className={cn(
        "fixed z-50 shadow-2xl transition-all duration-300",
        callMinimized
          ? "w-48 h-32 rounded-xl cursor-move"
          : "inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:h-[700px] rounded-2xl"
      )}
      style={callMinimized ? { left: callPosition.x, top: callPosition.y } : undefined}
      onMouseDown={callMinimized ? (e) => { setIsDraggingCall(true); setDragOffset({ x: e.clientX - callPosition.x, y: e.clientY - callPosition.y }) } : undefined}
    >
      <div className={cn("h-full w-full bg-gray-900 text-white rounded-2xl overflow-hidden flex flex-col relative", callMinimized && "rounded-xl")}>

        {/* Hidden audio element — always present, plays remote audio for both call types */}
        <audio ref={remoteAudioCallbackRef} autoPlay playsInline className="hidden" />

        {/* ── Header (always visible) ──────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent">
          {callMinimized ? (
            <span className="text-sm font-medium truncate">{displayName}</span>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/90 font-medium">{displayName}</span>
                {/* ✅ Call-type badge */}
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  isVideoCall ? "bg-blue-500/30 text-blue-200" : "bg-green-500/30 text-green-200"
                )}>
                  {callTypeLabel}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">{statusLine}</p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setCallMinimized(!callMinimized)}>
              {callMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={handleEndCall}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Body (hidden when minimized) ─────────────────────────── */}
        {!callMinimized && (
          <>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                VIDEO LAYOUT — shown for ALL video-call states:
                  • caller waiting (local camera visible, "Calling…" overlay)
                  • receiver incoming (avatar overlay, accept/reject below)
                  • active (remote video full, local PiP)
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isVideoCall ? (
              <div className="flex-1 relative bg-black">

                {/* Remote video (full-bleed, only visible when connected) */}
                <video ref={remoteVideoCallbackRef} autoPlay playsInline className="w-full h-full object-cover" />

                {/* ── Overlay: shown while NOT yet connected ── */}
                {!isActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90">
                    <Avatar className="w-32 h-32 mb-4 ring-4 ring-white/20">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback className="text-4xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-semibold mb-1">{displayName}</h3>
                    <span className="text-sm text-blue-300 font-medium mb-2">📹 Video Call</span>
                    <p className="text-white/60">
                      {isIncoming  && 'Incoming video call...'}
                      {isOutgoing  && 'Calling…'}
                      {!isIncoming && !isOutgoing && 'Connecting…'}
                    </p>
                  </div>
                )}

                {/* ── Overlay: "waiting for video" when connected but no remote stream yet ── */}
                {isActive && !remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                    <Avatar className="w-32 h-32 mb-4">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback className="text-4xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-white/70">Waiting for video…</p>
                  </div>
                )}

                {/* Local camera PiP — visible as soon as we have a local stream */}
                {localStream && (
                  <div className="absolute top-20 right-4 w-40 h-52 rounded-lg overflow-hidden border-2 border-white/20 bg-gray-800 z-10">
                    {isLocalVideoEnabled ? (
                      <video ref={localVideoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <CameraOff className="w-12 h-12 text-white/50 mb-2" />
                        <span className="text-xs text-white/50">Camera off</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Switch-camera button */}
                {isLocalVideoEnabled && localStream && (
                  <Button variant="ghost" size="icon"
                    className="absolute top-20 left-4 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
                    onClick={onSwitchCamera}>
                    <Camera className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ) : (
              /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 AUDIO LAYOUT — green gradient, avatar, status text
                 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
              <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#075E54] to-[#128C7E]">
                <Avatar className="w-32 h-32 mb-6 ring-4 ring-white/20">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="text-4xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>

                <h3 className="text-2xl font-semibold mb-1">{displayName}</h3>

                {/* ✅ Voice Call label */}
                <span className="text-sm text-green-300 font-medium mb-2">🎤 Voice Call</span>

                <p className="text-white/80 mb-4">
                  {isIncoming  && 'Incoming voice call…'}
                  {isOutgoing  && 'Calling…'}
                  {isActive    && formatDuration(callDuration)}
                  {!isIncoming && !isOutgoing && !isActive && 'Connecting…'}
                </p>

                {/* Audio-level indicator when connected */}
                {isActive && remoteStream && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-white/90">
                      {!isLocalAudioEnabled && '(Muted) '}Connected
                    </span>
                  </div>
                )}

                {/* Connection-state badge (only while not yet active) */}
                {!isIncoming && !isActive && connectionState !== 'new' && (
                  <div className="px-4 py-2 bg-black/20 rounded-full">
                    <p className="text-sm text-white/90">
                      {connectionState === 'connecting'   && '🔄 Connecting…'}
                      {connectionState === 'disconnected' && '⚠️ Reconnecting…'}
                      {connectionState === 'failed'       && '❌ Connection failed'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Controls bar ─────────────────────────────────────── */}
            {isIncoming ? (
              /* Accept / Reject */
              <div className="flex items-center justify-center gap-8 p-6 bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                  <Button size="icon" className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg mb-2" onClick={handleRejectCall}>
                    <PhoneOff className="w-7 h-7" />
                  </Button>
                  <p className="text-xs text-white/70">Decline</p>
                </div>
                <div className="text-center">
                  <Button size="icon" className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg animate-pulse mb-2" onClick={handleAcceptCall}>
                    {isVideoCall ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                  </Button>
                  <p className="text-xs text-white/70">Accept</p>
                </div>
              </div>
            ) : (
              /* Mic / End / Camera */
              <div className="flex items-center justify-center gap-4 p-6 bg-black/40 backdrop-blur-sm">
                <div className="text-center">
                  <Button variant="ghost" size="icon"
                    className={cn("w-14 h-14 rounded-full transition-colors mb-1",
                      !isLocalAudioEnabled ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30")}
                    onClick={onToggleAudio}>
                    {isLocalAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </Button>
                  <p className="text-xs text-white/70">{isLocalAudioEnabled ? 'Mute' : 'Unmute'}</p>
                </div>

                <div className="text-center">
                  <Button size="icon" className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg mb-1" onClick={handleEndCall}>
                    <PhoneOff className="w-7 h-7" />
                  </Button>
                  <p className="text-xs text-white/70">End</p>
                </div>

                {isVideoCall && (
                  <div className="text-center">
                    <Button variant="ghost" size="icon"
                      className={cn("w-14 h-14 rounded-full transition-colors mb-1",
                        !isLocalVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30")}
                      onClick={onToggleVideo}>
                      {isLocalVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                    <p className="text-xs text-white/70">Camera</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Minimized view ─────────────────────────────────────── */}
        {callMinimized && (
          <div className="flex-1 flex items-center justify-center gap-3 px-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-xs">
              {isActive   && formatDuration(callDuration)}
              {isIncoming && `Incoming ${callTypeLabel}…`}
              {isOutgoing && `${callTypeLabel} — Calling…`}
            </div>
            <Button size="icon" className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600" onClick={handleEndCall}>
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}