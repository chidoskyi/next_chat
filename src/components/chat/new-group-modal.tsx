import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Search, Loader2, X, CheckCircle } from "lucide-react"
import { Conversation } from "@/src/types/message"
import { useAppDispatch, useAppSelector } from "@/src/store/hooks"
import { searchUsers, selectSearchResults, selectSearchLoading, clearSearchResults } from "@/src/store/slices/authSlice"
import { createConversation } from "@/src/store/slices/messageSlice"
import { useState, useEffect } from "react"
import { useDebounce } from "@/src/hooks/useDebounce"
import { SearchUser } from "@/src/types"

interface NewGroupModalProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
}

export function NewGroupModal({ isOpen, onClose, conversations }: NewGroupModalProps) {
  const dispatch = useAppDispatch()
  const searchResults = useAppSelector(selectSearchResults)
  const searchLoading = useAppSelector(selectSearchLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([])
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
      setGroupName("")
      setSelectedUsers([])
      dispatch(clearSearchResults())
    }
  }, [isOpen, dispatch])

  const toggleUserSelection = (user: SearchUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev.filter(u => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }

  const removeSelectedUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const isUserSelected = (userId: number) => {
    return selectedUsers.some(u => u.id === userId)
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return
    }

    try {
      await dispatch(createConversation({ 
        participantIds: selectedUsers.map(u => u.id.toString()),
        type: "group"
      })).unwrap()
      
      onClose()
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }

  // Get existing direct conversation users and map to SearchUser format
  const existingUsers: SearchUser[] = conversations
    .filter(c => c.type === 'direct' && c.other_user)
    .map(c => {
      const otherUser = c.other_user!
      return {
        id: typeof otherUser.id === 'string' ? parseInt(otherUser.id) : otherUser.id,
        username: otherUser.username,
        display_name: otherUser.display_name || otherUser.username,
        avatar: otherUser.profile?.avatar || null,
        bio: otherUser.profile?.bio || null,
        email_verified: otherUser.email_verified || false,
      } as SearchUser
    })

  const displayResults = searchQuery.trim() ? searchResults?.results : existingUsers

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Group name" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          
          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-accent/50 rounded-lg">
              {selectedUsers.map(user => (
                <div 
                  key={user.id}
                  className="flex items-center gap-1 bg-background px-2 py-1 rounded-full text-sm"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                  <button
                    onClick={() => removeSelectedUser(user.id)}
                    className="ml-1 hover:bg-accent rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users to add" 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayResults && displayResults.length > 0 ? (
              displayResults.map((user) => {
                const selected = isUserSelected(user.id)
                return (
                  <label 
                    key={user.id} 
                    className="flex items-center gap-3 w-full p-2 hover:bg-accent rounded-lg cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selected}
                      onChange={() => toggleUserSelection(user)}
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{user.username}</span>
                        {user.email_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      {user.display_name && user.display_name !== user.username && (
                        <span className="text-sm text-muted-foreground">{user.display_name}</span>
                      )}
                      {user.bio && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{user.bio}</span>
                      )}
                    </div>
                  </label>
                )
              })
            ) : searchQuery.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Search for users to add to the group
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-[#25D366] hover:bg-[#128C7E]"
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0}
          >
            Create Group {selectedUsers.length > 0 && `(${selectedUsers.length} members)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}