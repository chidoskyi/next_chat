// components/chat/chat-header-ENHANCED.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react"
import type { Conversation } from "@/src/types/message"
import { useSelector } from "react-redux"
import { selectTypingUsers, selectOnlineUsers } from "@/src/store/slices/messageSlice"
import { RootState } from "@/src/store/store"

interface ChatHeaderProps {
  conversation: Conversation
  onBack: () => void
  onVideoCall: () => void
  onVoiceCall: () => void
  onProfileClick: () => void
  showBackButton?: boolean
}

export function ChatHeader({
  conversation,
  onBack,
  onVideoCall,
  onVoiceCall,
  onProfileClick,
  showBackButton = false,
}: ChatHeaderProps) {
  const typingUsers = useSelector((state: RootState) => 
    selectTypingUsers(conversation.id)(state)
  )
  const onlineUsers = useSelector((state: RootState) => 
    selectOnlineUsers(conversation.id)(state)
  )
  
  const isTyping = typingUsers.length > 0
  const isOnline = conversation.type === 'direct' && conversation.other_user
    ? onlineUsers.includes(conversation.other_user.id)
    : false
  
  const displayName = conversation.type === 'direct' && conversation.other_user
    ? conversation.other_user.username
    : conversation.name
  
  // ENHANCED: Get typing user names for groups
  const typingUserNames = typingUsers
    .map(userId => 
      conversation.members?.find(m => m.user.id === userId)?.user.username
    )
    .filter(Boolean)
  
  // ENHANCED: Format typing text
  const getTypingText = () => {
    if (typingUserNames.length === 0) return null
    if (typingUserNames.length === 1) return `${typingUserNames[0]} is typing...`
    if (typingUserNames.length === 2) return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
    return `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`
  }
  
  const typingText = getTypingText()
  
  // ENHANCED: Get subtitle text
  const getSubtitle = () => {
    if (isTyping) {
      return typingText || 'typing...'
    }
    
    if (conversation.type === 'group') {
      const memberCount = conversation.members?.length || 0
      const onlineCount = onlineUsers.length
      
      if (onlineCount > 0) {
        return `${memberCount} members, ${onlineCount} online`
      }
      return `${memberCount} members`
    }
    
    // Direct chat
    if (isOnline) {
      return 'online'
    }
    
    // Show last seen if available
    if (conversation.other_user?.last_seen) {
      const lastSeen = new Date(conversation.other_user.last_seen)
      const now = new Date()
      const diffMs = now.getTime() - lastSeen.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'last seen just now'
      if (diffMins < 60) return `last seen ${diffMins}m ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `last seen ${diffHours}h ago`
      
      return 'last seen recently'
    }
    
    return 'tap for info'
  }
  
  const subtitle = getSubtitle()
  
  return (
    <header className="h-16 bg-[#075E54] text-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <button className="flex items-center gap-3" onClick={onProfileClick}>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={conversation.type === 'direct' && conversation.other_user
                  ? conversation.other_user.profile?.avatar || undefined
                  : conversation.icon_url || undefined
                } 
                alt={displayName} 
              />
              <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* ENHANCED: Only show green dot for online direct chats */}
            {conversation.type === 'direct' && isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#075E54]" />
            )}
          </div>
          <div className="text-left max-w-[200px]">
            <h3 className="font-semibold truncate">{displayName}</h3>
            <div className="flex items-center gap-1.5">
              {/* ENHANCED: Animated dots for typing */}
              {isTyping && (
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <p className={cn(
                "text-xs truncate",
                isTyping ? "text-green-300" : "text-white/70"
              )}>
                {subtitle}
              </p>
            </div>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10" 
          onClick={onVideoCall}
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10" 
          onClick={onVoiceCall}
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

// ADDED: Missing import for cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}