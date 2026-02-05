// components/chat/conversation-item-ENHANCED.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import type { Conversation } from "@/src/types/message"
import { useSelector } from "react-redux"
import { selectTypingUsers } from "@/src/store/slices/messageSlice"
import { RootState } from "@/src/store/store"

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  // Get typing users for this conversation
  const typingUsers = useSelector((state: RootState) => 
    selectTypingUsers(conversation.id)(state)
  )
  const isTyping = typingUsers.length > 0
  
  // ENHANCED: Get typing user names
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
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border/50",
        isSelected && "bg-accent"
      )}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage 
          src={conversation.type === 'direct' && conversation.other_user
            ? conversation.other_user.profile?.avatar || undefined
            : conversation.icon_url || undefined
          } 
          alt={conversation.type === 'direct' && conversation.other_user
            ? conversation.other_user.username
            : conversation.name
          } 
        />
        <AvatarFallback>
          {conversation.type === 'direct' && conversation.other_user
            ? conversation.other_user.username[0].toUpperCase()
            : conversation.name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-base truncate">
            {conversation.type === 'direct' && conversation.other_user
              ? conversation.other_user.username
              : conversation.name}
          </span>
          <span className={cn(
            "text-xs shrink-0 ml-2",
            conversation.unread_count > 0 ? "text-[#25D366]" : "text-muted-foreground"
          )}>
            {conversation.last_message 
              ? new Date(conversation.last_message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : ""
            }
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isTyping ? (
            <>
              {/* ENHANCED: Animated typing dots */}
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              {/* ENHANCED: Show who's typing in groups */}
              <p className="text-sm text-[#25D366] truncate">
                {conversation.type === 'group' && typingText 
                  ? typingText 
                  : 'typing...'
                }
              </p>
            </>
          ) : (
            <p className={cn(
              "text-sm truncate",
              conversation.unread_count > 0 ? "font-medium" : "text-muted-foreground"
            )}>
              {conversation.last_message?.body || "No messages yet"}
            </p>
          )}
        </div>
      </div>
      {conversation.unread_count > 0 && (
        <Badge className="bg-[#25D366] text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-semibold shrink-0">
          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
        </Badge>
      )}
    </button>
  )
}