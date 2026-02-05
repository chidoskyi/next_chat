// hooks/useMessages.ts - FIXED VERSION
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMessages,
  selectCurrentConversation,
  setReplyingTo,
  selectReplyingTo,
  markConversationRead,
  addMessage,
  sendMessage as sendMessageThunk,
  removeMessage,
  setUploadProgress,
  clearUploadProgress,
} from "@/src/store/slices/messageSlice";
import Cookies from "js-cookie";
import { useWebSocket } from "./useWebSocket";
import { selectCurrentUser } from "../store/slices/authSlice";
import { toast } from "./use-toast";

export const useMessages = (token: string | null) => {
  const dispatch = useDispatch();
  const { chat: ws } = useWebSocket(token);
  const currentConversation = useSelector(selectCurrentConversation);
  const currentUser = useSelector(selectCurrentUser); 
  const currentUserId = currentUser?.id;
  const conversationId = currentConversation?.id || "";
  const messages = useSelector((state: any) =>
    selectMessages(conversationId)(state),
  );
  const replyingTo = useSelector(selectReplyingTo);

  useEffect(() => {
    if (conversationId && ws) {
      console.log('📖 Conversation opened, sending mark_all_read to server:', conversationId)
      
      // ONLY send to server - let server tell us what got marked
      ws.markAllMessagesRead(conversationId)
    }
  }, [conversationId, ws])

  // Send message with optimistic update
  const sendMessage = useCallback(
    async (
      text: string,
      replyToId?: string,
      messageType: "text" | "image" | "video" | "audio" | "document" = "text",
      media?: File,
    ) => {
      if (!conversationId) return;
      if (!text.trim() && !media) return;

      const tempId = `temp-${Date.now()}-${Math.random()}`;

      console.log("📤 Sending message:", { 
        text, 
        messageType,
        hasMedia: !!media,
        mediaSize: media?.size
      });

      // 1. Create optimistic message
      const optimisticMessage = {
        id: tempId,
        conversation: conversationId,
        sender: {
          id: currentUserId || "",
          username: currentUser?.username || "You",
          display_name: currentUser?.username || "You",
          email: currentUser?.email || "",
          avatar: null,
          is_active: true,
          is_online: true,
          last_seen: "online",
          email_verified: false,
          date_joined: new Date().toISOString(),
        },
        message_type: messageType,
        body: text.trim() || "", // ✅ Empty for media-only
        media: null,
        media_url: media ? URL.createObjectURL(media) : null,
        thumbnail_url: null,
        media_duration: null,
        media_size: media?.size || null,
        location_latitude: null,
        location_longitude: null,
        location_name: "",
        reply_to: replyToId || null,
        reply_to_message: replyToId
          ? messages.find((m: any) => m.id === replyToId) || null
          : null,
        forwarded_from: null,
        forwarded_from_message: null,
        forward_count: 0,
        is_edited: false,
        is_deleted: false,
        deleted_for_everyone: false,
        deleted_at: null,
        read_by: [],
        reactions: [],
        is_delivered: false,
        is_read: false,
        status: "sending" as const,
        is_starred_by_me: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch(addMessage({ conversationId, message: optimisticMessage as any }));
      console.log("✅ Optimistic message added");

      // 2. Send message
      if (media) {
        console.log("📎 Uploading media via API...");
        
        try {
          // ✅ Track progress during upload
          const result = await dispatch(
            sendMessageThunk({
              conversationId,
              body: text || "",
              messageType,
              media,
              replyTo: replyToId,
              tempId, // ✅ Pass tempId
              onProgress: (progress) => {
                // ✅ Update progress in Redux
                dispatch(setUploadProgress({ messageId: tempId, progress }));
              },
            }) as any
          ).unwrap();
          
          console.log("✅ Media uploaded successfully:", result);
          
          // Clear progress
          dispatch(clearUploadProgress(tempId));
          
        } catch (error) {
          console.error("❌ Failed to upload media:", error);
          
          // Remove optimistic message
          dispatch(removeMessage({ conversationId, messageId: tempId }));
          dispatch(clearUploadProgress(tempId));
          
          toast({
            title: "Upload failed",
            description: "Could not send media message",
            variant: "destructive"
          });
        }
      } else {
        // Text message via WebSocket
        console.log("🌐 Sending text via WebSocket...");
        ws.sendMessage(conversationId, text.trim(), replyToId);
      }

      if (replyingTo) {
        dispatch(setReplyingTo(null));
      }
    },
    [conversationId, ws, replyingTo, dispatch, currentUserId, currentUser, messages, toast],
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      console.log("⌨️ Sending typing indicator:", isTyping);
      ws.sendTyping(conversationId, isTyping);
    },
    [conversationId, ws],
  );

  // Mark message as read
  const markMessageRead = useCallback(
    (messageId: string) => {
      if (!conversationId) return;
      console.log("👀 Marking message as read:", messageId);
      ws.markMessageRead(conversationId, messageId);
    },
    [conversationId, ws],
  );

  // Mark all messages as read
  const markAllRead = useCallback(() => {
    if (!conversationId) return;
    console.log("✅ Marking all messages as read");
    ws.markAllMessagesRead(conversationId);
    dispatch(markConversationRead(conversationId));
  }, [conversationId, ws, dispatch]);

  // React to message
  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      console.log("❤️ Reacting to message:", { messageId, emoji });
      ws.reactToMessage(messageId, emoji);
    },
    [ws],
  );

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: string) => {
      console.log("💔 Removing reaction from message:", messageId);
      ws.removeReaction(messageId);
    },
    [ws],
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string, deleteForEveryone = false) => {
      console.log("🗑️ Deleting message:", { messageId, deleteForEveryone });
      ws.deleteMessage(messageId, deleteForEveryone);
    },
    [ws],
  );

  // Edit message
  const editMessage = useCallback(
    (messageId: string, newBody: string) => {
      console.log("✏️ Editing message:", { messageId, newBody });
      ws.editMessage(messageId, newBody);
    },
    [ws],
  );

  // Set reply
  const setReply = useCallback(
    (message: any) => {
      console.log("💭 Setting reply to:", message.id);
      dispatch(setReplyingTo(message));
    },
    [dispatch],
  );

  // Cancel reply
  const cancelReply = useCallback(() => {
    console.log("❌ Cancelling reply");
    dispatch(setReplyingTo(null));
  }, [dispatch]);

  return {
    messages,
    replyingTo,
    sendMessage,
    sendTyping,
    markMessageRead,
    markAllRead,
    reactToMessage,
    removeReaction,
    deleteMessage,
    editMessage,
    setReply,
    cancelReply,
  };
};
