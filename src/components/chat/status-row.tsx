import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Status } from "@/src/data"

interface StatusRowProps {
  statuses: Status[]
  onStatusClick: (status: Status) => void
}

export function StatusRow({ statuses, onStatusClick }: StatusRowProps) {
  const statusScrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const scrollStatusLeft = () => {
    if (statusScrollRef.current) {
      statusScrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollStatusRight = () => {
    if (statusScrollRef.current) {
      statusScrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!statusScrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - statusScrollRef.current.offsetLeft)
    setScrollLeft(statusScrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !statusScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - statusScrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    statusScrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="border-b border-border relative shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background h-8 w-8"
        onClick={scrollStatusLeft}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div
        ref={statusScrollRef}
        className="flex gap-3 p-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing mx-8"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {statuses.map((status) => (
          <button
            key={status.id}
            className="flex flex-col items-center gap-1 min-w-[60px]"
            onClick={() => !status.isOwn && status.hasStatus && onStatusClick(status)}
          >
            <div
              className={cn(
                "rounded-full p-0.5 relative",
                status.isOwn
                  ? "bg-gray-300"
                  : status.isViewed
                    ? "bg-gray-400"
                    : "bg-gradient-to-tr from-[#25D366] to-[#128C7E]"
              )}
            >
              <div className="bg-background rounded-full p-0.5">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={status.avatar || "/placeholder.svg"} alt={status.name} />
                  <AvatarFallback>{status.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              {status.isOwn && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center border-2 border-background">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <span className="text-xs truncate w-full text-center">
              {status.isOwn ? "My Status" : status.name}
            </span>
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background h-8 w-8"
        onClick={scrollStatusRight}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}