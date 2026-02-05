import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { Conversation } from "@/src/types/message"
import { useAppDispatch, useAppSelector } from "@/src/store/hooks"
import { searchUsers, selectSearchResults, selectSearchLoading, clearSearchResults } from "@/src/store/slices/authSlice"
import { createConversation } from "@/src/store/slices/messageSlice"
import { useState, useEffect } from "react"
import { useDebounce } from "@/src/hooks/useDebounce"

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
}

export function NewChatModal({ isOpen, onClose, conversations, onSelectConversation }: NewChatModalProps) {
  const dispatch = useAppDispatch()
  const searchResults = useAppSelector(selectSearchResults)
  const searchLoading = useAppSelector(selectSearchLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      dispatch(searchUsers({ q: debouncedSearchQuery }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [debouncedSearchQuery, dispatch])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
      dispatch(clearSearchResults())
    }
  }, [isOpen, dispatch])

  const handleCreateConversation = async (userId: number) => {
    try {
      const result = await dispatch(createConversation({ 
        participantIds: [userId.toString()], 
        type: "direct" 
      })).unwrap()
      
      onSelectConversation(result)
      onClose()
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const displayResults = searchQuery.trim() ? searchResults?.results : []
  const showExistingConversations = !searchQuery.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or username" 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayResults && displayResults.length > 0 ? (
              displayResults.map((user) => (
                <button
                  key={user.id}
                  className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg"
                  onClick={() => handleCreateConversation(user.id)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{user.username}</span>
                    {user.display_name && (
                      <span className="text-sm text-muted-foreground">{user.display_name}</span>
                    )}
                  </div>
                </button>
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : showExistingConversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg"
                  onClick={() => {
                    onSelectConversation(conv)
                    onClose()
                  }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conv.other_user?.profile?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{conv.name}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No conversations yet. Search for users to start chatting.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}