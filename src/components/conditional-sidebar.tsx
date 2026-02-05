"use client"

import { usePathname } from "next/navigation"
import { DesktopSidebar } from "./desktop-sidebar"

export function ConditionalSidebar() {
  const pathname = usePathname()

  const hideOnPaths = ["/login", "/register"]
  const shouldHideSidebar = hideOnPaths.includes(pathname)

  if (shouldHideSidebar) {
    return null
  }

  return <DesktopSidebar />
}
