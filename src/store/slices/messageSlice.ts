// store/slices/messageSlice.ts
import {
    MessageType,
    ConversationType,
    CallType,
    Message,
    Conversation,
    Call,
    GroupInviteLink,
    BlockedUser,
    StarredMessage,
    StarMessageResponse,
    CreateInviteLinkRequest,
    JoinGroupResponse,
    ForwardMessageResponse,
    SearchMessagesResponse,
    StarredMessagesResponse,
} from "@/src/types/message";
import { User } from "@/src/types/users";
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/src/store/store";
import messageAPI from "@/src/services/messageService";
import Cookies from "js-cookie";

// ============ TYPES ============

interface MessageState {
    currentUser: User | null;
    // Conversations
    conversations: Conversation[];
    currentConversation: Conversation | null;
    conversationLoading: boolean;
    conversationError: string | null;
    uploadProgress: Record<string, number> 
    
    // Messages
    messages: Record<string, Message[]>; // { conversationId: Message[] }
    messageLoading: boolean;
    messageError: string | null;
    hasMoreMessages: Record<string, boolean>; // { conversationId: boolean }
    
    // Typing indicators
    typingUsers: Record<string, string[]>; // { conversationId: [userId, userId] }
    
    // Online status
    onlineUsers: Record<string, string[]>; // { conversationId: [userId, userId] }
    
    // Unread counts
    unreadCounts: Record<string, number>; // { conversationId: number }
    totalUnreadCount: number;
    
    // Calls
    calls: Call[];
    currentCall: Call | null;
    callLoading: boolean;
    callError: string | null;
    
    // Starred messages
    starredMessages: StarredMessage[];
    starredLoading: boolean;
    
    // Blocked users
    blockedUsers: BlockedUser[];
    blockedLoading: boolean;
    
    // Search
    searchResults: Message[];
    searchLoading: boolean;
    searchQuery: string;
    
    // UI state
    selectedMessages: string[]; // For multi-select operations
    replyingTo: Message | null;
    forwardingMessage: Message | null;
}

const initialState: MessageState = {
    currentUser: null,
    conversations: [],
    currentConversation: null,
    conversationLoading: false,
    conversationError: null,
    uploadProgress: {},
    
    messages: {},
    messageLoading: false,
    messageError: null,
    hasMoreMessages: {},
    
    typingUsers: {},
    onlineUsers: {},
    
    unreadCounts: {},
    totalUnreadCount: 0,
    
    calls: [],
    currentCall: null,
    callLoading: false,
    callError: null,
    
    starredMessages: [],
    starredLoading: false,
    
    blockedUsers: [],
    blockedLoading: false,
    
    searchResults: [],
    searchLoading: false,
    searchQuery: "",
    
    selectedMessages: [],
    replyingTo: null,
    forwardingMessage: null,
};

// ============ ASYNC THUNKS ============

// Conversations
export const fetchConversations = createAsyncThunk(
    "message/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getConversations();
            
            console.log(response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations");
        }
    }
);

export const createConversation = createAsyncThunk(
    "message/createConversation",
    async (
        { participantIds, type = "direct" }: { participantIds: string[]; type?: ConversationType },
        { rejectWithValue }
    ) => {
        try {
            const response = await messageAPI.createConversation(participantIds, type);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create conversation");
        }
    }
);

export const fetchConversationDetail = createAsyncThunk(
    "message/fetchConversationDetail",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getConversationDetail(conversationId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch conversation");
        }
    }
);

