import { User } from "./users"

// Message type enum
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'delivered' | 'read';
export type ConversationType = 'direct' | 'group';
export type CallType = 'audio' | 'video';
export type CallStatus = 'invited' | 'ringing' | 'answered' | 'rejected' | 'ended';

// Message read receipt
export interface MessageReadReceipt {
    user: User;
    read_at: string;
}

// Message reaction
export interface MessageReaction {
    id: string;
    user: User;
    emoji: string;
    created_at: string;
}

// Reply to message preview
export interface ReplyToMessage {
    id: string;
    sender: User;
    body: string;
    message_type: MessageType;
    created_at: string;
    is_deleted: boolean;
}

// Forwarded from message info
export interface ForwardedFromMessage {
    id: string;
    sender: User;
}

// Main Message interface
export interface Message {
    id: string;
    conversation: string;
    sender: User;
    message_type: MessageType;
    body: string;
    
    // Media fields
    media: string | null;
    media_url: string | null;
    thumbnail_url: string | null;
    media_duration: number | null;
    media_size: number | null;
    
    // Location fields
    location_latitude: number | null;
    location_longitude: number | null;
    location_name: string | null;
    
    // Reply/Forward
    reply_to: string | null;
    reply_to_message: ReplyToMessage | null;
    forwarded_from: string | null;
    forwarded_from_message: ForwardedFromMessage | null;
    forward_count: number;
    
    // Status flags
    is_edited: boolean;
    is_deleted: boolean;
    deleted_for_everyone: boolean;
    deleted_at: string | null;
    
    // Read/Delivery
    read_by: MessageReadReceipt[];
    reactions: MessageReaction[];
    is_delivered?: boolean;
    is_read: boolean;
    status: MessageStatus;
    is_starred_by_me: boolean;
    
    // Timestamps
    created_at: string;
    updated_at: string;
}

// Conversation Member
export interface ConversationMember {
    id: string;
    user: User;
    is_admin: boolean;
    is_muted: boolean;
    is_pinned: boolean;
    is_archived: boolean;
    last_read_at: string | null;
    joined_at: string;
    unread_count: number;
    is_active: boolean;
    show_last_seen: boolean;
    show_online_status: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ConversationListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Conversation[];
}

// Conversation
export interface Conversation {
    id: string;
    type: ConversationType;
    name: string;
    description: string | null;
    icon: string | null;
    icon_url: string | null;
    only_admins_can_send: boolean;
    
    members: ConversationMember[];
    last_message: Message | null;
    unread_count: number;
    other_user: User | null;
    
    online_members: string[];
    typing_users: string[];
    
    is_pinned: boolean;
    is_archived: boolean;
    is_muted: boolean;
    
    created_at: string;
    updated_at: string;
}

// Call Participant
export interface CallParticipant {
    id: string;
    user: User;
    status: string;
    ice_candidates: any[];
    invited_at: string;
    joined_at: string | null;
    left_at: string | null;
}

// Call
export interface Call {
    id: string;
    conversation: string;
    caller: User;
    call_type: CallType;
    status: CallStatus;
    offer_sdp: string | null;
    answer_sdp: string | null;
    participants: CallParticipant[];
    duration: number | null;
    duration_display: string;
    initiated_at: string;
    answered_at: string | null;
    ended_at: string | null;
}

// Starred Message
export interface StarredMessage {
    id: string;
    message: Message;
    starred_at: string;
}

// Blocked User
export interface BlockedUser {
    id: string;
    blocked_user: User;
    blocked_at: string;
}

// Group Invite Link
export interface GroupInviteLink {
    id: string;
    code: string;
    created_by: User;
    is_active: boolean;
    expires_at: string | null;
    max_uses: number | null;
    use_count: number;
    is_valid: boolean;
    invite_url: string;
    created_at: string;
}

// Typing indicator
export interface TypingUser {
    userId: string;
    username: string;
    conversationId: string;
    isTyping: boolean;
    timestamp: number;
}

// WebSocket message types
export interface WSMessage {
    type: string;
    data: unknown;
}

// API Request/Response types
export interface PromoteDemoteRequest {
    user_id: string;
}

export interface MessageReactionRequest {
    emoji: string;
}

export interface StarMessageResponse {
    message: string;
    is_starred: boolean;
}

export interface CreateInviteLinkRequest {
    expires_at?: string;
    max_uses?: number;
}

export interface JoinGroupResponse {
    message: string;
    conversation: Conversation;
}

export interface ForwardMessageRequest {
    conversation_ids: string[];
}

export interface ForwardMessageResponse {
    message: string;
    forwarded_count: number;
}

export interface SearchMessagesResponse {
    query: string;
    results: Message[];
    count: number;
}

export interface StarredMessagesResponse {
    results: StarredMessage[];
    next: string | null;
    previous: string | null;
}