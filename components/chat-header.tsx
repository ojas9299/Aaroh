"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { type PresenceStatus } from "@/hooks/use-presence"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  onLogout: () => void
  myStatus: PresenceStatus
  otherStatus: PresenceStatus
  myName: string
  otherName: string
}

const STATUS_CONFIG: Record<PresenceStatus, { dot: string; label: string }> = {
  online:       { dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",  label: "Online" },
  away:         { dot: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]", label: "Away" },
  offline:      { dot: "bg-zinc-600",                                          label: "Offline" },
  reconnecting: { dot: "bg-orange-400 animate-pulse",                          label: "Reconnecting..." },
}

function StatusBadge({ status, name }: { status: PresenceStatus; name: string }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-900/50 px-2 md:px-2.5 py-1 rounded-full border border-zinc-800/50">
      <span className={cn("flex h-2 w-2 rounded-full shrink-0", cfg.dot)} />
      <span className="truncate max-w-[80px] md:max-w-none">{name} <span className="hidden sm:inline">· {cfg.label}</span></span>
    </div>
  )
}

export function ChatHeader({ onLogout, myStatus, otherStatus, myName, otherName }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 md:px-6 shadow-sm">
      <h1 className="text-base md:text-lg font-semibold text-white tracking-tight shrink-0 hidden sm:block mr-2">PrivateChat</h1>

      <div className="flex items-center gap-1.5 md:gap-2 flex-1 sm:flex-initial justify-end sm:justify-start">
        <StatusBadge status={myStatus}    name={myName} />
        <StatusBadge status={otherStatus} name={otherName} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          title="Lock Chat"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-8 w-8 md:h-9 md:w-9 transition-all hover:scale-105 ml-1 shrink-0"
        >

          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  )
}
