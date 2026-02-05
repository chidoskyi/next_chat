"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DesktopSidebar } from "@/src/components/desktop-sidebar"
import { MobileHeader } from "@/src/components/mobile-header"
import { MobileNav } from "@/src/components/mobile-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Settings, Grid3x3, Film, Bookmark, UserPlus, Plus, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

const posts = [
  { id: 1, image: "/kpop-idol-fashion.jpg", likes: 1234, comments: 56 },
  { id: 2, image: "/kpop-group.jpg", likes: 2345, comments: 78 },
  { id: 3, image: "/diverse-street-fashion.png", likes: 3456, comments: 90 },
  { id: 4, image: "/diverse-fashion-collection.png", likes: 4567, comments: 123 },
  { id: 5, image: "/tabby-cat-sunbeam.png", likes: 5678, comments: 145 },
  { id: 6, image: "/diverse-group-women.png", likes: 6789, comments: 167 },
]

const reels = [
  { id: 1, thumbnail: "/diverse-woman-portrait.png", views: "12.5K", likes: 1543 },
  { id: 2, thumbnail: "/kpop-idol-fashion.jpg", views: "8.2K", likes: 892 },
  { id: 3, thumbnail: "/diverse-street-fashion.png", views: "15.7K", likes: 2341 },
  { id: 4, thumbnail: "/kpop-group.jpg", views: "20.1K", likes: 3456 },
  { id: 5, thumbnail: "/diverse-fashion-collection.png", views: "9.8K", likes: 1234 },
  { id: 6, thumbnail: "/diverse-group-women.png", views: "11.3K", likes: 1678 },
]

const saved = [
  { id: 1, image: "/tabby-cat-sunbeam.png", likes: 8234, comments: 156 },
  { id: 2, image: "/diverse-woman-portrait.png", likes: 9345, comments: 278 },
  { id: 3, image: "/kpop-idol-fashion.jpg", likes: 7456, comments: 190 },
  { id: 4, image: "/diverse-street-fashion.png", likes: 6567, comments: 223 },
  { id: 5, image: "/kpop-group.jpg", likes: 5678, comments: 145 },
  { id: 6, image: "/diverse-fashion-collection.png", likes: 4789, comments: 167 },
]

const tagged = [
  { id: 1, image: "/diverse-group-women.png", likes: 3234, comments: 86 },
  { id: 2, image: "/kpop-group.jpg", likes: 4345, comments: 98 },
  { id: 3, image: "/diverse-fashion-collection.png", likes: 2456, comments: 70 },
  { id: 4, image: "/kpop-idol-fashion.jpg", likes: 5567, comments: 123 },
]

type TabType = "posts" | "reels" | "saved" | "tagged"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("posts")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="relative aspect-square bg-muted group overflow-hidden"
              >
                <img src={post.image || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      case "reels":
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
            {reels.map((reel) => (
              <Link
                key={reel.id}
                href={`/reels/${reel.id}`}
                className="relative aspect-[9/16] bg-muted group overflow-hidden"
              >
                <img src={reel.thumbnail || "/placeholder.svg"} alt="Reel" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-sm font-semibold">
                  <Film className="w-4 h-4" />
                  <span>{reel.views}</span>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{reel.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      case "saved":
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
            {saved.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="relative aspect-square bg-muted group overflow-hidden"
              >
                <img src={post.image || "/placeholder.svg"} alt="Saved post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      case "tagged":
        return (
          <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
            {tagged.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="relative aspect-square bg-muted group overflow-hidden"
              >
                <img src={post.image || "/placeholder.svg"} alt="Tagged post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <MobileHeader />

      <main className="lg:ml-64 pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <Avatar className="w-32 h-32 md:w-40 md:h-40">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="Olivia Malone" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-xl font-normal">Olivia Malone</h1>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-8 px-4" onClick={() => setShowEditProfile(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="secondary" className="h-8 px-4" onClick={() => setShowArchive(true)}>
                    View Archive
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Plus className="w-5 h-5" />
                        <span className="sr-only">Add content</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>Add Post</DropdownMenuItem>
                      <DropdownMenuItem>Add Reels</DropdownMenuItem>
                      <DropdownMenuItem>Add Story</DropdownMenuItem>
                      <DropdownMenuItem>Add Story Highlights</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Settings className="w-5 h-5" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Switch Account</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 justify-center md:justify-start">
                <div className="text-center md:text-left">
                  <span className="font-semibold">150</span>
                  <span className="text-sm ml-1">Posts</span>
                </div>
                <button className="text-center md:text-left">
                  <span className="font-semibold">1.2m</span>
                  <span className="text-sm ml-1">Followers</span>
                </button>
                <button className="text-center md:text-left">
                  <span className="font-semibold">320</span>
                  <span className="text-sm ml-1">Following</span>
                </button>
              </div>

              {/* Bio */}
              <div className="text-center md:text-left">
                <p className="font-semibold">Olivia Malone</p>
                <p className="text-sm">Auckland, NZ</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-border">
            <div className="flex justify-center gap-12">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 py-4 border-t-2 -mt-px transition-colors ${
                  activeTab === "posts"
                    ? "border-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase hidden md:inline">Posts</span>
              </button>
              <button
                onClick={() => setActiveTab("reels")}
                className={`flex items-center gap-2 py-4 border-t-2 -mt-px transition-colors ${
                  activeTab === "reels"
                    ? "border-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Film className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase hidden md:inline">Reels</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 py-4 border-t-2 -mt-px transition-colors ${
                  activeTab === "saved"
                    ? "border-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase hidden md:inline">Saved</span>
              </button>
              <button
                onClick={() => setActiveTab("tagged")}
                className={`flex items-center gap-2 py-4 border-t-2 -mt-px transition-colors ${
                  activeTab === "tagged"
                    ? "border-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase hidden md:inline">Tagged</span>
              </button>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>

      <MobileNav />

      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || "/abstract-geometric-shapes.png"} alt="Olivia Malone" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="link"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary cursor-pointer"
                  onClick={handleChangePhotoClick}
                  type="button"
                >
                  Change photo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Olivia Malone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="olivia.malone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" defaultValue="Auckland, NZ" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditProfile(false)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchive} onOpenChange={setShowArchive}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Archive</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-2">
              {posts.slice(0, 6).map((post) => (
                <div key={post.id} className="relative aspect-square bg-muted overflow-hidden rounded-lg">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Archived post"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No archived posts yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
