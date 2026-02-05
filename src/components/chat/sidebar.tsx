// components/chat/sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Bell, MessageCircle, MoreVertical, Phone, Plus, Search, Users, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { ConversationItem } from "./conversation-item"
import { StatusRow } from "./status-row"
import type { Conversation } from "@/src/types/message"
import type { Status } from "@/src/data"
import { useSelector } from "react-redux"
import { selectTotalUnreadCount } from "@/src/store/slices/messageSlice"
import { profile } from "console"

interface SidebarProps {
  conversations: Conversation[]
  statuses: Status[]
  selectedConversation: Conversation | null
  showMobileChat: boolean
  onConversationSelect: (conversation: Conversation) => void
  onStatusClick: (status: Status) => void
  onNewChat: () => void
  onNewGroup: () => void
}

export function Sidebar({
  conversations,
  statuses,
  selectedConversation,
  showMobileChat,
  onConversationSelect,
  onStatusClick,
  onNewChat,
  onNewGroup,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "status" | "calls">("chats")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Get total unread count from Redux
  const totalUnreadCount = useSelector(selectTotalUnreadCount)
  
// Filter conversations based on search
const filteredConversations = conversations.filter(conv => {
  const name = conv.type === 'direct' && conv.other_user 
    ? conv.other_user.username 
    : conv.name;
  return name.toLowerCase().includes(searchQuery.toLowerCase())
})

  return (
    <aside
      className={cn(
        "w-full md:w-96 lg:w-[420px] border-r border-border flex flex-col bg-background h-full",
        showMobileChat && "hidden md:flex"
      )}
    >
      {/* Header */}
      <div className="p-4 bg-[#075E54] text-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">ChatApp</h1>
          <div className="flex items-center gap-1">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
                  <Bell className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-semibold">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-2 font-semibold border-b">
                  Notifications ({totalUnreadCount})
                </div>
                <ScrollArea className="max-h-64">
                  {conversations
                    .filter(c => c.unread_count > 0)
                    .map(conv => (
                      <DropdownMenuItem 
                        key={conv.id}
                        className="flex items-start gap-2 p-3 cursor-pointer"
                        onClick={() => onConversationSelect(conv)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={conv.other_user?.profile?.avatar || conv.icon_url || undefined} />
                          <AvatarFallback>
                            {conv.type === 'direct' && conv.other_user
                              ? conv.other_user.username[0].toUpperCase()
                              : conv.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conv.type === 'direct' && conv.other_user
                              ? conv.other_user.username
                              : conv.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message?.body || 'New message'}
                          </p>
                        </div>
                        <Badge className="bg-[#25D366] text-white shrink-0">
                          {conv.unread_count}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  {totalUnreadCount === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Search className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onNewChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onNewGroup}>
                  <Users className="w-4 h-4 mr-2" />
                  New group
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="w-4 h-4 mr-2" />
                  Linked devices
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/chat-settings">
                    <MoreVertical className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-500">
                  <Link href="/login">
                    <X className="w-4 h-4 mr-2" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {(["chats", "status", "calls"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-sm font-medium border-b-2 transition-colors uppercase",
                activeTab === tab ? "border-white" : "border-transparent text-white/70"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "chats" && (
        <div className="flex-1 flex flex-col min-h-0">
          <StatusRow statuses={statuses} onStatusClick={onStatusClick} />

          {/* Search */}
          <div className="p-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search or start new chat" 
                className="pl-10 bg-muted border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation?.id === conversation.id}
                  onClick={() => onConversationSelect(conversation)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {activeTab === "status" && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="My Status" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center border-2 border-background">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">My Status</h3>
                <p className="text-sm text-muted-foreground">Tap to add status update</p>
              </div>
            </div>

            <h4 className="text-sm font-medium text-[#25D366] mb-3">Recent updates</h4>
            {statuses
              .filter((s) => !s.isOwn && !s.isViewed)
              .map((status) => (
                <button
                  key={status.id}
                  className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg"
                  onClick={() => onStatusClick(status)}
                >
                  <div className="rounded-full p-0.5 bg-gradient-to-tr from-[#25D366] to-[#128C7E]">
                    <div className="bg-background rounded-full p-0.5">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={status.avatar || "/placeholder.svg"} alt={status.name} />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{status.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {status.statusImages.length} updates - Today, 10:30 AM
                    </p>
                  </div>
                </button>
              ))}

            <h4 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Viewed updates</h4>
            {statuses
              .filter((s) => !s.isOwn && s.isViewed)
              .map((status) => (
                <button
                  key={status.id}
                  className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg"
                  onClick={() => onStatusClick(status)}
                >
                  <div className="rounded-full p-0.5 bg-gray-400">
                    <div className="bg-background rounded-full p-0.5">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={status.avatar || "/placeholder.svg"} alt={status.name} />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{status.name}</h3>
                    <p className="text-sm text-muted-foreground">Yesterday, 8:45 PM</p>
                  </div>
                </button>
              ))}
          </div>
        </ScrollArea>
      )}

      {activeTab === "calls" && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 p-2 hover:bg-accent rounded-lg cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Create call link</h3>
                <p className="text-sm text-muted-foreground">Share a link for your call</p>
              </div>
            </div>

            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent</h4>
            {conversations.slice(0, 4).map((conv) => (
              <div key={conv.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={conv.type === 'direct' && conv.other_user 
                      ? conv.other_user.profile?.avatar || undefined 
                      : conv.icon_url || undefined
                    } 
                    alt={conv.type === 'direct' && conv.other_user 
                      ? conv.other_user.username 
                      : conv.name
                    } 
                  />
                  <AvatarFallback>
                    {conv.type === 'direct' && conv.other_user
                      ? conv.other_user.username[0].toUpperCase()
                      : conv.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {conv.type === 'direct' && conv.other_user
                      ? conv.other_user.username
                      : conv.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Yesterday, 9:30 PM</p>
                </div>
                <Phone className="w-5 h-5 text-[#25D366]" />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* FAB */}
      <div className="absolute bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] shadow-lg"
          onClick={onNewChat}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </aside>
  )
}