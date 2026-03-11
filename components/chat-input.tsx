"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  onTyping?: (isTyping: boolean) => void
}

export function ChatInput({ onSend, disabled, onTyping }: ChatInputProps) {
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSend(value.trim())
      setValue("")
    }
  }

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-2 sm:p-4 w-full mt-auto relative z-10">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2"
      >
        <Input
          type="text"
          placeholder="Message..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (onTyping) onTyping(e.target.value.length > 0)
          }}
          disabled={disabled}
          className="flex-1 rounded-full border-zinc-800 bg-zinc-900 px-4 h-10 sm:h-11 focus-visible:ring-1 focus-visible:ring-zinc-700 text-base sm:text-sm text-white placeholder:text-zinc-500 shadow-sm transition-shadow"
        />
        <Button 
          type="submit" 
          disabled={!value.trim() || disabled} 
          size="icon"
          className="rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 h-10 w-10 sm:h-11 sm:w-11 shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <SendHorizontal className="h-5 w-5 ml-0.5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}
