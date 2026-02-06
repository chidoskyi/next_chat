// lib/wsApi.ts - Fixed WebSocket API with proper message type handling

import { User } from "@/src/types/users";
import { Message } from "@/src/types/message";

// ============ SHARED TYPES ============

interface ConnectionEstablishedData {
  message: string;
  user_id: string;
  username?: string;
  timestamp?: string;
}

interface PongData {
  timestamp: string;
}

interface ErrorData {
  error: string;
  action?: string;
  conversation_id?: string;
}

// ============ CHAT EVENT TYPES ============

type ChatEventType =
  | "connection_established"
  | "pong"
  | "error"
  | "chat_message"
  | "message"  // ADDED: Backend sends "message" not "chat_message"
  | "message_sent"
  | "message_edited"
  | "message_deleted"
  | "typing"
  | "typing_sidebar"
  | "user_status"
  | "online_status"
  | "read_receipt"
  | "all_read_receipt"
  | "all_messages_read_confirm"
  | "delivery_receipt"
  | "unread_count"
  | "unread_count_update"
  | "reaction"
  | "reaction_removed"
  | "conversation_joined"
  | "conversation_left"
  | "conversation_updated";

// ============ CALL EVENT TYPES ============

type CallEventType =
  | "connection_established"
  | "pong"
  | "error"
  | "incoming_call"  
  | "call_initiated"  
  | "call_created"
  | "call_answered"
  | "join_call"
  | "call_rejected"
  | "call_ended"
  | "call_signal"
  | "ice_candidate"
  | "call_room_joined"
  | "call_room_left";

// ============ CHAT DATA INTERFACES ============

interface MessageData extends Message {
  conversation_id?: string;
}

interface MessageSentData {
  message_id: string;
  conversation_id: string;
  timestamp?: string;
}

interface MessageEditedData {
  message_id: string;
  body: string;
  conversation_id: string;
}

interface MessageDeletedData {
  message_id: string;
  user_id: string;
  delete_for_everyone: boolean;
  conversation_id: string;
}

interface TypingData {
  user_id: string;
  username: string;
  is_typing: boolean;
  conversation_id: string;
}

interface TypingSidebarData {
  conversation_id: string;
  user_id: string;
  username: string;
  is_typing: boolean;
}

interface UserStatusData {
  user_id: string;
  username: string;
  status: "online" | "offline";
  conversation_id?: string;
  timestamp?: string;
}

interface OnlineStatusData {
  conversation_id: string;
  online_users: Array<{
    user_id: string;
    username: string;
  }>;
  timestamp?: string;
}

interface ReadReceiptData {
  message_id: string;
  user_id: string;
  username: string;
  conversation_id: string;
}

interface AllReadReceiptData {
  user_id: string;
  username: string;
  conversation_id: string;
  marked_count: number;
}

interface AllMessagesReadConfirmData {
  conversation_id: string;
  marked_count: number;
}

interface DeliveryReceiptData {
  message_id: string;
  user_id: string;
  conversation_id: string;
}

interface UnreadCountData {
  conversation_id: string;
  count: number;
  last_message?: Message;
}

interface UnreadCountUpdateData {
  conversation_id: string;
  count: number;
}

interface ReactionData {
  message_id: string;
  user_id: string;
  username: string;
  emoji: string;
  conversation_id: string;
}

interface ReactionRemovedData {
  message_id: string;
  user_id: string;
  conversation_id: string;
}

interface ConversationJoinedData {
  conversation_id: string;
  has_unread: boolean;
  online_users: Array<{
    user_id: string;
    username: string;
  }>;
  timestamp?: string;
}

interface ConversationLeftData {
  conversation_id: string;
  timestamp: string;
}

interface ConversationUpdatedData {
  conversation_id: string;
  data: Record<string, any>;
  timestamp: string;
}

// ============ CALL DATA INTERFACES ============

interface CallInitiatedData {
  call_id: string;
  caller_id: string;
  caller_username: string;
  call_type: "audio" | "video";
  conversation_id: string;
  offer_sdp: string;
  is_caller: boolean;  // ✅ Backend sends this
}

