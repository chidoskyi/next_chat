import { Heart, MessageCircle, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import Link from "next/link"

export function DesktopHeader() {
  return (
    <header className="hidden md:block sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Instagram</h1>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-10" />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Heart className="w-6 h-6" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages">
              <MessageCircle className="w-6 h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