// Messages
export const fetchMessages = createAsyncThunk(
    "message/fetchMessages",
    async (
        { conversationId, page = 1 }: { conversationId: string; page?: number },
        { rejectWithValue }
    ) => {
        try {
            const response = await messageAPI.getMessages(conversationId, { page });
            return {
                conversationId,
                messages: response.data.results,
                hasMore: !!response.data.next,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
        }
    }
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async (
    {
      conversationId,
      body,
      messageType = "text",
      media,
      replyTo,
      tempId, // ✅ ADD: Pass tempId to track progress
      onProgress, // ✅ ADD: Progress callback
    }: {
      conversationId: string;
      body: string;
      messageType?: MessageType;
      media?: File;
      replyTo?: string;
      tempId?: string;
      onProgress?: (progress: number) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageAPI.sendMessage(
        conversationId,
        {
          message_type: messageType,
          body,
          media,
          reply_to: replyTo,
        },
        // ✅ ADD: Progress handler
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            console.log(`📊 Upload progress: ${progress}%`);
            if (onProgress) {
              onProgress(progress);
            }
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

export const markAsRead = createAsyncThunk(
    "message/markAsRead",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            await messageAPI.markAsRead(conversationId);
            return conversationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
        }
    }
);

// Message actions
export const reactToMessage = createAsyncThunk(
    "message/reactToMessage",
    async ({ messageId, emoji }: { messageId: string; emoji: string }, { rejectWithValue }) => {
        try {
            const response = await messageAPI.reactToMessage(messageId, emoji);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to react to message");
        }
    }
);

export const starMessage = createAsyncThunk(
    "message/starMessage",
    async (messageId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.starMessage(messageId);
            return { messageId, ...response };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to star message");
        }
    }
);

export const forwardMessage = createAsyncThunk(
    "message/forwardMessage",
    async (
        { messageId, conversationIds }: { messageId: string; conversationIds: string[] },
        { rejectWithValue }
    ) => {
        try {
            const response = await messageAPI.forwardMessage(messageId, conversationIds);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to forward message");
        }
    }
);

export const searchMessages = createAsyncThunk(
    "message/searchMessages",
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.searchMessages(query);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to search messages");
        }
    }
);

export const fetchStarredMessages = createAsyncThunk(
    "message/fetchStarredMessages",
    async (page: number = 1, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getStarredMessages({ page });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch starred messages");
        }
    }
);

// Group management
export const createInviteLink = createAsyncThunk(
    "message/createInviteLink",
    async (
        { conversationId, data }: { conversationId: string; data?: CreateInviteLinkRequest },
        { rejectWithValue }
    ) => {
        try {
            const response = await messageAPI.createInviteLink(conversationId, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create invite link");
        }
    }
);

export const joinByInviteCode = createAsyncThunk(
    "message/joinByInviteCode",
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.joinByInviteCode(code);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to join group");
        }
    }
);

export const addMember = createAsyncThunk(
    "message/addMember",
    async (
        { conversationId, userId }: { conversationId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            await messageAPI.addMember(conversationId, userId);
            return { conversationId, userId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add member");
        }
    }
);

export const removeMember = createAsyncThunk(
    "message/removeMember",
    async (
        { conversationId, userId }: { conversationId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            await messageAPI.removeMember(conversationId, userId);
            return { conversationId, userId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove member");
        }
    }
);

export const promoteMember = createAsyncThunk(
    "message/promoteMember",
    async (
        { conversationId, userId }: { conversationId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            await messageAPI.promoteMember(conversationId, userId);
            return { conversationId, userId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to promote member");
        }
    }
);

export const demoteMember = createAsyncThunk(
    "message/demoteMember",
    async (
        { conversationId, userId }: { conversationId: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            await messageAPI.demoteMember(conversationId, userId);
            return { conversationId, userId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to demote member");
        }
    }
);

// Conversation actions
export const pinConversation = createAsyncThunk(
    "message/pinConversation",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.pinConversation(conversationId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to pin conversation");
        }
    }
);

export const archiveConversation = createAsyncThunk(
    "message/archiveConversation",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.archiveConversation(conversationId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to archive conversation");
        }
    }
);

export const muteConversation = createAsyncThunk(
    "message/muteConversation",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.muteConversation(conversationId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to mute conversation");
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    "message/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getUnreadCount();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
        }
    }
);

// Calls
export const initiateCall = createAsyncThunk(
    "message/initiateCall",
    async (
        { conversationId, callType }: { conversationId: string; callType: CallType },
        { rejectWithValue }
    ) => {
        try {
            const response = await messageAPI.initiateCall(conversationId, callType);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to initiate call");
        }
    }
);

export const answerCall = createAsyncThunk(
    "message/answerCall",
    async ({ callId, sdpOffer }: { callId: string; sdpOffer?: string }, { rejectWithValue }) => {
        try {
            const response = await messageAPI.answerCall(callId, sdpOffer);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to answer call");
        }
    }
);

export const endCall = createAsyncThunk(
    "message/endCall",
    async (callId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.endCall(callId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to end call");
        }
    }
);

export const fetchCallHistory = createAsyncThunk(
    "message/fetchCallHistory",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getCallHistory(conversationId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch call history");
        }
    }
);