interface IncomingCallData {
  call_id: string;
  caller_id: string;
  caller_username: string;
  call_type: "audio" | "video";
  conversation_id: string;
  offer_sdp: string;
}


interface IncomingCallData {
  call_id: string;
  caller_id: string;
  caller_username: string;
  call_type: "audio" | "video";
  is_caller?: boolean
  conversation_id: string;
  offer_sdp: string;
}

interface CallCreatedData {
  call_id: string;
  call_type: "audio" | "video";
  status: string;
}

interface CallAnsweredData {
  call_id: string;
  user_id: string;
  username: string;
  answer_sdp: string;
}

interface JoinCallData {
  call_id: string;
  user_id: string;
  username: string;
}

interface CallRejectedData {
  call_id: string;
  user_id: string;
  username: string;
}

interface CallEndedData {
  call_id: string;
  user_id: string;
  username: string;
  duration: number;
}

interface CallSignalData {
  call_id: string;
  from_user_id: string;
  signal: any;
}

interface IceCandidateData {
  call_id: string;
  from_user_id: string;
  candidate: any;
}

interface CallRoomJoinedData {
  call_id: string;
}

interface CallRoomLeftData {
  message: string;
}

// ============ EVENT DATA MAPS ============

interface ChatEventDataMap {
  connection_established: ConnectionEstablishedData;
  pong: PongData;
  error: ErrorData;
  chat_message: MessageData;
  message: MessageData;  // ADDED: Same as chat_message
  message_sent: MessageSentData;
  message_edited: MessageEditedData;
  message_deleted: MessageDeletedData;
  typing: TypingData;
  typing_sidebar: TypingSidebarData;
  user_status: UserStatusData;
  online_status: OnlineStatusData;
  read_receipt: ReadReceiptData;
  all_read_receipt: AllReadReceiptData;
  all_messages_read_confirm: AllMessagesReadConfirmData;
  delivery_receipt: DeliveryReceiptData;
  unread_count: UnreadCountData;
  unread_count_update: UnreadCountUpdateData;
  reaction: ReactionData;
  reaction_removed: ReactionRemovedData;
  conversation_joined: ConversationJoinedData;
  conversation_left: ConversationLeftData;
  conversation_updated: ConversationUpdatedData;
}

interface CallEventDataMap {
  connection_established: ConnectionEstablishedData;
  pong: PongData;
  error: ErrorData;
  call_initiated: CallInitiatedData;
  incoming_call: IncomingCallData;
  call_created: CallCreatedData;
  call_answered: CallAnsweredData;
  join_call: JoinCallData;
  call_rejected: CallRejectedData;
  call_ended: CallEndedData;
  call_signal: CallSignalData;
  ice_candidate: IceCandidateData;
  call_room_joined: CallRoomJoinedData;
  call_room_left: CallRoomLeftData;
}

// ============ CALLBACK TYPES ============

type ChatCallback<T extends ChatEventType> = (data: ChatEventDataMap[T]) => void;
type CallCallback<T extends CallEventType> = (data: CallEventDataMap[T]) => void;

// ============ WEBSOCKET MESSAGE STRUCTURE ============

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// ============ BASE WEBSOCKET CLASS ============

abstract class BaseWebSocketAPI<
  EventType extends string,
  EventDataMap extends Record<string, any>
