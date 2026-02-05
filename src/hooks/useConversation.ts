// hooks/useConversations.ts
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchConversations, 
  selectConversations,
  selectTotalUnreadCount,
  setCurrentConversation
} from '@/src/store/slices/messageSlice'
import type { Conversation } from '@/src/types/message'

export const useConversations = () => {
  const dispatch = useDispatch()
  const conversations = useSelector(selectConversations)
  const totalUnreadCount = useSelector(selectTotalUnreadCount)
  
  useEffect(() => {
    dispatch(fetchConversations() as any)
  }, [dispatch])
  
  const selectConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation))
  }
  
  return {
    conversations,
    totalUnreadCount,
    selectConversation
  }
}