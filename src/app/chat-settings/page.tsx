"use client"

import React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Switch } from "@/src/components/ui/switch"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Lock,
  Key,
  MessageCircle,
  HelpCircle,
  Users,
  Moon,
  Palette,
  Database,
  Info,
  Camera,
  QrCode,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"

const settingsItems = [
  { icon: Key, label: "Account", description: "Security notifications, change number", href: "/settings" },
  { icon: Lock, label: "Privacy", description: "Block contacts, disappearing messages", href: "/settings" },
  { icon: Palette, label: "Avatar", description: "Create, edit, profile photo", href: "/profile" },
  { icon: MessageCircle, label: "Chats", description: "Theme, wallpapers, chat history", href: "#" },
  { icon: Bell, label: "Notifications", description: "Message, group & call tones", href: "/notifications" },
  { icon: Database, label: "Storage and data", description: "Network usage, auto-download", href: "#" },
  { icon: Moon, label: "App language", description: "English (device's language)", href: "#" },
  { icon: HelpCircle, label: "Help", description: "Help centre, contact us, privacy policy", href: "#" },
  { icon: Users, label: "Invite a friend", description: "", href: "#" },
]

export default function ChatSettingsPage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#075E54] text-white">
        <div className="flex items-center gap-4 p-4">
          <Link href="/chats">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-64px)]">
        {/* Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || "/abstract-geometric-shapes.png"} alt="Profile" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center cursor-pointer border-2 border-background">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Erik Ten Hag</h2>
              <p className="text-sm text-muted-foreground">Hey there! I am using ChatApp</p>
            </div>
            <Button variant="ghost" size="icon">
              <QrCode className="w-6 h-6 text-[#25D366]" />
            </Button>
          </div>
        </div>

        {/* Settings List */}
        <div className="divide-y divide-border">
          {settingsItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-4 p-4 hover:bg-accent transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.label}</h3>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* App Info */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>from</p>
          <p className="font-semibold text-foreground">Meta</p>
        </div>
      </ScrollArea>
    </div>
  )
}
