import * as React from "react"
import { cn } from "@/lib/utils"

export function ChatContainer({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex h-[100dvh] w-full bg-zinc-950 md:bg-zinc-900 justify-center">
      <div 
        className={cn(
          "flex flex-col w-full max-w-[700px] h-full bg-zinc-950 md:border-x border-zinc-800 overflow-hidden relative shadow-none md:shadow-2xl", 
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
