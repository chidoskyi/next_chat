// components/chat/message-input.tsx - WITH VOICE RECORDING
import { useRef, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Camera, Mic, Paperclip, Send, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { EmojiPicker } from "@/src/components/chat/emoji-picker"
import type { Message } from "@/src/types/message"
import { useVoiceRecorder } from "@/src/hooks/useVoiceRecorder"
import { toast } from "@/src/hooks/use-toast"

interface MessageInputProps {
  messageInput: string
  replyingTo: Message | null
  selectedFile?: File | null
  onMessageChange: (value: string) => void
  onSend: () => void
  onEmojiSelect: (emoji: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCancelReply: () => void
  onMediaClick?: () => void
}

export function MessageInput({
  messageInput,
  replyingTo,
  selectedFile,
  onMessageChange,
  onSend,
  onEmojiSelect,
  onFileSelect,
  onCancelReply,
  onMediaClick,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSendingVoice, setIsSendingVoice] = useState(false)
  
  const { 
    isRecording, 
    recordingDuration, 
    startRecording, 
    stopRecording, 
    cancelRecording,
    isReady 
  } = useVoiceRecorder()
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }
  
  const handleVoiceNote = async () => {
    if (isRecording) {
      // Stop and send
      setIsSendingVoice(true)
      
      try {
        console.log('🎤 Stopping recording...')
        const audioFile = await stopRecording()
        
        console.log('✅ Voice note recorded:', {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type
        })
        
        // Create synthetic file input event
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(audioFile)
        
        const syntheticEvent = {
          target: {
            files: dataTransfer.files
          },
          currentTarget: {
            files: dataTransfer.files
          }
        } as React.ChangeEvent<HTMLInputElement>
        
        // Set the file
        onFileSelect(syntheticEvent)
        
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Send the message
        console.log('📤 Sending voice note...')
        onSend()
        
        toast({
          title: "Voice note sent",
          description: `Duration: ${formatDuration(recordingDuration)}`
        })
      } catch (error) {
        console.error('❌ Failed to send voice note:', error)
        toast({
          title: "Recording failed",
          description: "Could not save voice note",
          variant: "destructive"
        })
      } finally {
        setIsSendingVoice(false)
      }
    } else {
      // Start recording
      if (!isReady) {
        toast({
          title: "Not ready",
          description: "Voice recorder is loading...",
          variant: "destructive"
        })
        return
      }
      
      try {
        console.log('🎤 Starting recording...')
        await startRecording()
        
        toast({
          title: "Recording started",
          description: "Tap the microphone again to send"
        })
      } catch (error) {
        console.error('❌ Failed to start recording:', error)
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access in your browser",
          variant: "destructive"
        })
      }
    }
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="p-3 bg-[#F0F0F0] shrink-0">
      {/* Reply Preview */}
      {replyingTo && !isRecording && (
        <div className="mb-2 bg-white rounded-lg p-2 border-l-4 border-[#25D366] flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#25D366]">
              Replying to {replyingTo.sender.username}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {replyingTo.body || "Media"}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 shrink-0" 
            onClick={onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* File Preview */}
      {selectedFile && !isRecording && !isSendingVoice && (
        <div className="mb-2 bg-white rounded-lg p-2 border-l-4 border-[#25D366] flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{selectedFile.name}</div>
            <div className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 shrink-0" 
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
              // You'll need to add a prop to clear selected file
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="mb-2 bg-red-50 rounded-lg p-3 border-l-4 border-red-500 flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <div className="flex-1">
            <span className="text-sm font-medium text-red-700">Recording voice note...</span>
            <span className="text-xs text-red-600 ml-2">{formatDuration(recordingDuration)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              cancelRecording()
              toast({
                title: "Recording cancelled",
                description: "Voice note discarded"
              })
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            Cancel
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2">
          {!isRecording && <EmojiPicker onEmojiSelect={onEmojiSelect} />}
          <Input
            placeholder={isRecording ? "Recording..." : "Type a message"}
            className="flex-1 border-0 focus-visible:ring-0 px-0"
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording}
          />
          {!isRecording && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 text-muted-foreground" />
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={onFileSelect}
          />
        </div>
        
        {messageInput.trim() || (selectedFile && !isRecording) ? (
          <Button
            size="icon"
            className="rounded-full w-12 h-12 bg-[#25D366] hover:bg-[#128C7E] shrink-0"
            onClick={onSend}
            disabled={isRecording || isSendingVoice}
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            className={cn(
              "rounded-full w-12 h-12 shrink-0",
              isRecording ? "bg-[#25D366] hover:bg-[#128C7E] animate-pulse" : "bg-[#25D366] hover:bg-[#128C7E]"
            )}
            onClick={handleVoiceNote}
            disabled={(!isReady && !isRecording) || isSendingVoice}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
