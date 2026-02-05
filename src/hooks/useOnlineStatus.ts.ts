// hooks/useOnlineStatus.ts
import { useSelector } from 'react-redux'
import { selectOnlineUsers, selectCurrentConversation } from '@/src/store/slices/messageSlice'

export const useOnlineStatus = () => {
  const currentConversation = useSelector(selectCurrentConversation)
  const conversationId = currentConversation?.id || ''
  const onlineUsers = useSelector(selectOnlineUsers(conversationId))
  
  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId)
  }
  
  return {
    onlineUsers,
    isUserOnline,
    onlineCount: onlineUsers.length
  }
}