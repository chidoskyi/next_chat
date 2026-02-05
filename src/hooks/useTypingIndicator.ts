// hooks/useTypingIndicator.ts - FIXED VERSION
import { useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectTypingUsers, selectCurrentConversation } from '@/src/store/slices/messageSlice'
import { RootState } from '../store/store'

export const useTypingIndicator = (onTyping: (isTyping: boolean) => void) => {
  const currentConversation = useSelector(selectCurrentConversation)
  const conversationId = currentConversation?.id || ''
  const typingUsers = useSelector((state: RootState) => selectTypingUsers(conversationId)(state))
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const isTypingRef = useRef(false)
  
  const onTypingRef = useRef(onTyping)
  useEffect(() => {
    onTypingRef.current = onTyping
  }, [onTyping])

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      console.log('⌨️ [Typing] User started typing')
      onTypingRef.current(true)
      isTypingRef.current = true
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log('⌨️ [Typing] User stopped typing (3s timeout)')
      onTypingRef.current(false)
      isTypingRef.current = false
    }, 3000)
  }, [])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (isTypingRef.current) {
      console.log('⌨️ [Typing] User stopped typing (manual)')
      onTypingRef.current(false)
      isTypingRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      console.log('🧹 [Typing] Cleaning up typing indicator')
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current) {
        onTypingRef.current(false)
        isTypingRef.current = false
      }
    }
  }, [conversationId])

  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return null
    
    // FIX: Add null check for members array
    if (!currentConversation?.members) return null
    
    const userNames = typingUsers
      .map((id: string) => 
        currentConversation.members.find(m => m.user.id === id)?.user.username || 'Someone'
      )
      .filter(Boolean)
    
    if (userNames.length === 0) return null
    
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`
    } else {
      return `${userNames[0]} and ${userNames.length - 1} others are typing...`
    }
  }, [typingUsers, currentConversation?.members])

  return {
    typingUsers,
    handleTyping,
    stopTyping,
    isTyping: typingUsers.length > 0,
    // FIX: Add null check here too
    typingUserNames: currentConversation?.members 
      ? typingUsers.map((id: string) => 
          currentConversation.members.find(m => m.user.id === id)?.user.username || 'Someone'
        )
      : [],
    typingText: getTypingText(),
  }
}