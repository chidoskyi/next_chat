import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention"
  user: {
    name: string
    username: string
    avatar: string
  }
  content?: string
  timestamp: string
  postImage?: string
  isRead: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Ryujin",
      username: "ryujin",
      avatar: "/diverse-woman-portrait.png",
    },
    timestamp: "2h ago",
    postImage: "/abstract-geometric-shapes.png",
    isRead: false,
  },
  {
    id: "2",
    type: "follow",
    user: {
      name: "New Jeans",
      username: "newjeans",
      avatar: "/tabby-cat-sunbeam.png",
    },
    timestamp: "5h ago",
    isRead: false,
  },
  {
    id: "3",
    type: "comment",
    user: {
      name: "Niki",
      username: "niki",
      avatar: "/diverse-woman-portrait.png",
    },
    content: "This is amazing! Love your style.",
    timestamp: "1d ago",
    postImage: "/abstract-geometric-shapes.png",
    isRead: true,
  },
  {
    id: "4",
    type: "mention",
    user: {
      name: "Tyler",
      username: "tyler",
      avatar: "/diverse-man-portrait.png",
    },
    content: "mentioned you in a comment",
    timestamp: "2d ago",
    isRead: true,
  },
  {
    id: "5",
    type: "like",
    user: {
      name: "Harry Maguire",
      username: "harrymaguire",
      avatar: "/man.jpg",
    },
    timestamp: "3d ago",
    postImage: "/diverse-woman-portrait.png",
    isRead: true,
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function NotificationItem({ notification }: { notification: Notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "mention":
        return <AtSign className="w-5 h-5 text-purple-500" />
    }
  }

  const getActionText = () => {
    switch (notification.type) {
      case "like":
        return "liked your post"
      case "comment":
        return "commented"
      case "follow":
        return "started following you"
      case "mention":
        return notification.content
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 hover:bg-accent transition-colors ${!notification.isRead ? "bg-accent/50" : ""}`}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
          <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">{getIcon()}</div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notification.user.username}</span>{" "}
          <span className="text-muted-foreground">{getActionText()}</span>
        </p>
        {notification.content && notification.type === "comment" && (
          <p className="text-sm text-muted-foreground truncate">{notification.content}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
      </div>

      {notification.postImage && (
        <img src={notification.postImage || "/placeholder.svg"} alt="Post" className="w-12 h-12 object-cover rounded" />
      )}
    </div>
  )
}
