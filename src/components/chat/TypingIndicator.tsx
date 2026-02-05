// components/chat/TypingIndicator.tsx
interface TypingIndicatorProps {
  typingUsers: string[]
  conversationMembers: Array<{ user: { id: string; username: string } }>
  conversationType: 'direct' | 'group'
  variant?: 'sidebar' | 'header'
}

export const TypingIndicator = ({ 
  typingUsers, 
  conversationMembers,
  conversationType,
  variant = 'sidebar'
}: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null
  
  const userNames = typingUsers
    .map(id => conversationMembers.find(m => m.user.id === id)?.user.username)
    .filter(Boolean)
  
  const text = conversationType === 'group' && userNames.length > 0
    ? formatGroupTyping(userNames)
    : 'typing...'
  
  const dotSize = variant === 'header' ? 'w-1 h-1' : 'w-1.5 h-1.5'
  const textSize = variant === 'header' ? 'text-xs' : 'text-sm'
  
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        <span className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <span className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <span className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
      <span className={textSize}>{text}</span>
    </div>
  )
}

function formatGroupTyping(names: string[]) {
  if (names.length === 1) return `${names[0]} is typing...`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
  return `${names[0]} and ${names.length - 1} others are typing...`
}

// {isTyping && (
//   <TypingIndicator 
//     typingUsers={typingUsers}
//     conversationMembers={conversation.members}
//     conversationType={conversation.type}
//     variant="sidebar"
//   />
// )}