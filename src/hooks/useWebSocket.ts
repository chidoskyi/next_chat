// hooks/useWebSocket.ts - FIXED: Optimistic replacement + mark all read on join
import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getChatWebSocket, getCallWebSocket } from '@/src/services/wsApi'
import { 
  addMessage, 
  updateMessage, 
  deleteMessage,
  addReaction,
  removeReaction,
  setTypingUsers,
  updateUserStatus,
  updateUnreadCount,
  setOnlineUsers,
  setCurrentCall,
  selectCurrentConversation,
  markConversationRead,
  replaceOptimisticMessage,
  makeSelectMessages,
} from '@/src/store/slices/messageSlice'
import { selectCurrentUser } from '../store/slices/authSlice'
import { RootState } from '@/src/store/store'

// FIXED: Global connection tracking to prevent duplicates
let chatConnected = false;
let callConnected = false;

export const useWebSocket = (token: string | null) => {
  const dispatch = useDispatch()
  const chatWsRef = useRef(getChatWebSocket())
  const callWsRef = useRef(getCallWebSocket())
  const currentConversation = useSelector(selectCurrentConversation)
  const currentUser = useSelector(selectCurrentUser)
  const currentUserId = currentUser?.id
  const hasConnectedRef = useRef(false);
  
  // ── Ref that always holds the latest messages for the current conversation ──
  // The WebSocket listener reads this synchronously to find optimistic messages.
  // This replaces the broken (window as any).__REDUX_STORE__?.getState() pattern.
   const conversationIdForRef = currentConversation?.id || '';
  // const latestMessages = useAppSelector((state: RootState) =>
  //   conversationIdForRef ? (state.message?.messages?.[conversationIdForRef] ?? []) : []
  // );
  // const messagesRef = useRef(latestMessages);
  // useEffect(() => {
  //   messagesRef.current = latestMessages;
  // }, [latestMessages]);

    const selectMessagesForConversation = useMemo(() => makeSelectMessages(), []);
  const latestMessages = useSelector((state: RootState) => 
    selectMessagesForConversation(state, conversationIdForRef)
  );
  
  const messagesRef = useRef(latestMessages);
  
  useEffect(() => {
    messagesRef.current = latestMessages;
  }, [latestMessages]);

  // Ref tracking the currently open conversation ID.
  // The message listener reads this to know whether an incoming message
  // is for the conversation the user is actively looking at.
  const currentConversationIdRef = useRef(conversationIdForRef);
  useEffect(() => {
    currentConversationIdRef.current = conversationIdForRef;
  }, [conversationIdForRef]);
  
  // FIXED: Stable reference to current user ID to prevent dependency issues
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // ============ MAIN EFFECT: CONNECT + REGISTER LISTENERS ============
  useEffect(() => {
    if (!token || hasConnectedRef.current) {
      if (!token) {
        console.log('⚠️ [WebSocket] No token, skipping connection');
      } else {
        console.log('✅ [WebSocket] Already connected');
      }
      return;
    }
    
    const chatWs = chatWsRef.current
    const callWs = callWsRef.current
    
    console.log('🔌 [WebSocket] Connecting...')
    
    const connectPromises = [];
    
    if (!chatConnected && !chatWs.isConnected()) {
      connectPromises.push(
        chatWs.connect(token).then(() => {
          console.log('✅ [Chat] Connected');
          chatConnected = true;
        })
      );
    }
    
    if (!callConnected && !callWs.isConnected()) {
      connectPromises.push(
        callWs.connect(token).then(() => {
          console.log('✅ [Call] Connected');
          callConnected = true;
        })
      );
    }

    Promise.all(connectPromises)
      .then(() => {
        console.log('✅ [WebSocket] All connections established');
        hasConnectedRef.current = true;
      })
      .catch((error) => {
        console.error('❌ [WebSocket] Connection failed:', error);
        chatConnected = false;
        callConnected = false;
        hasConnectedRef.current = false;
      });

    // ============ CHAT MESSAGE EVENTS ============
    
    // ============================================================
    // CORE FIX: Handle incoming messages correctly for own messages
    // ============================================================
    // When a message comes back from the server after WE sent it,
    // we need to REPLACE the optimistic temp message instead of adding
    // a duplicate. We detect "own message" by comparing sender.id
    // to currentUserIdRef. If it's ours, we find the optimistic message
    // by matching on body + conversation, then replace it.
    // ============================================================
    const handleIncomingMessage = (data: any) => {
      const message = data as any;
      const conversationId = data.conversation_id;
      
      if (!conversationId) {
        console.error('❌ [Chat] No conversation_id in message data');
        return;
      }

      // Read current messages from the ref (always up-to-date, no store.getState() needed)
      const existingMessages = messagesRef.current;

      // 1. Exact ID match → already in store, skip entirely
      const exactMatch = existingMessages.some((m: any) => m.id === message.id);
      if (exactMatch) {
        console.log('⏭️ [Chat] Message already exists (exact ID match), skipping:', message.id);
        return;
      }

      // 2. This message is from US → it's the server echo of our optimistic message.
      //    Find the optimistic placeholder by matching body + conversation and replace it.
      if (message.sender?.id === currentUserIdRef.current) {
        const optimisticIndex = existingMessages.findIndex(
          (m: any) => m.id?.toString().startsWith('temp-') && m.body === message.body
        );

        if (optimisticIndex !== -1) {
          const tempId = existingMessages[optimisticIndex].id;
          console.log('🔄 [Chat] Replacing optimistic message:', tempId, '→', message.id);

          // ──────────────────────────────────────────────────────────────
          // STRIP status fields from the server object before replacing.
          // The serializer bakes in is_delivered/is_read based on DB state
          // at the moment it runs — which can already be "delivered" if
          // User B auto-acknowledged in the same millisecond window.
          // These fields must ONLY be flipped by the dedicated
          // delivery_receipt / read_receipt events so the sender sees:
          //   send → single check → (delivery_receipt) → double check
          // ──────────────────────────────────────────────────────────────
          const { is_delivered: _d, is_read: _r, status: _s, ...cleanMessage } = message;
          const sanitizedMessage = {
            ...cleanMessage,
            is_delivered: false,
            is_read: false,
            status: 'sent',
          };

          dispatch(replaceOptimisticMessage({
            conversationId,
            tempId,
            realMessage: sanitizedMessage,
          }));
          return;
        }

        // No optimistic match found (edge case). Fall through to normal add.
        console.log('⚠️ [Chat] Own message received but no optimistic placeholder found, adding normally:', message.id);
      }

      // 3. Normal case: message from someone else (or orphaned own message). Add it.
      console.log('✅ [Chat] Adding new message to store:', message.id);
      dispatch(addMessage({
        conversationId,
        message: message,
      }));
      
      // 4. Auto-send delivery receipt — only for messages from OTHER people
      if (message.sender?.id !== currentUserIdRef.current) {
        console.log('📬 [Chat] Auto-sending delivery receipt for message:', message.id);
        chatWsRef.current.markAsDelivered(conversationId, message.id);

        // ──────────────────────────────────────────────────────────────
        // Auto mark-as-read: if this message landed in the conversation
        // the user is currently looking at, tell the server immediately.
        // Without this, last_read_at stays at join-time and the next
        // refresh recomputes unread_count as non-zero for any message
        // that arrived after join.
        // ──────────────────────────────────────────────────────────────
        if (conversationId === currentConversationIdRef.current) {
          console.log('📖 [Chat] Auto mark-all-read (new message in active conversation)');
          chatWsRef.current.markAllMessagesRead(conversationId);
        }
      }
    };

    // Listen for both event types, both route to the same handler
    const unsubMessage = chatWs.on('message', handleIncomingMessage);
    const unsubChatMessage = chatWs.on('chat_message', handleIncomingMessage);
    
    const unsubMessageSent = chatWs.on('message_sent', (data) => {
      console.log('✅ [Chat] Message confirmed by server:', data.message_id)
      // Note: message_sent only contains message_id, not the full message.
      // The actual replacement happens in handleIncomingMessage above when
      // the chat_message broadcast echoes back to us.
    })
    
    const unsubMessageEdited = chatWs.on('message_edited', (data) => {
      console.log('✏️ [Chat] Message edited:', data)
      dispatch(updateMessage({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        updates: { body: data.body, is_edited: true }
      }))
    })
    
    const unsubMessageDeleted = chatWs.on('message_deleted', (data) => {
      console.log('🗑️ [Chat] Message deleted:', data)
      dispatch(deleteMessage({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        deleteForEveryone: data.delete_for_everyone
      }))
    })
    
    const unsubTyping = chatWs.on('typing', (data) => {
      console.log('⌨️ [Chat] Typing event:', data.username, data.is_typing)
      
      if (data.user_id === currentUserIdRef.current) {
        console.log('⏭️ [Chat] Skipping own typing indicator')
        return
      }
      
      dispatch(setTypingUsers({
        conversationId: data.conversation_id,
        userId: data.user_id,
        isTyping: data.is_typing
      }))
    })
    
    // ============ REACTION EVENTS ============
    const unsubReaction = chatWs.on('reaction', (data) => {
      console.log('❤️ [Chat] Reaction added:', data)
      dispatch(addReaction({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        reaction: {
          id: `${data.user_id}-${data.emoji}`,
          user: { id: data.user_id, username: data.username } as any,
          emoji: data.emoji,
          created_at: new Date().toISOString()
        }
      }))
    })
    
    const unsubReactionRemoved = chatWs.on('reaction_removed', (data) => {
      console.log('💔 [Chat] Reaction removed:', data)
      dispatch(removeReaction({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        userId: data.user_id
      }))
    })
    
    // ============ STATUS EVENTS ============
    const unsubUserStatus = chatWs.on('user_status', (data) => {
      console.log('👤 [Chat] User status changed:', data.username, data.status)
      if (data.conversation_id) {
        dispatch(updateUserStatus({
          conversationId: data.conversation_id,
          userId: data.user_id,
          status: data.status
        }))
      }
    })
    
    const unsubOnlineStatus = chatWs.on('online_status', (data) => {
      console.log('🟢 [Chat] Online status update:', data.online_users.length, 'users')
      dispatch(setOnlineUsers({
        conversationId: data.conversation_id,
        userIds: data.online_users.map(u => u.user_id)
      }))
    })
    
    // ============ READ RECEIPTS ============
    const unsubReadReceipt = chatWs.on('read_receipt', (data) => {
      console.log('👀 [Chat] Read receipt:', data.username, 'read', data.message_id)
      dispatch(updateMessage({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        updates: { is_read: true, status: 'read' }
      }))
    })
    
    // ============ DELIVERY RECEIPTS ============
    const unsubDeliveryReceipt = chatWs.on('delivery_receipt', (data) => {
      console.log('✅ [Chat] Delivery receipt:', data.user_id, 'received', data.message_id)
      dispatch(updateMessage({
        conversationId: data.conversation_id,
        messageId: data.message_id,
        updates: { 
          is_delivered: true,
          status: 'delivered'
        }
      }))
    })
    
    const unsubAllReadReceipt = chatWs.on('all_read_receipt', (data) => {
      console.log('✅ All read receipt:', data)
      
      // ✅ ONLY dispatch if it's from someone else
      if (data.user_id !== currentUserId) {
        console.log('📖 Someone else read our messages, updating to blue checks')
        dispatch(markConversationRead(data.conversation_id))
      } else {
        console.log('📖 Our own read receipt, just clearing badge')
        // Only clear the unread count, don't touch messages
        dispatch(updateUnreadCount({
          conversationId: data.conversation_id,
          count: 0
        }))
      }
    })
    
    const unsubUnreadCount = chatWs.on('unread_count_update', (data) => {
      console.log('🔔 [Chat] Unread count update:', data.conversation_id, '=', data.count)
      dispatch(updateUnreadCount({
        conversationId: data.conversation_id,
        count: data.count
      }))
    })
    
    // ============ CALL EVENTS ============
    const unsubIncomingCall = callWs.on('call_initiated', (data) => {
      console.log('📞 [Call] Incoming call from:', data.caller_username)
      dispatch(setCurrentCall({
        id: data.call_id,
        conversation: data.conversation_id,
        caller: { 
          id: data.caller_id, 
          username: data.caller_username,
          email: '',
          is_active: true,
          date_joined: new Date().toISOString()
        } as any,
        call_type: data.call_type,
        status: 'ringing',
        offer_sdp: data.offer_sdp,
        answer_sdp: null,
        participants: [],
        duration: null,
        duration_display: '00:00',
        initiated_at: new Date().toISOString(),
        answered_at: null,
        ended_at: null,
      }))
    })
    
    const unsubCallAnswered = callWs.on('call_answered', (data) => {
      console.log('✅ [Call] Call answered by:', data.username)
      dispatch(setCurrentCall({
        id: data.call_id,
        status: 'answered',
        answer_sdp: data.answer_sdp,
        answered_at: new Date().toISOString(),
      } as any))
    })
    
    const unsubCallRejected = callWs.on('call_rejected', (data) => {
      console.log('❌ [Call] Call rejected by:', data.username)
      dispatch(setCurrentCall(null))
    })
    
    const unsubCallEnded = callWs.on('call_ended', (data) => {
      console.log('📴 [Call] Call ended, duration:', data.duration)
      dispatch(setCurrentCall(null))
    })
    
    const unsubCallSignal = callWs.on('call_signal', (data) => {
      console.log('📡 [Call] Signal received from:', data.from_user_id)
    })
    
    const unsubIceCandidate = callWs.on('ice_candidate', (data) => {
      console.log('🧊 [Call] ICE candidate from:', data.from_user_id)
    })
    
    // ============ CLEANUP ============
    return () => {
      console.log('🧹 [WebSocket] Cleaning up listeners (keeping connection alive)...')
      
      unsubMessage()
      unsubChatMessage()
      unsubMessageSent()
      unsubMessageEdited()
      unsubMessageDeleted()
      unsubTyping()
      unsubReaction()
      unsubReactionRemoved()
      unsubUserStatus()
      unsubOnlineStatus()
      unsubReadReceipt()
      unsubDeliveryReceipt()
      unsubAllReadReceipt()
      unsubUnreadCount()
      unsubIncomingCall()
      unsubCallAnswered()
      unsubCallRejected()
      unsubCallEnded()
      unsubCallSignal()
      unsubIceCandidate()
      
      hasConnectedRef.current = false;
    }
  }, [token, dispatch])

  // ============ AUTO-JOIN CONVERSATION ============
  // FIXED: Also fires markAllMessagesRead so opening a chat marks everything as read
  useEffect(() => {
    const conversationId = currentConversation?.id;
    
    if (!conversationId || !hasConnectedRef.current) {
      return;
    }

    console.log('📥 [Chat] Joining conversation:', conversationId)
    const chatWs = chatWsRef.current;
    
    chatWs.joinConversation(conversationId)
    chatWs.getOnlineStatus(conversationId)
    chatWs.markAllMessagesRead(conversationId)  // ← FIX: mark all as read on open
    
    return () => {
      console.log('📤 [Chat] Leaving conversation:', conversationId)
      chatWs.leaveConversation(conversationId)
    }
  }, [currentConversation?.id])
  
  return {
    chat: chatWsRef.current,
    call: callWsRef.current
  }
}

// Export a reset function for logout
export const resetWebSocketState = () => {
  console.log('🔄 [WebSocket] Resetting connection state');
  chatConnected = false;
  callConnected = false;
  
  const chatWs = getChatWebSocket();
  const callWs = getCallWebSocket();
  
  if (chatWs.isConnected()) {
    chatWs.disconnect();
  }
  
  if (callWs.isConnected()) {
    callWs.disconnect();
  }
}