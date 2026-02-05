import { Home, Search, PlusSquare, Film, User } from "lucide-react"
import Link from "next/link"

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-12">
        <Link href="/" className="p-2">
          <Home className="w-6 h-6" />
        </Link>
        <Link href="/explore" className="p-2">
          <Search className="w-6 h-6" />
        </Link>
        <Link href="/create" className="p-2">
          <PlusSquare className="w-6 h-6" />
        </Link>
        <Link href="/reels" className="p-2">
          <Film className="w-6 h-6" />
        </Link>
        <Link href="/profile" className="p-2">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  )
}
