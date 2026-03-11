"use client"

import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

interface HeaderProps {
  onLogout: () => void
  isPolling?: boolean
}

export function Header({ onLogout, isPolling = false }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Aaroh</h1>
        {isPolling && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Connected
          </div>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={onLogout} title="Lock Chat">
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  )
}