export const fetchMyCalls = createAsyncThunk(
    "message/fetchMyCalls",
    async (_, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getMyCalls();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch calls");
        }
    }
);

// Blocking
export const blockUser = createAsyncThunk(
    "message/blockUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await messageAPI.blockUser(userId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to block user");
        }
    }
);

export const unblockUser = createAsyncThunk(
    "message/unblockUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            await messageAPI.unblockUser(userId);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to unblock user");
        }
    }
);

export const fetchBlockedUsers = createAsyncThunk(
    "message/fetchBlockedUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getBlockedUsers();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch blocked users");
        }
    }
);

// ============ SLICE ============

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {

        setCurrentUser: (state, action: PayloadAction<User | null>) => {
            state.currentUser = action.payload
        },

        // WebSocket message handlers
        addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
        const { conversationId, message } = action.payload;
        
        console.log('🔄 Redux addMessage:', {
            conversationId,
            messageId: message.id,
            type: message.message_type,
            hasMediaUrl: !!message.media_url,
            status: message.status
        })
        
        if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
        }
        
        // ✅ IMPROVED: Better optimistic message matching
        const now = new Date(message.created_at).getTime()
        
        const tempIndex = state.messages[conversationId].findIndex(m => {
            if (!m.id?.startsWith('temp-')) return false
            
            const tempTime = new Date(m.created_at).getTime()
            const timeDiff = Math.abs(now - tempTime)
            
            const isSameSender = m.sender?.id === message.sender?.id
            const isSameType = m.message_type === message.message_type
            const isRecentEnough = timeDiff < 30000 // Within 30 seconds
            
            // For media: also match file size
            const isSameMedia = message.message_type !== 'text' 
            ? m.media_size === message.media_size
            : m.body === message.body
            
            const isMatch = isSameSender && isSameType && isRecentEnough && isSameMedia
            
            if (isMatch) {
            console.log('🔄 Found optimistic message to replace:', m.id)
            }
            
            return isMatch
        })
        
        if (tempIndex !== -1) {
            console.log('🔄 Removing optimistic message')
            // ✅ Cleanup blob URL to prevent memory leak
            const tempMsg = state.messages[conversationId][tempIndex]
            if (tempMsg.media_url?.startsWith('blob:')) {
            URL.revokeObjectURL(tempMsg.media_url)
            }
            state.messages[conversationId].splice(tempIndex, 1)
        }
        
        // Check if exists
        const exists = state.messages[conversationId].some(m => m.id === message.id);
        if (exists) {
            console.log('⚠️ Message already exists, skipping')
            return
        }
        
        console.log('✅ Adding message to Redux')
        state.messages[conversationId].push(message);
        
        console.log(`✅ Total messages: ${state.messages[conversationId].length}`)
        
        // Update conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.last_message = message;
            conversation.updated_at = message.created_at;
        }
        
        // Update unread count
        const isOwnMessage = message.sender.id === state.currentUser?.id
        const isActiveConversation = state.currentConversation?.id === conversationId
        
        if (!isOwnMessage && !isActiveConversation) {
            state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1
            
            if (conversation) {
            conversation.unread_count = state.unreadCounts[conversationId]
            }
            
            state.totalUnreadCount = Object.values(state.unreadCounts).reduce(
            (sum, count) => sum + count,
            0
            )
        }
        },


        replaceOptimisticMessage: (
            state,
            action: PayloadAction<{
                conversationId: string;
                tempId: string;
                realMessage: Message;
            }>
        ) => {
            const { conversationId, tempId, realMessage } = action.payload;
            const messages = state.messages[conversationId];
            if (!messages) return;

            const index = messages.findIndex((m) => m.id === tempId);
            if (index !== -1) {
                // Replace in place so scroll position doesn't jump
                messages[index] = realMessage;
            } else {
                // Temp message was already replaced or doesn't exist — just add the real one
                // (with duplicate check)
                const alreadyExists = messages.some((m) => m.id === realMessage.id);
                if (!alreadyExists) {
                    messages.push(realMessage);
                }
            }
        },

        // Removes the optimistic message if the API call failed
        removeOptimisticMessage: (
            state,
            action: PayloadAction<{
                conversationId: string;
                tempId: string;
            }>
        ) => {
            const { conversationId, tempId } = action.payload;
            const messages = state.messages[conversationId];
            if (!messages) return;

            state.messages[conversationId] = messages.filter((m) => m.id !== tempId);
        },

        
        updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; updates: Partial<Message> }>) => {
            const { conversationId, messageId, updates } = action.payload;
            
            if (state.messages[conversationId]) {
                const index = state.messages[conversationId].findIndex(m => m.id === messageId);
                if (index !== -1) {
                    state.messages[conversationId][index] = {
                        ...state.messages[conversationId][index],
                        ...updates,
                    };
                }
            }
        },
        
        deleteMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; deleteForEveryone: boolean }>) => {
            const { conversationId, messageId, deleteForEveryone } = action.payload;
            
            if (state.messages[conversationId]) {
                const index = state.messages[conversationId].findIndex(m => m.id === messageId);
                if (index !== -1) {
                    if (deleteForEveryone) {
                        state.messages[conversationId][index].is_deleted = true;
                        state.messages[conversationId][index].deleted_for_everyone = true;
                        state.messages[conversationId][index].body = "This message was deleted";
                    } else {
                        state.messages[conversationId].splice(index, 1);
                    }
                }
            }
        },

        removeMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
            const { conversationId, messageId } = action.payload;
            
            if (state.messages[conversationId]) {
                const index = state.messages[conversationId].findIndex(m => m.id === messageId);
                if (index !== -1) {
                // Cleanup blob URL if exists
                const message = state.messages[conversationId][index]
                if (message.media_url?.startsWith('blob:')) {
                    URL.revokeObjectURL(message.media_url)
                }
                
                state.messages[conversationId].splice(index, 1);
                console.log('🗑️ Removed message:', messageId)
                }
            }
        },
        
        addReaction: (state, action: PayloadAction<{ conversationId: string; messageId: string; reaction: any }>) => {
            const { conversationId, messageId, reaction } = action.payload;
            
            if (state.messages[conversationId]) {
                const message = state.messages[conversationId].find(m => m.id === messageId);
                if (message) {
                    const existingIndex = message.reactions.findIndex(r => r.user.id === reaction.user.id);
                    if (existingIndex !== -1) {
                        message.reactions[existingIndex] = reaction;
                    } else {
                        message.reactions.push(reaction);
                    }
                }
            }
        },
        
        removeReaction: (state, action: PayloadAction<{ conversationId: string; messageId: string; userId: string }>) => {
            const { conversationId, messageId, userId } = action.payload;
            
            if (state.messages[conversationId]) {
                const message = state.messages[conversationId].find(m => m.id === messageId);
                if (message) {
                    message.reactions = message.reactions.filter(r => r.user.id !== userId);
                }
            }
        },
        
        setTypingUsers: (state, action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>) => {
            const { conversationId, userId, isTyping } = action.payload;
            
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }
            
            if (isTyping) {
                if (!state.typingUsers[conversationId].includes(userId)) {
                    state.typingUsers[conversationId].push(userId);
                }
            } else {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
            }
        },
        
        setOnlineUsers: (state, action: PayloadAction<{ conversationId: string; userIds: string[] }>) => {
            const { conversationId, userIds } = action.payload;
            state.onlineUsers[conversationId] = userIds;
        },
        
        updateUserStatus: (state, action: PayloadAction<{ conversationId: string; userId: string; status: "online" | "offline" }>) => {
            const { conversationId, userId, status } = action.payload;
            
            if (!state.onlineUsers[conversationId]) {
                state.onlineUsers[conversationId] = [];
            }
            
            if (status === "online") {
                if (!state.onlineUsers[conversationId].includes(userId)) {
                    state.onlineUsers[conversationId].push(userId);
                }
            } else {
                state.onlineUsers[conversationId] = state.onlineUsers[conversationId].filter(id => id !== userId);
            }
        },
        
        updateUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
            const { conversationId, count } = action.payload;
            state.unreadCounts[conversationId] = count;
            
            // Update conversation unread count
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.unread_count = count;
            }
            
            // Recalculate total
            state.totalUnreadCount = Object.values(state.unreadCounts).reduce((sum, c) => sum + c, 0);
        },
        
        markConversationRead: (state, action: PayloadAction<string>) => {
        const conversationId = action.payload;
        
        console.log('📖 markConversationRead:', conversationId)
        
        // ✅ FIX: Update individual messages to show blue checks
        if (state.messages[conversationId]) {
            const currentUserId = state.currentUser?.id
            
            state.messages[conversationId].forEach((message) => {
            // Only update messages from OTHER users
            if (message.sender.id !== currentUserId) {
                message.is_read = true
                message.status = 'read'
                console.log(`✅ Marked message ${message.id} as read`)
            }
            })
        }
        
        // Clear unread count
        state.unreadCounts[conversationId] = 0;
        
        // Update conversation
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.unread_count = 0;
        }
        
        // Update total unread
        state.totalUnreadCount = Object.values(state.unreadCounts).reduce(
            (sum, count) => sum + count,
            0
        );
        
        console.log('✅ Conversation marked as read, unread count:', state.totalUnreadCount)
        },
        
        setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
            state.currentConversation = action.payload;
        },
        
        setCurrentCall: (state, action: PayloadAction<Call | null>) => {
            state.currentCall = action.payload;
        },

        setUploadProgress: (state, action: PayloadAction<{ messageId: string; progress: number }>) => {
            const { messageId, progress } = action.payload
            state.uploadProgress[messageId] = progress
            console.log(`📊 Upload progress for ${messageId}: ${progress}%`)
        },  
        
        clearUploadProgress: (state, action: PayloadAction<string>) => {
        delete state.uploadProgress[action.payload]
        },
        
        // UI state
        setReplyingTo: (state, action: PayloadAction<Message | null>) => {
            state.replyingTo = action.payload;
        },
        
        setForwardingMessage: (state, action: PayloadAction<Message | null>) => {
            state.forwardingMessage = action.payload;
        },
        
        toggleMessageSelection: (state, action: PayloadAction<string>) => {
            const messageId = action.payload;
            const index = state.selectedMessages.indexOf(messageId);
            
            if (index !== -1) {
                state.selectedMessages.splice(index, 1);
            } else {
                state.selectedMessages.push(messageId);
            }
        },
        
        clearMessageSelection: (state) => {
            state.selectedMessages = [];
        },
        
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchQuery = "";
        },
    },
    extraReducers: (builder) => {
        // Fetch conversations
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.conversationLoading = true;
                state.conversationError = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversationLoading = false;
                state.conversations = action.payload;
                
                // Initialize unread counts
                action.payload.forEach((conv: Conversation) => {
                    state.unreadCounts[conv.id] = conv.unread_count;
                });
                state.totalUnreadCount = action.payload.reduce((sum: number, conv: Conversation) => sum + conv.unread_count, 0);
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversationLoading = false;
                state.conversationError = action.payload as string;
            });
        
        // Create conversation
        builder
            .addCase(createConversation.fulfilled, (state, action) => {
                state.conversations.unshift(action.payload);
                state.currentConversation = action.payload;
            });
        
        // Fetch conversation detail
        builder
            .addCase(fetchConversationDetail.fulfilled, (state, action) => {
                const index = state.conversations.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.conversations[index] = action.payload;
                } else {
                    state.conversations.unshift(action.payload);
                }
                state.currentConversation = action.payload;
            });
        
        // Fetch messages
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.messageLoading = true;
                state.messageError = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messageLoading = false;
                const { conversationId, messages, hasMore } = action.payload;
                
                if (!state.messages[conversationId]) {
                    state.messages[conversationId] = [];
                }
                
                // Prepend new messages (for pagination)
                const existingIds = new Set(state.messages[conversationId].map(m => m.id));
                const newMessages = messages.filter((m: Message) => !existingIds.has(m.id));
                state.messages[conversationId] = [...newMessages, ...state.messages[conversationId]];
                
                state.hasMoreMessages[conversationId] = hasMore;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.messageLoading = false;
                state.messageError = action.payload as string;
            });
        
        // Send message (via API, not WebSocket)
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            const message = action.payload;
            const conversationId = message.conversation;
            
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            
            // Check if message already exists
            const exists = state.messages[conversationId].some(m => m.id === message.id);
            if (!exists) {
                state.messages[conversationId].push(message);
            }
        });
        
        // Star message
        builder.addCase(starMessage.fulfilled, (state, action) => {
            const { messageId, is_starred } = action.payload;
            
            // Update in all conversations
            Object.keys(state.messages).forEach(conversationId => {
                const message = state.messages[conversationId].find(m => m.id === messageId);
                if (message) {
                    message.is_starred_by_me = is_starred;
                }
            });
        });
        
        // Search messages
        builder
            .addCase(searchMessages.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchMessages.fulfilled, (state, action) => {
                state.searchLoading = false;
                if (action.payload) {
                    state.searchResults = action.payload.results;
                    state.searchQuery = action.payload.query;
                }
            })
            .addCase(searchMessages.rejected, (state) => {
                state.searchLoading = false;
            });
        
        // Starred messages
        builder
            .addCase(fetchStarredMessages.pending, (state) => {
                state.starredLoading = true;
            })
            .addCase(fetchStarredMessages.fulfilled, (state, action) => {
                state.starredLoading = false;
                if (action.payload) {
                    state.starredMessages = action.payload.results;
                }
            })
            .addCase(fetchStarredMessages.rejected, (state) => {
                state.starredLoading = false;
            });
        
        // Pin conversation
        builder.addCase(pinConversation.fulfilled, (state, action) => {
            const conversation = state.conversations.find(c => c.id === action.payload?.id);
            if (conversation && action.payload) {
                conversation.is_pinned = action.payload.is_pinned;
            }
        });
        
        // Archive conversation
        builder.addCase(archiveConversation.fulfilled, (state, action) => {
            const conversation = state.conversations.find(c => c.id === action.payload?.id);
            if (conversation && action.payload) {
                conversation.is_archived = action.payload.is_archived;
            }
        });
        
        // Mute conversation
        builder.addCase(muteConversation.fulfilled, (state, action) => {
            const conversation = state.conversations.find(c => c.id === action.payload?.id);
            if (conversation && action.payload) {
                conversation.is_muted = action.payload.is_muted;
            }
        });
        
        // Calls
        builder
            .addCase(initiateCall.pending, (state) => {
                state.callLoading = true;
            })
            .addCase(initiateCall.fulfilled, (state, action) => {
                state.callLoading = false;
                if (action.payload) {
                    state.currentCall = action.payload;
                    state.calls.unshift(action.payload);
                }
            })
            .addCase(initiateCall.rejected, (state, action) => {
                state.callLoading = false;
                state.callError = action.payload as string;
            });
        
        builder.addCase(endCall.fulfilled, (state, action) => {
            if (action.payload) {
                const index = state.calls.findIndex(c => c.id === action.payload?.id);
                if (index !== -1) {
                    state.calls[index] = action.payload;
                }
                if (state.currentCall?.id === action.payload.id) {
                    state.currentCall = null;
                }
            }
        });
        
        builder.addCase(fetchMyCalls.fulfilled, (state, action) => {
            if (action.payload) {
                state.calls = action.payload;
            }
        });
        
        // Blocked users
        builder
            .addCase(fetchBlockedUsers.pending, (state) => {
                state.blockedLoading = true;
            })
            .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
                state.blockedLoading = false;
                if (action.payload) {
                    state.blockedUsers = action.payload;
                }
            })
            .addCase(fetchBlockedUsers.rejected, (state) => {
                state.blockedLoading = false;
            });
        
        builder.addCase(blockUser.fulfilled, (state, action) => {
            if (action.payload) {
                state.blockedUsers.push(action.payload);
            }
        });
        
        builder.addCase(unblockUser.fulfilled, (state, action) => {
            state.blockedUsers = state.blockedUsers.filter(b => b.blocked_user.id !== action.payload);
        });
    },
});

