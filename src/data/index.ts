export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  avatar?: string
  type?: "text" | "image" | "video" | "voice"
  mediaUrl?: string
  reaction?: string
  replyTo?: {
    id: string
    sender: string
    content: string
  }
  voiceDuration?: number
}

export interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread?: number
  isTyping?: boolean
  isPinned?: boolean
  isGroup?: boolean
  phone?: string
  about?: string
}

export interface Status {
  id: string
  name: string
  avatar: string
  hasStatus: boolean
  isViewed?: boolean
  isOwn?: boolean
  statusImages: string[]
}

export const emojiReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export const statuses: Status[] = [
  { 
    id: "own", 
    name: "My Status", 
    avatar: "/abstract-geometric-shapes.png", 
    hasStatus: false, 
    isOwn: true, 
    statusImages: [] 
  },
  { 
    id: "1", 
    name: "Sarah", 
    avatar: "/diverse-woman-portrait.png", 
    hasStatus: true, 
    isViewed: false, 
    statusImages: ["/diverse-fashion-collection.png", "/diverse-street-fashion.png", "/diverse-group-friends.png"] 
  },
  { 
    id: "2", 
    name: "John", 
    avatar: "/man.jpg", 
    hasStatus: true, 
    isViewed: false, 
    statusImages: ["/diverse-street-fashion.png", "/kpop-idol-fashion.jpg"] 
  },
  { 
    id: "3", 
    name: "Emma", 
    avatar: "/diverse-group-women.png", 
    hasStatus: true, 
    isViewed: true, 
    statusImages: ["/diverse-group-friends.png"] 
  },
  { 
    id: "4", 
    name: "Mike", 
    avatar: "/diverse-man-portrait.png", 
    hasStatus: true, 
    isViewed: false, 
    statusImages: ["/kpop-idol-fashion.jpg", "/newjeans.jpg", "/itzy.jpg"] 
  },
  { 
    id: "5", 
    name: "Lisa", 
    avatar: "/diverse-fashion-collection.png", 
    hasStatus: true, 
    isViewed: true, 
    statusImages: ["/newjeans.jpg"] 
  },
  { 
    id: "6", 
    name: "Alex", 
    avatar: "/kpop-group.jpg", 
    hasStatus: true, 
    isViewed: false, 
    statusImages: ["/itzy.jpg", "/diverse-travelers-world-map.png"] 
  },
  { 
    id: "7", 
    name: "Nina", 
    avatar: "/tabby-cat-sunbeam.png", 
    hasStatus: true, 
    isViewed: false, 
    statusImages: ["/diverse-travelers-world-map.png", "/diverse-food-spread.png"] 
  },
]

export const conversations: Conversation[] = [
  {
    id: "1",
    name: "Harry Maguire",
    avatar: "/man.jpg",
    lastMessage: "You need to improve now",
    timestamp: "09:12 AM",
    isPinned: true,
    phone: "+44 7700 900123",
    about: "Football is life",
  },
  {
    id: "2",
    name: "United Family",
    avatar: "/diverse-group-friends.png",
    lastMessage: "Rashford is typing...",
    timestamp: "06:25 AM",
    isTyping: true,
    isGroup: true,
    about: "Group for the team",
  },
  {
    id: "3",
    name: "Ramsus Hojlund",
    avatar: "/man.jpg",
    lastMessage: "Bos, I need to talk today",
    timestamp: "03:11 AM",
    unread: 2,
    phone: "+45 1234 5678",
    about: "Striker",
  },
  {
    id: "4",
    name: "Andre Onana",
    avatar: "/diverse-man-portrait.png",
    lastMessage: "I need more time bos",
    timestamp: "11:34 AM",
    phone: "+237 6789 0123",
    about: "Goalkeeper",
  },
  {
    id: "5",
    name: "Regullon",
    avatar: "/man.jpg",
    lastMessage: "Great performance lad",
    timestamp: "09:12 AM",
    phone: "+34 612 345 678",
    about: "Left back",
  },
  {
    id: "6",
    name: "Bruno Fernandes",
    avatar: "/diverse-man-portrait.png",
    lastMessage: "Play the game Bruno !",
    timestamp: "10:21 AM",
    phone: "+351 912 345 678",
    about: "Captain material",
  },
]

export const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Harry Maguire",
    content: "Hey lads, tough game yesterday. Let's talk about what went wrong and how we can improve.",
    timestamp: "08:34 AM",
    isOwn: false,
    avatar: "/man.jpg",
    type: "text",
  },
  {
    id: "2",
    sender: "Bruno Fernandes",
    content: "Agreed, Harry. We had some good moments, but we need to be more clinical in front of the goal.",
    timestamp: "08:34 AM",
    isOwn: false,
    avatar: "/diverse-man-portrait.png",
    type: "text",
  },
  {
    id: "3",
    sender: "You",
    content: "We need to control the midfield and exploit their defensive weaknesses.",
    timestamp: "08:34 AM",
    isOwn: true,
    type: "text",
  },
  {
    id: "4",
    sender: "Harry Maguire",
    content: "",
    timestamp: "08:35 AM",
    isOwn: false,
    avatar: "/man.jpg",
    type: "image",
    mediaUrl: "/diverse-street-fashion.png",
  },
  {
    id: "5",
    sender: "You",
    content: "Voice message",
    timestamp: "08:36 AM",
    isOwn: true,
    type: "voice",
    voiceDuration: 15,
  },
]