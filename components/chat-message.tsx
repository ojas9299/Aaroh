import { cn, formatRelativeTime } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

interface ChatMessageProps {
  message: string
  timestamp: number
  isOwnMessage: boolean
  senderId: string
  compact?: boolean
  showAvatar?: boolean
}

const USERS: Record<string, { name: string; avatar: string }> = {
  meow: { name: "Meow", avatar: "🐱" },
  quack: { name: "Quack", avatar: "🦆" }
}

export function ChatMessage({ 
  message, 
  timestamp, 
  isOwnMessage, 
  senderId, 
  compact = false, 
  showAvatar = true 
}: ChatMessageProps) {
  const timeString = formatRelativeTime(timestamp)
  const user = USERS[senderId] || { name: "Unknown", avatar: "👤" }

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwnMessage ? "justify-end" : "justify-start",
        compact ? "mb-1" : "mb-6"
      )}
    >
      <div className={cn("flex max-w-[90%] md:max-w-[80%] gap-2 md:gap-3 items-end", isOwnMessage ? "flex-row" : "flex-row-reverse")}>
        
        {/* Chat Bubble Container */}
        <div className={cn("flex flex-col min-w-0", isOwnMessage ? "items-end" : "items-start")}>
          {/* Name Header - only show if showAvatar is true (start of cluster) */}
          {!isOwnMessage && showAvatar && (
            <span className="text-[12px] md:text-[13px] font-semibold text-zinc-300 mb-1 ml-1">{user.name}</span>
          )}

          <div
            className={cn(
              "flex flex-col px-3 md:px-4 py-2 md:py-2.5 shadow-sm relative group w-fit max-w-full",
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-white",
              // Corner rounding logic for grouping
              isOwnMessage 
                ? (compact ? "rounded-l-2xl rounded-r-sm" : "rounded-2xl rounded-br-sm")
                : (compact ? "rounded-r-2xl rounded-l-sm" : "rounded-2xl rounded-bl-sm")
            )}
          >
            <span className="text-[15px] md:text-base font-medium leading-relaxed break-words whitespace-pre-wrap">{message}</span>
            <span 
              className={cn(
                "text-[10px] sm:text-xs mt-1 -mb-1 opacity-70 transition-opacity",
                isOwnMessage ? "text-blue-100 self-end" : "text-zinc-400 self-start"
              )}
            >
              {timeString}
            </span>
          </div>
        </div>

        {/* Avatar Area */}
        <div className={cn("flex-shrink-0 mb-0.5", !showAvatar && "opacity-0 invisible")}>
          <UserAvatar avatar={user.avatar} className="shadow-sm" />
        </div>
      </div>
    </div>
  )
}
