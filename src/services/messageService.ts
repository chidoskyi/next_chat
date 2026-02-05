// lib/messageAPI.ts
import { ApiClient } from "./api";
export interface AxiosProgressEvent {
  loaded: number;
  total?: number;
  progress?: number; // 0 to 1
  bytes: number;
  rate?: number;
  estimated?: number;
  upload?: boolean;
  download?: boolean;
}
import { 
    // Enums/Types
    MessageType,
    ConversationType,
    CallType,
    
    // Interfaces
    Message,
    Conversation,
    Call,
    GroupInviteLink,
    BlockedUser,
    StarredMessage,
    
    // Request/Response Types
    PromoteDemoteRequest,
    MessageReactionRequest,
    StarMessageResponse,
    CreateInviteLinkRequest,
    JoinGroupResponse,
    ForwardMessageRequest,
    ForwardMessageResponse,
    SearchMessagesResponse,
    StarredMessagesResponse,
    ConversationListResponse,
} from "../types/message";

export interface MeteredTurnCredentials {
  s: string;  // "success" or "error"
  v: {
    iceServers: {
      urls: string[];
      username?: string;
      credential?: string;
    }[];
    username?: string;
    password?: string;
    ttl: number;
  };
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class MessageService extends ApiClient {
  constructor() {
    super(API_URL);
  }

  // ============ CONVERSATIONS ============
  async getConversations() {
    try{
        const response = await this.client.get<ConversationListResponse>('/conversations/');
        return response.data.results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createConversation(participantIds: string[], type: ConversationType = 'direct') {
    return this.client.post<Conversation>('/conversations/', { 
      user_ids: participantIds, 
      type 
    });
  }

  async getConversationDetail(conversationId: string) {
    return this.client.get<Conversation>(`/conversations/${conversationId}/`);
  }

  async getMessages(conversationId: string, params?: { page?: number }) {
    return this.client.get<{ results: Message[], next: string | null, previous: string | null }>(
      `/conversations/${conversationId}/messages/`,
      { params }
    );
  }

  async markAsRead(conversationId: string) {
    return this.client.post<{ message: string }>(`/conversations/${conversationId}/read/`);
  }

  // ============ MESSAGE ACTIONS ============
  async sendMessage(
    conversationId: string, 
    data: {
      message_type: MessageType;
      body: string;
      media?: File;
      reply_to?: string;
    },
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) {
    const formData = new FormData();
    formData.append('message_type', data.message_type);
    formData.append('body', data.body);
    
    if (data.media) {
      formData.append('media_file', data.media); // ✅ Changed from 'media' to 'media_file'
    }
    
    if (data.reply_to) {
      formData.append('reply_to', data.reply_to);
    }
    
    return this.client.post<Message>(
      `/conversations/${conversationId}/messages/`, 
      formData, 
      {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        // ✅ ADD THIS: Track upload progress
        onUploadProgress: onUploadProgress
      }
    );
  }

  async getMessageDetail(messageId: string) {
    try{
        const response = await this.client.get<Message>(`/messages/${messageId}/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async reactToMessage(messageId: string, emoji: string) {
    try{
        const response = await this.client.post<Message>(`/messages/${messageId}/react/`, { emoji });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async starMessage(messageId: string) {
    try{
        const response = await this.client.post<StarMessageResponse>(`/messages/${messageId}/star/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async forwardMessage(messageId: string, conversationIds: string[]) {
    try{
        const response = await this.client.post<ForwardMessageResponse>(
          `/messages/${messageId}/forward/`,
      { conversation_ids: conversationIds }
    );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStarredMessages(params?: { page?: number }) {
    try{
        const response = await this.client.get<StarredMessagesResponse>('/messages/starred/', { params });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchMessages(query: string) {
    try{
        const response = await this.client.get<SearchMessagesResponse>(`/messages/search/`, { 
          params: { q: query } 
        });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ GROUP MANAGEMENT ============
  async createInviteLink(conversationId: string, data?: CreateInviteLinkRequest) {
    try{
        const response = await this.client.post<GroupInviteLink>(
          `/conversations/${conversationId}/invite/create/`,
          data
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async revokeInviteLink(conversationId: string, linkId: string) {
    try{
        const response = await this.client.post<{ message: string }>(
          `/conversations/${conversationId}/invite/${linkId}/revoke/`
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async joinByInviteCode(code: string) {
    try{
        const response = await this.client.post<JoinGroupResponse>(`/invite/${code}/join/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async addMember(conversationId: string, userId: string) {
    try{
        const response = await this.client.post<{ message: string }>(
          `/conversations/${conversationId}/members/add/`,
          { user_id: userId }
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeMember(conversationId: string, userId: string) {
    try{
        const response = await this.client.post<{ message: string }>(
          `/conversations/${conversationId}/members/remove/`,
          { user_id: userId }
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async promoteMember(conversationId: string, userId: string) {
    try{
        const response = await this.client.post<{ message: string }>(
          `/conversations/${conversationId}/members/promote/`,
          { user_id: userId }
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async demoteMember(conversationId: string, userId: string) {
    try{
        const response = await this.client.post<{ message: string }>(
          `/conversations/${conversationId}/members/demote/`,
          { user_id: userId }
        );
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ CONVERSATION ACTIONS ============
  async pinConversation(conversationId: string) {
    try{
        const response = await this.client.post<Conversation>(`/conversations/${conversationId}/pin/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async archiveConversation(conversationId: string) {
    try{
        const response = await this.client.post<Conversation>(`/conversations/${conversationId}/archive/`);
        return response.data; 
    } catch (error) {
      this.handleError(error);
    }
  }

  async muteConversation(conversationId: string) {
    try{
        const response = await this.client.post<Conversation>(`/conversations/${conversationId}/mute/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUnreadCount() {
    try{
        const response = await this.client.get<{ unread_count: number }>('/conversations/unread-count/');
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ CALLS (WebRTC) ============
  async initiateCall(conversationId: string, callType: CallType) {
    try{
        const response = await this.client.post<Call>('/calls/initiate/', { 
          conversation_id: conversationId, 
          call_type: callType 
        });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async answerCall(callId: string, sdpOffer?: string) {
    try{
        const response = await this.client.post<Call>(`/calls/${callId}/answer/`, { sdp_offer: sdpOffer });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async endCall(callId: string) {
    try{
        const response = await this.client.post<Call>(`/calls/${callId}/end/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCallDetail(callId: string) {
    try{
        const response = await this.client.get<Call>(`/calls/${callId}/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCallHistory(conversationId: string) {
    try{
        const response = await this.client.get<Call[]>(`/calls/history/${conversationId}/`);
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
async getTurnCredentials(): Promise<MeteredTurnCredentials | null> {
  try {
    const response = await this.client.get<MeteredTurnCredentials>('/turn-credentials/');
    return response.data;
  } catch (error) {
    this.handleError(error);
    return null;
  }
}

  async getMyCalls() {
    try{
        const response = await this.client.get<Call[]>('/calls/my-calls/');
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============ BLOCKING ============
  async blockUser(userId: string) {
    try{
        const response = await this.client.post<BlockedUser>('/block/', { user_id: userId });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async unblockUser(userId: string) {
    try{
        const response = await this.client.post<{ message: string }>('/messaging/unblock/', { user_id: userId });
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBlockedUsers() {
    try{
        const response = await this.client.get<BlockedUser[]>('/messaging/blocked/');
        return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default new MessageService();