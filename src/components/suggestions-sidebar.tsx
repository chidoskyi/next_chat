import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"

interface SuggestedUser {
  username: string
  name: string
  avatar: string
  isFollowing?: boolean
}

const suggestedUsers: SuggestedUser[] = [
  {
    username: "ryujin.official",
    name: "Shin Ryujin",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    username: "newjeans_official",
    name: "NewJeans",
    avatar: "/tabby-cat-sunbeam.png",
  },
  {
    username: "fashion.daily",
    name: "Fashion Daily",
    avatar: "/diverse-fashion-collection.png",
  },
  {
    username: "travel.world",
    name: "Travel World",
    avatar: "/diverse-group-friends.png",
  },
  {
    username: "food.lover",
    name: "Food Lover",
    avatar: "/diverse-group-women.png",
  },
]

const followingUsers: SuggestedUser[] = [
  {
    username: "itzy.all.in.us",
    name: "ITZY",
    avatar: "/itzy.jpg",
    isFollowing: true,
  },
  {
    username: "nwjs.official",
    name: "NWJS",
    avatar: "/newjeans.jpg",
    isFollowing: true,
  },
]

export function SuggestionsSidebar() {
  return (
    <aside className="hidden xl:block w-80 fixed right-0 top-0 h-screen p-8 pt-24">
      <div className="space-y-6">
        {/* Current User */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/abstract-geometric-shapes.png" alt="Your profile" />
              <AvatarFallback>YO</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">your_username</p>
              <p className="text-xs text-muted-foreground">Your Name</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-500 text-xs font-semibold">
            Switch
          </Button>
        </div>

        {/* Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Suggestions For You</h3>
            <Button variant="ghost" size="sm" className="text-xs font-semibold h-auto p-0">
              See All
            </Button>
          </div>
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-500 text-xs font-semibold h-auto p-0">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Following */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Following</h3>
          <div className="space-y-3">
            {followingUsers.map((user) => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs font-semibold h-auto p-0">
                  Following
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground space-y-2 pt-4">
          <div className="flex flex-wrap gap-2">
            <a href="#" className="hover:underline">
              About
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Help
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Press
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              API
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Jobs
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Terms
            </a>
          </div>
          <p className="text-muted-foreground">© 2025 INSTAGRAM CLONE</p>
        </div>
      </div>
    </aside>
  )
}
