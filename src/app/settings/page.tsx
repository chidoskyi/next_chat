"use client"

import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { ChevronRight, User, Bell, Lock, Eye, HelpCircle, LogOut } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-4 space-y-6">
            {/* Profile Section */}
            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="Profile" />
                  <AvatarFallback>OL</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Olivia Malone</h3>
                  <p className="text-sm text-muted-foreground">@oliviamalone</p>
                  <Button variant="link" className="p-0 h-auto text-blue-500">
                    Change Profile Photo
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Olivia Malone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="oliviamalone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Auckland, NZ" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="olivia@example.com" />
                </div>
              </div>
            </section>

            {/* Account Settings */}
            <section className="bg-card border border-border rounded-lg overflow-hidden">
              <h2 className="text-lg font-semibold p-6 pb-4">Account Settings</h2>
              <div className="divide-y divide-border">
                <SettingItem icon={<User className="w-5 h-5" />} label="Account Privacy" />
                <Link href="/change-password">
                  <SettingItem icon={<Lock className="w-5 h-5" />} label="Change Password" />
                </Link>
                <SettingItem icon={<Eye className="w-5 h-5" />} label="Activity Status" />
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Likes</p>
                    <p className="text-sm text-muted-foreground">Notify when someone likes your post</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comments</p>
                    <p className="text-sm text-muted-foreground">Notify when someone comments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </section>

            {/* Privacy & Security */}
            <section className="bg-card border border-border rounded-lg overflow-hidden">
              <h2 className="text-lg font-semibold p-6 pb-4">Privacy & Security</h2>
              <div className="divide-y divide-border">
                <SettingItem icon={<Lock className="w-5 h-5" />} label="Private Account" />
                <SettingItem icon={<Bell className="w-5 h-5" />} label="Blocked Accounts" />
                <SettingItem icon={<Eye className="w-5 h-5" />} label="Story Settings" />
              </div>
            </section>

            {/* Help & Support */}
            <section className="bg-card border border-border rounded-lg overflow-hidden">
              <h2 className="text-lg font-semibold p-6 pb-4">Help & Support</h2>
              <div className="divide-y divide-border">
                <SettingItem icon={<HelpCircle className="w-5 h-5" />} label="Help Center" />
                <SettingItem icon={<HelpCircle className="w-5 h-5" />} label="Report a Problem" />
              </div>
            </section>

            {/* Logout */}
            <Button variant="destructive" className="w-full" size="lg">
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function SettingItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  )
}
