import { DesktopSidebar } from "@/src/components/desktop-sidebar"
import { MobileHeader } from "@/src/components/mobile-header"
import { MobileNav } from "@/src/components/mobile-nav"
import { Input } from "@/src/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

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

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <MobileHeader />

      <main className="lg:ml-64 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="sticky top-14 md:top-0 z-30 bg-background border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-10" />
            </div>
          </div>

          {/* Explore Grid */}
          <div className="grid grid-cols-3 auto-rows-[200px] md:auto-rows-[300px] gap-1 p-1">
            {explorePosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className={`relative bg-muted overflow-hidden group ${post.span}`}
              >
                <img src={post.image || "/placeholder.svg"} alt="Explore post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
