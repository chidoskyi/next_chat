"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import Cookies from "js-cookie";

// Components
import { Sidebar } from "@/src/components/chat/sidebar";
import { MessageBubble } from "@/src/components/chat/message-bubble";
import { MessageInput } from "@/src/components/chat/message-input";
import { CallModal } from "@/src/components/chat/call-modal";
import { StatusViewer } from "@/src/components/chat/status-viewer";
import { ProfileModal } from "@/src/components/chat/profile-modal";
import { NewChatModal } from "@/src/components/chat/new-chat-modal";
import { NewGroupModal } from "@/src/components/chat/new-group-modal";
import { ChatHeader } from "@/src/components/chat/chat-header";

// Hooks
import { useAppDispatch } from "@/src/store/hooks";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { useConversations } from "@/src/hooks/useConversation";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus.ts";
import { useMessages } from "@/src/hooks/useMessages";
import { useTypingIndicator } from "@/src/hooks/useTypingIndicator";
import { useCalls } from "@/src/hooks/useCalls";

// Redux
import {
  selectCurrentConversation,
  selectTypingUsers,
  fetchMessages,
  fetchConversations,
  setCurrentUser,
} from "@/src/store/slices/messageSlice";

// Types & Data
import { statuses, emojiReactions, Status } from "@/src/data";
import type { Message } from "@/src/types/message";
import { cn } from "@/src/lib/utils";
import { selectCurrentUser } from "@/src/store/slices/authSlice";
import { WebSocketDebugPanel } from "@/src/components/chat/WebSocketDebugPanel";
import { useAudioPlayer } from "@/src/hooks/useAudioPlayer";
import { toast } from "@/src/hooks/use-toast"