> {
  protected ws: WebSocket | null = null;
  protected token: string | null = null;
  protected listeners: Record<EventType, Set<(data: any) => void>>;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected reconnectDelay = 1000;
  protected reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  protected isIntentionalClose = false;
  protected heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  protected missedHeartbeats = 0;
  protected maxMissedHeartbeats = 3;
  protected abstract endpoint: string;

  constructor(eventTypes: EventType[]) {
    this.listeners = {} as Record<EventType, Set<(data: any) => void>>;
    eventTypes.forEach((type) => {
      this.listeners[type] = new Set();
    });
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;
      this.isIntentionalClose = false;

      console.log(`🔄 Starting ${this.endpoint} WebSocket connection...`);

      const wsUrl = this.getWebSocketUrl(token);

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(`✅ ${this.endpoint} WebSocket connected successfully`);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log(`📨 ${this.endpoint} message received:`, event.data);
          this.handleMessage(event);
        };

    this.ws.onerror = (error) => {
      console.error(`❌ ${this.endpoint} WebSocket error:`, error);
      
      const errorData: ErrorData = {
        error: "WebSocket connection error",
        action: "connect",
      };
      
      // Cast to any to bypass TypeScript's strict checking
      this.notifyListeners("error" as any, errorData as any);

      if (!this.isIntentionalClose) {
        this.scheduleReconnect();
      }

      reject(error);
    };

        this.ws.onclose = (event) => {
          console.log(`🔌 ${this.endpoint} WebSocket closed:`, {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.stopHeartbeat();

          if (
            !this.isIntentionalClose &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error(`❌ Failed to create ${this.endpoint} WebSocket:`, error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isIntentionalClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
  }

  on<T extends EventType>(
    event: T,
    callback: (data: EventDataMap[T]) => void
  ): () => void {
    (this.listeners[event] as Set<typeof callback>).add(callback);

    return () => this.off(event, callback);
  }

  off<T extends EventType>(
    event: T,
    callback: (data: EventDataMap[T]) => void
  ): void {
    (this.listeners[event] as Set<typeof callback>).delete(callback);
  }

  removeAllListeners(event?: EventType): void {
    if (event) {
      this.listeners[event].clear();
    } else {
      (Object.keys(this.listeners) as EventType[]).forEach((key) => {
        this.listeners[key].clear();
      });
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  protected getWebSocketUrl(token: string): string {
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || "localhost:8000";
    const protocol =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss:"
        : "ws:";

    const url = `${protocol}//${wsHost}/ws/${this.endpoint}/?token=${token}`;

    console.log(
      `🔌 ${this.endpoint} WebSocket URL:`,
      url.replace(/token=.*$/, "token=***")
    );

    return url;
  }

  protected send(data: any): void {
    if (!this.isConnected()) {
      console.warn(
        `${this.endpoint} WebSocket is not connected. Message not sent:`,
        data
      );
      return;
    }

    try {
      this.ws!.send(JSON.stringify(data));
      console.log(`📤 ${this.endpoint} message sent:`, data);
    } catch (error) {
      console.error(`Error sending ${this.endpoint} message:`, error);
    }
  }

  protected abstract handleMessage(event: MessageEvent): void;

  protected notifyListeners<T extends EventType>(
    event: T,
    data: EventDataMap[T]
  ): void {
    const listeners = this.listeners[event] as Set<(data: EventDataMap[T]) => void>;
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${this.endpoint} ${event} listener:`, error);
      }
    });
  }

  protected scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `⏰ ${this.endpoint} reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.token) {
        this.connect(this.token).catch((error) => {
          console.error(`❌ ${this.endpoint} reconnection failed:`, error);
        });
      }
    }, delay);
  }

  protected startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.missedHeartbeats++;

        if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
          console.warn(
            `💔 ${this.endpoint} too many missed heartbeats, closing connection`
          );
          this.ws?.close();
          return;
        }

        try {
          this.send({ action: "ping" });
        } catch (error) {
          console.error(`❌ ${this.endpoint} heartbeat ping failed:`, error);
        }
      }
    }, 30000); // 30 seconds
  }

  protected stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.missedHeartbeats = 0;
  }
}

// ============ CHAT WEBSOCKET CLASS ============

class ChatWebSocketAPI extends BaseWebSocketAPI<ChatEventType, ChatEventDataMap> {
  protected endpoint = "chat";

  constructor() {
    super([
      "connection_established",
      "pong",
      "error",
      "chat_message",
      "message",  // ADDED: Backend uses "message" not "chat_message"
      "message_sent",
      "message_edited",
      "message_deleted",
      "typing",
      "typing_sidebar",
      "user_status",
      "online_status",
      "read_receipt",
      "all_read_receipt",
      "all_messages_read_confirm",
      "delivery_receipt",
      "unread_count",
      "unread_count_update",
      "reaction",
      "reaction_removed",
      "conversation_joined",
      "conversation_left",
      "conversation_updated",
    ]);
  }

