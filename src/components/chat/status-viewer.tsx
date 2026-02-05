import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Status } from "@/src/data"

interface StatusViewerProps {
  status: Status | null
  onClose: () => void
}

export function StatusViewer({ status, onClose }: StatusViewerProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)

  const nextStatusImage = () => {
    if (status && currentStatusIndex < status.statusImages.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1)
    }
  }

  const prevStatusImage = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1)
    }
  }

  return (
    <Dialog open={status !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 bg-black border-0">
        <div className="relative">
          {/* Progress bars for multiple images */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            {status?.statusImages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 h-0.5 rounded-full",
                  index < currentStatusIndex
                    ? "bg-white"
                    : index === currentStatusIndex
                      ? "bg-white"
                      : "bg-white/30"
                )}
              />
            ))}
          </div>

          <div className="absolute top-6 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={status?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{status?.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h3 className="font-semibold">{status?.name}</h3>
                <p className="text-xs text-white/70">Today, 10:30 AM</p>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          {status && currentStatusIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={prevStatusImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}
          {status && currentStatusIndex < status.statusImages.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={nextStatusImage}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          <img
            src={status?.statusImages[currentStatusIndex] || "/placeholder.svg"}
            alt="Status"
            className="w-full aspect-[9/16] object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-4 text-white hover:bg-white/20 z-10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Status count indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentStatusIndex + 1} / {status?.statusImages.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}