export default function ChatsPage() {
  // ============ STATE ============
  const dispatch = useAppDispatch();
  const token = Cookies.get("accessToken");
  const currentUser = useSelector(selectCurrentUser)
  // ✅ Get current user ID from cookies
  const userData = Cookies.get("user_data");
  const currentUserId = userData ? JSON.parse(userData).id : null;
    useEffect(() => {
    if (currentUser) {
      dispatch(setCurrentUser(currentUser))
    }
  }, [currentUser, dispatch])

  console.log("currentUserId", currentUserId);

  // UI State
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  // const [showCallModal, setShowCallModal] = useState<"voice" | "video" | null>(null);
  const [showStatusViewer, setShowStatusViewer] = useState<Status | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============ HOOKS ============

  const MessageDebugger = ({ messages, conversationId }: any) => {
  useEffect(() => {
    console.log('🔍 Message Debugger:', {
      conversationId,
      messageCount: messages.length,
      messageIds: messages.map((m: any) => m.id),
      messages: messages.map((m: any) => ({
        id: m.id,
        body: m.body,
        sender: m.sender.username
      }))
    })
  }, [messages, conversationId])
  
  return null
}

  // WebSocket connection
  const { chat: ws } = useWebSocket(token || null);

  // Conversations
  const { conversations, totalUnreadCount, selectConversation } = useConversations();
  const currentConversation = useSelector(selectCurrentConversation);

  // Messages with optimistic updates
  const {
    messages,
    replyingTo,
    sendMessage,
    sendTyping,
    markMessageRead,
    markAllRead,
    reactToMessage: reactToMsg,
    removeReaction: removeReact,
    deleteMessage: deleteMsg,
    editMessage,
    setReply,
    cancelReply,
  } = useMessages(token || null);

  // Typing indicator
  const { handleTyping, typingUserNames } = useTypingIndicator(sendTyping);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Get typing users for current conversation
  const conversationId = currentConversation?.id || "";
  const typingUsers = useSelector(selectTypingUsers(conversationId));
  const currentVoiceMessage = messages.find(m => m.id === playingVoiceId);

  const audioState = useAudioPlayer(
    currentVoiceMessage?.media_url || null,
    !!playingVoiceId,
    () => setPlayingVoiceId(null)
  );

  // Online status
  const { isUserOnline } = useOnlineStatus();

  // Calls (audio/video)
  const { 
    currentCall, 
    incomingCall, 
    startCall, 
    hangUp,
    acceptCall,       // ← add
    rejectCall,       // ← add
    localStream,      // ← add
    remoteStream,     // ← add
    isLocalVideoEnabled,  // ← add
    isLocalAudioEnabled,  // ← add
    connectionState,      // ← add
    toggleVideo,          // ← add
    toggleAudio,          // ← add
    switchCamera,         // ← add
  } = useCalls(token || null);

  // ============ EFFECTS ============

  // Add this function to scroll to bottom
  const handleScroll = useCallback(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    // Show button if not at bottom (with a 200px threshold)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollToBottom(!isAtBottom);
  }, []);

  // Add this effect to handle initial scroll position and resize
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    // Initial check
    handleScroll();

    // Also check on resize
    const observer = new ResizeObserver(() => {
      handleScroll();
    });

    observer.observe(messagesContainer);

    return () => {
      observer.disconnect();
    };
  }, [handleScroll, messages]);

  // Add scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages({ conversationId: currentConversation.id }) as any);
    }
  }, [currentConversation?.id, dispatch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      markAllRead();
    }
  }, [currentConversation?.id]);

  // ============ HANDLERS ============

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;

    const messageType = selectedFile
      ? selectedFile.type.startsWith("image")
        ? "image"
        : selectedFile.type.startsWith("video")
          ? "video"
          : selectedFile.type.startsWith("audio")
            ? "audio"
            : "document"
      : "text";

    // Send with optimistic update
    await sendMessage(
      messageInput || `[${messageType.toUpperCase()}]`,
      replyingTo?.id,
      messageType,
      selectedFile || undefined,
    );

    setMessageInput("");
    setSelectedFile(null);
  };

  const handleMessageInputChange = (value: string) => {
    setMessageInput(value);
    handleTyping();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentConversation) return;

    setSelectedFile(file);

    // Show preview
    toast({
      title: "File selected",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    });
  };

 

  const togglePlayVoice = (messageId: string) => {
    setPlayingVoiceId(playingVoiceId === messageId ? null : messageId);
  };

  const addReaction = (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId);
    const currentUserReaction = message?.reactions.find(
      (r) => r.emoji === emoji && r.user.id === currentUserId,
    );

    if (currentUserReaction) {
      removeReact(messageId);
    } else {
      reactToMsg(messageId, emoji);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleConversationSelect = (conversation: (typeof conversations)[0]) => {
    selectConversation(conversation as any);
    setShowMobileChat(true);
  };

  const handleReply = (message: Message) => {
    setReply(message);
  };

  // ============ CALL HANDLERS ============

  const handleInitiateCall = async (callType: "audio" | "video") => {
    if (!currentConversation) return;

    try {
      console.log('🎬 Page: Initiating call', { callType, conversationId: currentConversation.id });
      
      await startCall(currentConversation.id, callType);

      toast({
        title: `${callType === "audio" ? "Voice" : "Video"} call started`,
        description: `Calling ${currentConversation.name}...`,
      });
    } catch (error) {
      console.error('❌ Page: Failed to initiate call:', error);
      toast({
        title: "Call failed",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ End call - simplified
  const handleEndCall = async () => {
    const activeCall = currentCall || incomingCall;
    
    if (activeCall) {
      console.log('🎬 Page: Ending call', activeCall.id);
      await hangUp(activeCall.id);
    }

    toast({
      title: "Call ended",
      description: "The call has been terminated",
    });
  };


  useEffect(() => {
    if (currentConversation?.id) {
      // Fetch initial messages from API
      dispatch(fetchMessages({ conversationId: currentConversation.id, page: 1 }) as any);
    }
  }, [currentConversation?.id, dispatch]);


  useEffect(() => {
    dispatch(fetchConversations() as any);
  }, [dispatch]);

  // ============ RENDER ============

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* <WebSocketDebugPanel /> */}
      <MessageDebugger messages={messages} conversationId={conversationId} />
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        statuses={statuses}
        selectedConversation={currentConversation}
        showMobileChat={showMobileChat}
        onConversationSelect={handleConversationSelect}
        onStatusClick={setShowStatusViewer}
        onNewChat={() => setShowNewChatModal(true)}
        onNewGroup={() => setShowNewGroupModal(true)}
      />

      {/* Chat Area */}
<main
  className={cn(
    "flex-1 flex flex-col bg-[#ECE5DD] h-full relative",
    !showMobileChat && "hidden md:flex",
  )}
>
  {currentConversation ? (
    <>
      <ChatHeader
        conversation={currentConversation}
        onBack={() => setShowMobileChat(false)}
        onVideoCall={() => handleInitiateCall("video")}
        onVoiceCall={() => handleInitiateCall("audio")}
        onProfileClick={() => setShowProfileModal(true)}
        showBackButton
      />

      {/* Messages */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        <div className="max-w-8xl mx-auto space-y-2">
          <div className="flex justify-center mb-4">
            <span className="bg-white/80 text-xs text-muted-foreground px-3 py-1 rounded-lg shadow-sm">
              Today
            </span>
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex gap-2 items-end mb-2">
              <div className="bg-white rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {typingUserNames.join(", ")}{" "}
                {typingUserNames.length > 1 ? "are" : "is"} typing...
              </span>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              currentUserId={currentUserId}
              message={message}
              playingVoiceId={playingVoiceId}
              audioProgress={message.id === playingVoiceId ? audioState.progress : 0} // 🔥 NEW
              audioCurrentTime={message.id === playingVoiceId ? audioState.currentTime : 0}
              emojiReactions={emojiReactions}
              onReactionAdd={addReaction}
              onReply={handleReply}
              onCopy={copyMessage}
              onDelete={(id) => deleteMsg(id, false)}
              onTogglePlayVoice={togglePlayVoice}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button - appears when not at bottom */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <MessageInput
        messageInput={messageInput}
        replyingTo={replyingTo}
        selectedFile={selectedFile}
        onMessageChange={handleMessageInputChange}
        onSend={handleSendMessage}
        onEmojiSelect={(emoji) => setMessageInput((prev) => prev + emoji)}
        onFileSelect={handleFileSelect}
        onCancelReply={cancelReply}
        onMediaClick={() => fileInputRef.current?.click()}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />
    </>
  ) : (
    <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
      <div className="text-center max-w-md">
        <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 rounded-full flex items-center justify-center">
          <MessageCircle className="w-24 h-24 text-[#25D366]" />
        </div>
        <h3 className="text-2xl font-light text-gray-600 mb-2">ChatApp Web</h3>
        <p className="text-sm text-muted-foreground">
          Send and receive messages without keeping your phone online.
          <br />
          Use ChatApp on up to 4 linked devices and 1 phone at the same time.
        </p>
        {totalUnreadCount > 0 && (
          <div className="mt-4">
            <span className="text-sm text-[#25D366] font-semibold">
              {totalUnreadCount} unread message{totalUnreadCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )}
</main>

      {/* Modals */}
      <CallModal
        conversation={currentConversation}
        currentCall={currentCall}
        incomingCall={incomingCall}
        localStream={localStream}
        remoteStream={remoteStream}
        isLocalVideoEnabled={isLocalVideoEnabled}
        isLocalAudioEnabled={isLocalAudioEnabled}
        connectionState={connectionState}
        onClose={handleEndCall}
        onAcceptCall={acceptCall}
        onRejectCall={rejectCall}
        onHangUp={hangUp}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onSwitchCamera={switchCamera}
      />

      <StatusViewer status={showStatusViewer} onClose={() => setShowStatusViewer(null)} />

      <ProfileModal
        conversation={currentConversation}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onVoiceCall={() => {
          setShowProfileModal(false);
          handleInitiateCall("audio");
        }}
        onVideoCall={() => {
          setShowProfileModal(false);
          handleInitiateCall("video");
        }}
      />

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        conversations={conversations}
        onSelectConversation={(conv) => {
          handleConversationSelect(conv);
          setShowNewChatModal(false);
        }}
      />

      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        conversations={conversations}
      />
    </div>
  );
}