  // ============ MESSAGE ACTIONS ============

  sendMessage(conversationId: string, message: string, replyToId?: string): void {
    this.send({
      action: "send_message",
      conversation_id: conversationId,
      message: message.trim(),
      ...(replyToId && { reply_to: replyToId }),
    });
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.send({
      action: "typing",
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }

  markMessageRead(conversationId: string, messageId: string): void {
    this.send({
      action: "mark_read",
      conversation_id: conversationId,
      message_id: messageId,
    });
  }

  markAllMessagesRead(conversationId: string): void {
    this.send({
      action: "mark_all_read",
      conversation_id: conversationId,
    });
  }

  markAsDelivered(conversationId: string, messageId: string): void {
    this.send({
      action: "mark_delivered",
      conversation_id: conversationId,
      message_id: messageId,
    });
  }

  reactToMessage(messageId: string, emoji: string): void {
    this.send({
      action: "react_to_message",
      message_id: messageId,
      emoji,
    });
  }

  removeReaction(messageId: string): void {
    this.send({
      action: "remove_reaction",
      message_id: messageId,
    });
  }

  deleteMessage(messageId: string, deleteForEveryone = false): void {
    this.send({
      action: "delete_message",
      message_id: messageId,
      delete_for_everyone: deleteForEveryone,
    });
  }

  editMessage(messageId: string, body: string): void {
    this.send({
      action: "edit_message",
      message_id: messageId,
      body,
    });
  }

  joinConversation(conversationId: string): void {
    this.send({
      action: "join_conversation",
      conversation_id: conversationId,
    });
  }

  leaveConversation(conversationId: string): void {
    this.send({
      action: "leave_conversation",
      conversation_id: conversationId,
    });
  }

  getOnlineStatus(conversationId: string): void {
    this.send({
      action: "get_online_status",
      conversation_id: conversationId,
    });
  }

  // ============ MESSAGE HANDLER ============

  protected handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      const eventType = data.type as ChatEventType;

      console.log(`🔍 [Chat] Processing event type: "${eventType}"`, data);

      switch (eventType) {
        case "connection_established":
          this.notifyListeners("connection_established", {
            message: data.message || "Connected",
            user_id: data.user_id || "",
            username: data.username,
            timestamp: data.timestamp,
          });
          break;

        case "pong":
          this.missedHeartbeats = 0;
          this.notifyListeners("pong", {
            timestamp: data.timestamp || new Date().toISOString(),
          });
          break;

        // FIXED: Handle both "message" and "chat_message" event types
        case "message":
        case "chat_message":
          console.log(`💬 [Chat] Received message event:`, data);
          if (data.data) {
            const messageData = {
              ...data.data,
              conversation_id: data.conversation_id,
            };
            
            // Notify both event types for backwards compatibility
            this.notifyListeners("message" as any, messageData);
            this.notifyListeners("chat_message", messageData);
            console.log(`✅ [Chat] Message listeners notified`);
          } else {
            console.warn(`⚠️ [Chat] Message event missing data field:`, data);
          }
          break;

        case "message_sent":
          if (typeof data.message_id === "string" && data.conversation_id) {
            this.notifyListeners("message_sent", {
              message_id: data.message_id,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "message_edited":
          if (data.message_id && data.body && data.conversation_id) {
            this.notifyListeners("message_edited", {
              message_id: data.message_id,
              body: data.body,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "message_deleted":
          if (data.message_id && data.conversation_id) {
            this.notifyListeners("message_deleted", {
              message_id: data.message_id,
              user_id: data.user_id!,
              delete_for_everyone: data.delete_for_everyone || false,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "typing":
          if (
            data.user_id &&
            data.username &&
            typeof data.is_typing === "boolean"
          ) {
            this.notifyListeners("typing", {
              user_id: data.user_id,
              username: data.username,
              is_typing: data.is_typing,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "typing_sidebar":
          if (
            data.conversation_id &&
            data.user_id &&
            data.username &&
            typeof data.is_typing === "boolean"
          ) {
            this.notifyListeners("typing_sidebar", {
              conversation_id: data.conversation_id,
              user_id: data.user_id,
              username: data.username,
              is_typing: data.is_typing,
            });
          }
          break;

        case "user_status":
          if (data.user_id && data.username && data.status) {
            this.notifyListeners("user_status", {
              user_id: data.user_id,
              username: data.username,
              status: data.status,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "online_status":
          if (data.conversation_id && data.online_users) {
            this.notifyListeners("online_status", {
              conversation_id: data.conversation_id,
              online_users: data.online_users,
              timestamp: data.timestamp,
            });
          }
          break;

        case "read_receipt":
          if (
            typeof data.message_id === "string" &&
            data.user_id &&
            data.username
          ) {
            this.notifyListeners("read_receipt", {
              message_id: data.message_id,
              user_id: data.user_id,
              username: data.username,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "all_read_receipt":
          if (data.user_id && data.username && data.conversation_id) {
            this.notifyListeners("all_read_receipt", {
              user_id: data.user_id,
              username: data.username,
              conversation_id: data.conversation_id,
              marked_count: data.marked_count || 0,
            });
          }
          break;

        case "all_messages_read_confirm":
          if (data.conversation_id && typeof data.marked_count === "number") {
            this.notifyListeners("all_messages_read_confirm", {
              conversation_id: data.conversation_id,
              marked_count: data.marked_count,
            });
          }
          break;

        case "delivery_receipt":
          if (
            typeof data.message_id === "string" &&
            data.user_id &&
            data.conversation_id
          ) {
            this.notifyListeners("delivery_receipt", {
              message_id: data.message_id,
              user_id: data.user_id,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "unread_count":
          if (data.conversation_id && typeof data.count === "number") {
            this.notifyListeners("unread_count", {
              conversation_id: data.conversation_id,
              count: data.count,
              last_message: data.last_message,
            });
          }
          break;

        case "unread_count_update":
          if (data.conversation_id && typeof data.count === "number") {
            this.notifyListeners("unread_count_update", {
              conversation_id: data.conversation_id,
              count: data.count,
            });
          }
          break;

        case "reaction":
          if (
            data.message_id &&
            data.user_id &&
            data.emoji &&
            data.conversation_id
          ) {
            this.notifyListeners("reaction", {
              message_id: data.message_id,
              user_id: data.user_id,
              username: data.username!,
              emoji: data.emoji,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "reaction_removed":
          if (data.message_id && data.user_id && data.conversation_id) {
            this.notifyListeners("reaction_removed", {
              message_id: data.message_id,
              user_id: data.user_id,
              conversation_id: data.conversation_id,
            });
          }
          break;

        case "conversation_joined":
          if (data.conversation_id) {
            this.notifyListeners("conversation_joined", {
              conversation_id: data.conversation_id,
              has_unread: data.has_unread || false,
              online_users: data.online_users || [],
              timestamp: data.timestamp,
            });
          }
          break;

        case "conversation_left":
          if (data.conversation_id) {
            this.notifyListeners("conversation_left", {
              conversation_id: data.conversation_id,
              timestamp: data.timestamp,
            });
          }
          break;

        case "conversation_updated":
          if (data.conversation_id) {
            this.notifyListeners("conversation_updated", {
              conversation_id: data.conversation_id,
              data: data as any,
              timestamp: data.timestamp,
            });
          }
          break;

        case "error":
          this.notifyListeners("error", {
            error: data.error || "Unknown error",
            action: data.action,
            conversation_id: data.conversation_id,
          });
          break;

        default:
          console.warn(`⚠️ [Chat] Unknown message type: "${data.type}"`, data);
      }
    } catch (error) {
      console.error("Error parsing chat WebSocket message:", error);
    }
  }
}

// ============ CALL WEBSOCKET CLASS ============

class CallWebSocketAPI extends BaseWebSocketAPI<CallEventType, CallEventDataMap> {
  protected endpoint = "calls";

  constructor() {
    super([
      "connection_established",
      "pong",
      "error",
      "call_initiated",
      "incoming_call",
      "call_created",
      "call_answered",
      "join_call",
      "call_rejected",
      "call_ended",
      "call_signal",
      "ice_candidate",
      "call_room_joined",
      "call_room_left",
    ]);
  }

  // ============ CALL ACTIONS ============

  initiateCall(
    conversationId: string,
    callType: "audio" | "video",
    offerSdp: string
  ): void {
    this.send({
      action: "initiate_call",
      conversation_id: conversationId,
      call_type: callType,
      offer_sdp: offerSdp,
    });
  }

  answerCall(callId: string, answerSdp: string): void {
    this.send({
      action: "answer_call",
      call_id: callId,
      answer_sdp: answerSdp,
    });
  }

  joinCall(callId: string) {
    this.send({
      action: "join_call",
      call_id: callId,
    });
  }

  rejectCall(callId: string): void {
    this.send({
      action: "reject_call",
      call_id: callId,
    });
  }

  endCall(callId: string): void {
    this.send({
      action: "end_call",
      call_id: callId,
    });
  }

  sendCallSignal(callId: string, signal: any, targetUserId?: string): void {
    this.send({
      action: "call_signal",
      call_id: callId,
      signal,
      ...(targetUserId && { target_user_id: targetUserId }),
    });
  }

  sendIceCandidate(callId: string, candidate: any, targetUserId?: string): void {
    this.send({
      action: "ice_candidate",
      call_id: callId,
      candidate,
      ...(targetUserId && { target_user_id: targetUserId }),
    });
  }

  joinCallRoom(callId: string): void {
    this.send({
      action: "join_call_room",
      call_id: callId,
    });
  }

  leaveCallRoom(): void {
    this.send({
      action: "leave_call_room",
    });
  }

  // ============ MESSAGE HANDLER ============

  protected handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      const eventType = data.type as CallEventType;

      console.log(`🔍 [Call] Processing event type: "${eventType}"`, data);

      switch (eventType) {
        case "connection_established":
          this.notifyListeners("connection_established", {
            message: data.message || "Connected",
            user_id: data.user_id || "",
            username: data.username,
            timestamp: data.timestamp,
          });
          break;

        case "pong":
          this.missedHeartbeats = 0;
          this.notifyListeners("pong", {
            timestamp: data.timestamp || new Date().toISOString(),
          });
          break;

        case "call_initiated":  // ✅ ADDED: Handle backend's event name
          console.log('📞 [Call] Received call_initiated event');
          this.notifyListeners("call_initiated", {
            call_id: data.call_id!,
            caller_id: data.caller_id!,
            caller_username: data.caller_username!,
            call_type: data.call_type!,
            conversation_id: data.conversation_id!,
            offer_sdp: data.offer_sdp || "",
            is_caller: data.is_caller || false,
          });
          break;

        case "incoming_call":
          console.log('📞 [Call] Received incoming_call event');
          console.log('  - Call ID:', data.call_id);
          console.log('  - Caller:', data.caller_username);
          console.log('  - Is Caller:', data.is_caller);
          console.log('  - Offer SDP:', data.offer_sdp ? 'Present' : 'Missing');
          this.notifyListeners("incoming_call", {
            call_id: data.call_id!,
            caller_id: data.caller_id!,
            caller_username: data.caller_username!,
            call_type: data.call_type!,
            conversation_id: data.conversation_id!,
            offer_sdp: data.offer_sdp || "",
            is_caller: data.is_caller || false,  // ✅ CRITICAL FLAG
          });
          break;
       

        case "call_created":
          console.log('✅ [Call] Call created confirmation');
          this.notifyListeners("call_created", {
            call_id: data.call_id!,
            call_type: data.call_type!,
            status: data.status || "initiated",
          });
          break;

        case "call_answered":
          console.log('✅ [Call] Call answered confirmation');
          this.notifyListeners("call_answered", {
            call_id: data.call_id!,
            user_id: data.user_id!,
            username: data.username!,
            answer_sdp: data.answer_sdp || "",
          });
          break;

        case "join_call":
          console.log('✅ [Call] Call joined confirmation');
          this.notifyListeners("join_call", {
            call_id: data.call_id!,
            user_id: data.user_id!,
            username: data.username!,
          });
          break;

        case "call_rejected":
          console.log('❌ [Call] Call rejected confirmation');
          this.notifyListeners("call_rejected", {
            call_id: data.call_id!,
            user_id: data.user_id!,
            username: data.username!,
          });
          break;

        case "call_ended":
          console.log('⏹️ [Call] Call ended confirmation');
          this.notifyListeners("call_ended", {
            call_id: data.call_id!,
            user_id: data.user_id!,
            username: data.username!,
            duration: data.duration || 0,
          });
          break;

        case "call_signal":
          console.log('🔄 [Call] Call signal received');
          this.notifyListeners("call_signal", {
            call_id: data.call_id!,
            from_user_id: data.from_user_id!,
            signal: data.signal,
          });
          break;

        case "ice_candidate":
          console.log('🔄 [Call] ICE candidate received');
          this.notifyListeners("ice_candidate", {
            call_id: data.call_id!,
            from_user_id: data.from_user_id!,
            candidate: data.candidate,
          });
          break;

        case "call_room_joined":
          console.log('🚪 [Call] Call room joined confirmation');
          this.notifyListeners("call_room_joined", {
            call_id: data.call_id!,
          });
          break;

        case "call_room_left":
          console.log('🚪 [Call] Call room left confirmation');
          this.notifyListeners("call_room_left", {
            message: data.message || "Left call room",
          });
          break;

        case "error":
          console.log('❌ [Call] Error received');
          this.notifyListeners("error", {
            error: data.error || "Unknown error",
            action: data.action,
            conversation_id: data.conversation_id,
          });
          break;

        default:
          console.warn(`⚠️ [Call] Unknown message type: "${data.type}"`, data);
      }
    } catch (error) {
      console.error("Error parsing call WebSocket message:", error);
    }
  }
}

// ============ SINGLETON INSTANCES ============

let chatWSInstance: ChatWebSocketAPI | null = null;
let callWSInstance: CallWebSocketAPI | null = null;

/**
 * Get or create chat WebSocket instance
 */
export const getChatWebSocket = (): ChatWebSocketAPI => {
  if (!chatWSInstance) {
    chatWSInstance = new ChatWebSocketAPI();
  }
  return chatWSInstance;
};

/**
 * Get or create call WebSocket instance
 */
export const getCallWebSocket = (): CallWebSocketAPI => {
  if (!callWSInstance) {
    callWSInstance = new CallWebSocketAPI();
  }
  return callWSInstance;
};

export default getChatWebSocket;

// ============ TYPE EXPORTS ============

export type {
  ChatEventType,
  CallEventType,
  ChatEventDataMap,
  CallEventDataMap,
  ChatCallback,
  CallCallback,
  // Shared types
  ConnectionEstablishedData,
  PongData,
  ErrorData,
  // Chat types
  MessageData,
  MessageSentData,
  MessageEditedData,
  MessageDeletedData,
  TypingData,
  TypingSidebarData,
  UserStatusData,
  OnlineStatusData,
  ReadReceiptData,
  AllReadReceiptData,
  AllMessagesReadConfirmData,
  DeliveryReceiptData,
  UnreadCountData,
  UnreadCountUpdateData,
  ReactionData,
  ReactionRemovedData,
  ConversationJoinedData,
  ConversationLeftData,
  ConversationUpdatedData,
  // Call types
  CallInitiatedData,
  IncomingCallData,
  CallCreatedData,
  CallAnsweredData,
  JoinCallData,
  CallRejectedData,
  CallEndedData,
  CallSignalData,
  IceCandidateData,
  CallRoomJoinedData,
  CallRoomLeftData,
};

export { ChatWebSocketAPI, CallWebSocketAPI };