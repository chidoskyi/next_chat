import { DesktopSidebar } from "@/src/components/desktop-sidebar"
import { MobileNav } from "@/src/components/mobile-nav"
import { Button } from "@/src/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"

export default function ReelsPage() {
  return (
    <div className="h-screen bg-black overflow-hidden">
      <DesktopSidebar />

      <main className="lg:ml-64 h-full">
        <div className="h-full flex items-center justify-center">
          {/* Reel Container */}
          <div className="relative w-full max-w-md h-full md:h-[90vh] bg-muted">
            {/* Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <p className="text-white text-lg">Reel Video</p>
            </div>

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Reels</span>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Bottom Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/diverse-woman-portrait.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">username</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-3 text-xs text-white border-white bg-transparent"
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-sm">Caption for this amazing reel content...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6">
              <button className="flex flex-col items-center gap-1">
                <Heart className="w-7 h-7" />
                <span className="text-xs">12.5K</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <MessageCircle className="w-7 h-7" />
                <span className="text-xs">234</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Send className="w-7 h-7" />
                <span className="text-xs">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Bookmark className="w-7 h-7" />
              </button>
              <button className="flex flex-col items-center gap-1">
                <MoreHorizontal className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
