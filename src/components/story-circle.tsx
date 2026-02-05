import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Plus } from "lucide-react"

interface StoryCircleProps {
  username: string
  avatar: string
  hasStory?: boolean
  isYourStory?: boolean
}

export function StoryCircle({ username, avatar, hasStory = true, isYourStory = false }: StoryCircleProps) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px]">
      <div className="relative">
        {hasStory && !isYourStory && (
          <div className="absolute inset-0 instagram-gradient rounded-full p-[2px]">
            <div className="w-full h-full bg-background rounded-full"></div>
          </div>
        )}
        <div className={`relative ${hasStory && !isYourStory ? "p-[3px]" : ""}`}>
          <Avatar className="w-16 h-16 border-2 border-background">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {isYourStory && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
              <Plus className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-center truncate w-full">{username}</span>
    </div>
  )
}
