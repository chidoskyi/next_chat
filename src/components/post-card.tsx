import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"

interface PostCardProps {
  username: string
  avatar: string
  image: string
  likes: number
  caption: string
  verified?: boolean
}

export function PostCard({ username, avatar, image, likes, caption, verified = false }: PostCardProps) {
  return (
    <article className="bg-card border-b border-border md:border md:rounded-lg md:mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{username}</span>
            {verified && (
              <Badge variant="secondary" className="w-4 h-4 p-0 flex items-center justify-center bg-blue-500">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square bg-muted">
        <img src={image || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Post Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
              <Heart className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Send className="w-6 h-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="w-6 h-6" />
          </Button>
        </div>

        {/* Likes */}
        <div className="font-semibold text-sm">{likes.toLocaleString()} likes</div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{username}</span>
          <span className="text-foreground">{caption}</span>
        </div>
      </div>
    </article>
  )
}