// ============ ACTIONS ============
export const {
    addMessage,
    updateMessage,
    deleteMessage,
    removeMessage,
    addReaction,
    removeReaction,
    setTypingUsers,
    setOnlineUsers,
    updateUserStatus,
    updateUnreadCount,
    markConversationRead,
    setCurrentConversation,
    setCurrentCall,
    setReplyingTo,
    setCurrentUser,
    setForwardingMessage,
    toggleMessageSelection,
    clearMessageSelection,
    setUploadProgress, 
    clearUploadProgress,
    clearSearchResults,
    replaceOptimisticMessage,
    removeOptimisticMessage,
} = messageSlice.actions;

// ============ SELECTORS ============
export const selectConversations = (state: RootState) => state.message.conversations;
export const selectCurrentConversation = (state: RootState) => state.message.currentConversation;
const EMPTY_ARRAY: string[] = [];

export const selectMessages = (conversationId: string) => (state: RootState) => 
    state.message.messages[conversationId] || EMPTY_ARRAY;

export const selectTypingUsers = (conversationId: string) => (state: RootState) =>
    state.message.typingUsers[conversationId] || EMPTY_ARRAY;

export const selectOnlineUsers = (conversationId: string) => (state: RootState) =>
    state.message.onlineUsers[conversationId] || EMPTY_ARRAY;
export const selectUnreadCount = (conversationId: string) => (state: RootState) =>
    state.message.unreadCounts[conversationId] || 0;

export const makeSelectMessages = () => 
  createSelector(
    [
      (state: RootState) => state.message.messages,
      (_: RootState, conversationId: string) => conversationId
    ],
    (messages, conversationId) => messages[conversationId] || []
  )

export const selectTotalUnreadCount = (state: RootState) => state.message.totalUnreadCount;
export const selectCurrentCall = (state: RootState) => state.message.currentCall;
export const selectReplyingTo = (state: RootState) => state.message.replyingTo;
export const selectSearchResults = (state: RootState) => state.message.searchResults;
export const selectSelectedMessages = (state: RootState) => state.message.selectedMessages;


export default messageSlice.reducer;