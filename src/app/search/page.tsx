"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { MobileHeader } from "@/src/components/mobile-header"
import { MobileNav } from "@/src/components/mobile-nav"
import Link from "next/link"

const dummyUsers = [
  {
    id: 1,
    username: "olivia_malone",
    name: "Olivia Malone",
    avatar: "/diverse-woman-portrait.png",
    followers: "1.2M",
    isFollowing: false,
    verified: true,
  },
  {
    id: 2,
    username: "itzy.all.in.us",
    name: "ITZY",
    avatar: "/itzy.jpg",
    followers: "8.5M",
    isFollowing: true,
    verified: true,
  },
  {
    id: 3,
    username: "newjeans_official",
    name: "NewJeans",
    avatar: "/newjeans.jpg",
    followers: "12.3M",
    isFollowing: false,
    verified: true,
  },
  {
    id: 4,
    username: "fashionista",
    name: "Fashion Daily",
    avatar: "/diverse-fashion-collection.png",
    followers: "456K",
    isFollowing: false,
    verified: false,
  },
  {
    id: 5,
    username: "travel_explorer",
    name: "Travel Explorer",
    avatar: "/diverse-travelers-world-map.png",
    followers: "892K",
    isFollowing: true,
    verified: false,
  },
  {
    id: 6,
    username: "foodie_heaven",
    name: "Foodie Heaven",
    avatar: "/diverse-food-spread.png",
    followers: "2.1M",
    isFollowing: false,
    verified: true,
  },
]

const explorePosts = [
  { id: 1, image: "/kpop-idol-fashion.jpg", span: "row-span-2" },
  { id: 2, image: "/kpop-group.jpg", span: "" },
  { id: 3, image: "/diverse-street-fashion.png", span: "" },
  { id: 4, image: "/diverse-fashion-collection.png", span: "col-span-2" },
  { id: 5, image: "/tabby-cat-sunbeam.png", span: "" },
  { id: 6, image: "/diverse-group-women.png", span: "row-span-2" },
  { id: 7, image: "/diverse-group-friends.png", span: "" },
  { id: 8, image: "/man.jpg", span: "" },
  { id: 9, image: "/diverse-woman-portrait.png", span: "col-span-2" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState(dummyUsers)

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFollow = (userId: number) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)))
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="lg:ml-64 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="sticky top-14 md:top-0 z-30 bg-background border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-border"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {searchQuery ? (
            // Search Results View
            <div className="max-w-2xl mx-auto divide-y divide-border">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                  >
                    <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 border-2 border-border">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm truncate">{user.username}</p>
                          {user.verified && (
                            <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                      </div>
                    </Link>
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleFollow(user.id)}
                      className={
                        user.isFollowing
                          ? ""
                          : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
                      }
                    >
                      {user.isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try searching for different keywords</p>
                </div>
              )}
            </div>
          ) : (
            // Explore Grid View (default when no search query)
            <div className="grid grid-cols-3 auto-rows-[200px] md:auto-rows-[300px] gap-1 p-1">
              {explorePosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className={`relative bg-muted overflow-hidden group ${post.span}`}
                >
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Explore post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
