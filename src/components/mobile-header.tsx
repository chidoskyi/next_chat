import { Heart, MessageCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-2xl font-bold">Instagram</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/notifications">
              <Heart className="w-6 h-6" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/messages">
              <MessageCircle className="w-6 h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
