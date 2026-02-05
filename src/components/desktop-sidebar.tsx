import { Home, Search, Film, MessageCircle, User, Menu, BarChart3, Bell } from "lucide-react"
import Link from "next/link"
import { InstagramLogo } from "./instagram-logo"

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-background flex-col z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <InstagramLogo className="w-8 h-8" />
          <span className="text-2xl font-bold">Instagram</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <Link href="/" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors">
          <Home className="w-6 h-6" />
          <span className="font-medium">Home</span>
        </Link>
        <Link href="/search" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors">
          <Search className="w-6 h-6" />
          <span className="font-medium">Search</span>
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          href="/messages"
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium">Direct Messages</span>
        </Link>
        <Link href="/reels" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors">
          <Film className="w-6 h-6" />
          <span className="font-medium">IGTV</span>
        </Link>
        <Link href="/stats" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors">
          <BarChart3 className="w-6 h-6" />
          <span className="font-medium">Stats</span>
        </Link>
        <Link
          href="/notifications"
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-6 h-6" />
          <span className="font-medium">Notifications</span>
        </Link>
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="w-6 h-6" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  )
}
