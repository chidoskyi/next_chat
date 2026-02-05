import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { 
  Check, 
  CheckCheck, 
  Copy, 
  MoreVertical, 
  Pause, 
  Play, 
  Reply, 
  Smile, 
  Trash2,
  Clock
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import type { Message } from "@/src/types/message"
import { useState, useEffect } from "react"
import { useAppSelector } from "@/src/store/hooks"
import { RootState } from "@/src/store/store"

interface MessageBubbleProps {
  message: Message
  currentUserId?: string
  playingVoiceId: string | null
  emojiReactions: string[]
  audioProgress?: number // 🔥 NEW: 0-100
  audioCurrentTime?: number // 🔥 NEW: current seconds
  onReactionAdd: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
  onCopy: (content: string) => void
  onDelete: (id: string) => void
  onTogglePlayVoice: (messageId: string) => void
}

export function MessageBubble({
  message,
  currentUserId,
  playingVoiceId,
  emojiReactions,
  audioProgress = 0,
  audioCurrentTime = 0,
  onReactionAdd,
  onReply,
  onCopy,
  onDelete,
  onTogglePlayVoice,
}: MessageBubbleProps) {
  const isOwn = currentUserId
    ? message.sender.id === currentUserId
    : message.id?.toString().startsWith('temp-');

  const [imageLoaded, setImageLoaded] = useState(false)

    const uploadProgress = useAppSelector((state: RootState) => 
    state.message.uploadProgress[message.id] || 0
  );

    // 🔥 Calculate display time (current time or total duration)
  const isPlaying = playingVoiceId === message.id;
  const displayTime = isPlaying && audioCurrentTime > 0
    ? audioCurrentTime
    : (message.media_duration || 15);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Debug log for media messages
  useEffect(() => {
    if (message.message_type !== 'text') {
      console.log('📸 Media message rendering:', {
        id: message.id,
        type: message.message_type,
        media_url: message.media_url,
        status: message.status,
        body: message.body
      })
    }
  }, [message])
  
  return (
    <div className={cn("flex gap-2 group mb-1", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[70%] shadow-sm relative",
          isOwn ? "bg-[#DCF8C6]" : "bg-white"
        )}
      >
        {!isOwn && (
          <span className="text-xs font-semibold text-[#25D366] block mb-1">
            {message.sender.username}
          </span>
        )}
        
        {/* Reply Preview */}
        {message.reply_to_message && (
          <div className="border-l-4 border-[#25D366] bg-black/5 pl-2 py-1 mb-2 rounded-r">
            <div className="text-xs font-semibold text-[#25D366]">
              {message.reply_to_message.sender.username}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {message.reply_to_message.body || `[${message.reply_to_message.message_type?.toUpperCase()}]`}
            </div>
          </div>
        )}

        {/* IMAGE Messages */}
        {message.message_type === "image" && message.media_url && (
          <div className="mb-2 rounded-lg overflow-hidden relative group/media">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  {message.status === 'sending' ? 'Uploading...' : 'Loading...'}
                </span>
              </div>
            )}
            <img 
              src={message.media_url} 
              alt="Shared image" 
              className={cn(
                "max-w-full rounded-lg transition-opacity max-h-96 object-contain",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('❌ Failed to load image:', message.media_url)
                setImageLoaded(true)
              }}
            />
            
            {/* Upload progress overlay */}
            {message.status === 'sending' && uploadProgress > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="relative w-20 h-20">
                  {/* Background circle */}
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="4"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  {/* Progress percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-bold drop-shadow-lg">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reaction button for images */}
            {message.status !== 'sending' && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="rounded-full h-8 w-8 p-0">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="flex gap-1 p-2">
                      {emojiReactions.map((emoji) => (
                        <button
                          key={emoji}
                          className={cn(
                            "text-xl hover:scale-125 transition-transform p-1 rounded",
                            message.reactions.some(r => r.emoji === emoji && r.user.id === currentUserId) && "bg-accent"
                          )}
                          onClick={() => onReactionAdd(message.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}
        
        {/* VIDEO with Progress */}
        {message.message_type === "video" && message.media_url && (
          <div className="mb-2 rounded-lg overflow-hidden relative">
            {message.status === 'sending' ? (
              <div className="bg-gray-200 rounded-lg p-12 flex items-center justify-center min-h-[200px]">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#25D366"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">{uploadProgress}%</span>
                    <span className="text-xs text-gray-500 mt-1">Uploading</span>
                  </div>
                </div>
              </div>
            ) : (
              <video src={message.media_url} controls className="max-w-full rounded-lg max-h-96" />
            )}
          </div>
        )}
        
        {/* AUDIO Messages (Voice Notes) */}
        {message.message_type === "audio" && message.media_url && (
          <div className="flex items-center gap-2 bg-black/5 rounded-full px-3 py-2 mb-2 min-w-[180px]">
            {message.status === 'sending' ? (
              <>
                <div className="relative w-8 h-8 shrink-0">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="2" fill="none" />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="#25D366"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 flex-1">Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shrink-0"
                  onClick={() => onTogglePlayVoice(message.id)}
                >
                  {playingVoiceId === message.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                {/* <div className="flex-1 min-w-0">
                  <div className="h-1 bg-[#25D366]/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-[#25D366] rounded-full transition-all duration-300",
                        playingVoiceId === message.id ? "animate-pulse" : ""
                      )}
                      style={{ width: playingVoiceId === message.id ? "60%" : "0%" }}
                    />
                  </div>
                </div> */}
                {/* 🔥 REAL Progress Bar */}
                <div className="flex-1 min-w-0">
                  <div className="h-1 bg-[#25D366]/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#25D366] rounded-full transition-all duration-150"
                      style={{ width: `${isPlaying ? audioProgress : 0}%` }} // 🔥 REAL PROGRESS
                    />
                  </div>
                </div>
                
                {/* 🔥 REAL Time Display */}
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTime(displayTime)}
                </span>

                 {/* Duration display */}
                {/* <span className="text-xs text-muted-foreground shrink-0">
                  {message.media_duration 
                    ? `${Math.floor(message.media_duration / 60)}:${(message.media_duration % 60).toString().padStart(2, "0")}`
                    : "0:15"
                  }
                </span> */}
              </>
            )}
          </div>
        )}

        {/* DOCUMENT Messages */}
        {message.message_type === "document" && message.media_url && (
          <div className="mb-2">
            <a 
              href={message.media_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2 hover:bg-black/10 transition-colors"
            >
              <div className="w-10 h-10 bg-[#25D366] rounded flex items-center justify-center text-white">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {message.body || "Document"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {message.media_size ? `${(message.media_size / 1024 / 1024).toFixed(2)} MB` : 'File'}
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Text Content / Caption */}
        {message.body?.trim() && message.message_type !== "audio" && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.body}
            {message.is_edited && (
              <span className="text-xs text-muted-foreground ml-2">(edited)</span>
            )}
          </p>
        )}

        {/* Fallback for missing media */}
        {!message.media_url && message.message_type !== 'text' && message.status !== 'sending' && (
          <div className="text-xs text-red-500 italic py-2">
            Media unavailable
          </div>
        )}

        {/* Reactions Display */}
        {message.reactions.length > 0 && (
          <div className="absolute -bottom-2 right-2 flex gap-1">
            {[...new Set(message.reactions.map(r => r.emoji))].map(emoji => {
              const count = message.reactions.filter(r => r.emoji === emoji).length
              return (
                <span 
                  key={emoji}
                  className="text-xs bg-white shadow-sm rounded-full px-1.5 py-0.5 border cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onReactionAdd(message.id, emoji)}
                >
                  {emoji} {count > 1 && count}
                </span>
              )
            })}
          </div>
        )}

        {/* Message Status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
          {isOwn && (
            <>
              {message.status === 'sending' ? (
                <Clock className="w-3 h-3 text-gray-400 animate-pulse" />
              ) : message.is_read || message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : message.is_delivered || message.status === 'delivered' ? (
                <CheckCheck className="w-3 h-3 text-gray-400" />
              ) : message.status === 'sent' ? (
                <Check className="w-3 h-3 text-gray-400" />
              ) : (
                <Clock className="w-3 h-3 text-gray-400" />
              )}
            </>
          )}
        </div>

        {/* Message tail */}
        <div
          className={cn(
            "absolute top-0 w-3 h-3",
            isOwn ? "-right-1 bg-[#DCF8C6]" : "-left-1 bg-white"
          )}
          style={{
            clipPath: isOwn 
              ? "polygon(0 0, 100% 0, 0 100%)" 
              : "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />
      </div>

      {/* Message Actions */}
      <div className={cn(
        "flex flex-col gap-1 opacity-0 group-hover:opacity-100 self-center transition-opacity",
        isOwn && "order-first"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Smile className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex gap-1 p-2">
              {emojiReactions.map((emoji) => (
                <button
                  key={emoji}
                  className={cn(
                    "text-xl hover:scale-125 transition-transform p-1 rounded",
                    message.reactions.some(r => r.emoji === emoji && r.user.id === currentUserId) && "bg-accent"
                  )}
                  onClick={() => onReactionAdd(message.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={() => onReply(message)}
        >
          <Reply className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onCopy(message.body)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </DropdownMenuItem>
            {isOwn && (
              <DropdownMenuItem 
                onClick={() => onDelete(message.id)} 
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}