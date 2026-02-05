"use client"

import type React from "react"

import { useRef } from "react"
import { StoryCircle } from "./story-circle"

const stories = [
  { username: "You", avatar: "/abstract-geometric-shapes.png", isYourStory: true },
  { username: "Ryujin", avatar: "/diverse-woman-portrait.png", hasStory: true },
  { username: "New Jeans", avatar: "/tabby-cat-sunbeam.png", hasStory: true },
  { username: "Niki", avatar: "/diverse-woman-portrait.png", hasStory: true },
  { username: "Tyler", avatar: "/man.jpg", hasStory: true },
  { username: "Sarah", avatar: "/diverse-group-women.png", hasStory: true },
  { username: "Mike", avatar: "/diverse-group-friends.png", hasStory: true },
  { username: "Emma", avatar: "/diverse-group-women.png", hasStory: true },
]

export function StoriesBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = "grabbing"
  }

  const handleMouseUp = () => {
    isDragging.current = false
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 2
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab"
    }
  }

  return (
    <div className="bg-card border-b border-border md:border md:rounded-lg md:mb-4 py-4">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide cursor-grab select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-4 px-4 w-max">
          {stories.map((story) => (
            <StoryCircle
              key={story.username}
              username={story.username}
              avatar={story.avatar}
              hasStory={story.hasStory}
              isYourStory={story.isYourStory}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
