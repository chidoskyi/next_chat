"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Badge } from "@/src/components/ui/badge"
import { Video, Phone, MoreVertical, Search, ChevronLeft, Mic, Send, Smile, Camera, X, Reply } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  avatar?: string
  replyTo?: {
    id: string
    sender: string
    content: string
  }
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread?: number
  isTyping?: boolean
  isPinned?: boolean
  isGroup?: boolean
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Harry Maguire",
    avatar: "/man.jpg",
    lastMessage: "You need to improve now",
    timestamp: "09:12 AM",
    isPinned: true,
  },
  {
    id: "2",
    name: "United Family",
    avatar: "/diverse-group-friends.png",
    lastMessage: "Rashford is typing...",
    timestamp: "06:25 AM",
    isTyping: true,
    isGroup: true,
  },
  {
    id: "3",
    name: "Ramsus Højlund",
    avatar: "/man.jpg",
    lastMessage: "Bos, I need to talk today",
    timestamp: "03:11 AM",
    unread: 2,
  },
  {
    id: "4",
    name: "Andre Onana",
    avatar: "/diverse-man-portrait.png",
    lastMessage: "I need more time bos",
    timestamp: "11:34 AM",
  },
  {
    id: "5",
    name: "Regullon",
    avatar: "/man.jpg",
    lastMessage: "Great performance lad",
    timestamp: "09:12 AM",
  },
  {
    id: "6",
    name: "Bruno Fernandes",
    avatar: "/diverse-man-portrait.png",
    lastMessage: "Play the game Bruno !",
    timestamp: "10:21 AM",
  },
]

const messages: Message[] = [
  {
    id: "1",
    sender: "Harry Maguire",
    content: "Hey lads, tough game yesterday. Let's talk about what went wrong and how we can improve.",
    timestamp: "08:34 AM",
    isOwn: false,
    avatar: "/man.jpg",
  },
  {
    id: "2",
    sender: "Bruno Fernandes",
    content: "Agreed, Harry. We had some good moments, but we need to be more clinical in front of the goal.",
    timestamp: "08:34 AM",
    isOwn: false,
    avatar: "/diverse-man-portrait.png",
  },
  {
    id: "3",
    sender: "You",
    content:
      "We need to control the midfield and exploit their defensive weaknesses. Bruno and Paul, I'm counting on your creativity. Marcus and Jadon, stretch their defense wide. Use your pace and take on their full-backs.",
    timestamp: "08:34 AM",
    isOwn: true,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[1])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  return (
    <div className="min-h-screen flex bg-background lg:ml-64">
      {/* Sidebar - Conversations List */}
      <aside
        className={cn(
          "w-full md:w-96 lg:w-96 border-r border-border flex flex-col bg-background",
          showMobileChat && "hidden md:flex",
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="Erik Ten Hag" />
                <AvatarFallback>ET</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">Erik Ten Hag</h2>
                <p className="text-xs text-muted-foreground">Info account</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 text-sm">
            <button className="font-semibold text-blue-500 border-b-2 border-blue-500 pb-2">All</button>
            <button className="text-muted-foreground pb-2">Personal</button>
            <button className="text-muted-foreground pb-2">Groups</button>
          </div>
        </div>

        {/* Pinned Messages */}
        <div className="border-b border-border">
          <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Pinned Message</span>
            <span>📌</span>
          </div>
          {conversations
            .filter((c) => c.isPinned)
            .map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation)
                  setShowMobileChat(true)
                }}
              />
            ))}
        </div>

        {/* Messages List */}
        <div className="px-4 py-2 text-sm text-muted-foreground">Messages</div>
        <ScrollArea className="flex-1">
          {conversations
            .filter((c) => !c.isPinned)
            .map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation)
                  setShowMobileChat(true)
                }}
              />
            ))}
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <main className={cn("flex-1 flex flex-col", !showMobileChat && "hidden md:flex")}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileChat(false)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={selectedConversation.avatar || "/placeholder.svg"}
                    alt={selectedConversation.name}
                  />
                  <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold flex items-center gap-1">
                    {selectedConversation.name}
                    {selectedConversation.isGroup && <span className="text-xs text-muted-foreground">🛡️</span>}
                  </h3>
                  {selectedConversation.isTyping && <p className="text-xs text-green-500">Rashford is typing...</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="text-center text-xs text-muted-foreground mb-4">Today</div>
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex gap-3 group", message.isOwn && "flex-row-reverse")}>
                    {!message.isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                        <AvatarFallback>{message.sender[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("flex flex-col", message.isOwn && "items-end")}>
                      {!message.isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{message.sender}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 max-w-md",
                          message.isOwn
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm",
                        )}
                      >
                        {message.replyTo && (
                          <div
                            className={cn(
                              "border-l-2 pl-2 mb-2 text-xs opacity-70",
                              message.isOwn ? "border-white" : "border-foreground",
                            )}
                          >
                            <div className="font-semibold">{message.replyTo.sender}</div>
                            <div className="truncate">{message.replyTo.content}</div>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.isOwn && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          <span className="text-xs text-blue-500">✓✓</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => setReplyingTo(message)}
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="max-w-4xl mx-auto">
                {replyingTo && (
                  <div className="mb-3 bg-muted/50 rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="flex items-start gap-2">
                      <Reply className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-blue-500 mb-0.5">
                          Replying to {replyingTo.sender}
                        </div>
                        <div className="text-sm text-foreground line-clamp-2">{replyingTo.content}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-background"
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Camera className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    className="flex-1"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  {messageInput.trim() ? (
                    <Button size="icon" className="instagram-gradient text-white shrink-0">
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-sm">Send private messages to a friend or group.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors",
        isSelected && "bg-accent",
      )}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
        </Avatar>
        {conversation.isTyping && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm truncate">{conversation.name}</span>
          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
        </div>
        <p
          className={cn(
            "text-sm truncate",
            conversation.isTyping ? "text-green-500" : "text-muted-foreground",
            conversation.unread && "font-semibold text-foreground",
          )}
        >
          {conversation.lastMessage}
        </p>
      </div>
      {conversation.unread && (
        <Badge
          variant="destructive"
          className="bg-red-500 text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs"
        >
          {conversation.unread}
        </Badge>
      )}
    </button>
  )
}
