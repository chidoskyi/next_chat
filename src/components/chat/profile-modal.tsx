import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import { Phone, Search, Trash2, Video, X } from "lucide-react"
import { Conversation } from "@/src/types/message"

interface ProfileModalProps {
  conversation: Conversation | null
  isOpen: boolean
  onClose: () => void
  onVoiceCall: () => void
  onVideoCall: () => void
}

export function ProfileModal({ conversation, isOpen, onClose, onVoiceCall, onVideoCall }: ProfileModalProps) {
  if (!conversation) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-4">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src={conversation.other_user?.profile?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-4xl">{conversation.name[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold mb-1">{conversation.name}</h2>
          <p className="text-muted-foreground mb-6">{conversation.other_user?.email || "+1 234 567 890"}</p>

          <div className="w-full space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">About</p>
              <p>{conversation.other_user?.profile?.bio || "Hey there! I am using ChatApp"}</p>
            </div>

            <div className="flex justify-center gap-8">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => {
                  onClose()
                  onVoiceCall()
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">Call</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => {
                  onClose()
                  onVideoCall()
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">Video</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">Search</span>
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Block {conversation.name}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Report {conversation.name}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}