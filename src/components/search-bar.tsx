"use client"

import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { useRouter } from "next/navigation"

export function SearchBar() {
  const router = useRouter()

  const handleSearchClick = () => {
    router.push("/search")
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search"
          className="w-full pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-border cursor-pointer"
          onClick={handleSearchClick}
          onFocus={handleSearchClick}
          readOnly
        />
      </div>
    </div>
  )
}
