"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, KeyRound, User, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UnlockScreenProps {
  userId: "meow" | "quack"
  setUserId: (id: "meow" | "quack") => void
  passphrase: string
  setPassphrase: (p: string) => void
  isUnlocking: boolean
  onUnlock: (e: React.FormEvent) => void
}

export function UnlockScreen({
  userId,
  setUserId,
  passphrase,
  setPassphrase,
  isUnlocking,
  onUnlock,
}: UnlockScreenProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-[100dvh] bg-zinc-950 items-center justify-center p-4">
      <Card className="w-full max-w-[420px] bg-zinc-900 border-zinc-800 shadow-2xl p-5 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 text-zinc-100">
        <div className="flex flex-col items-center mb-6 md:mb-8 text-center space-y-2">
          <div className="bg-zinc-800/50 p-3 rounded-full mb-2">
            <Lock className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-4">Aaroh</h1>
          <p className="text-sm text-zinc-400">A rising rhythm written in conversations.</p>
        </div>

        <form onSubmit={onUnlock} className="space-y-5 md:space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-zinc-300">
              Select Identity
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "meow", name: "Meow", avatar: "🐱" },
                { id: "quack", name: "Quack", avatar: "🦆" }
              ].map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setUserId(user.id as "meow" | "quack")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-zinc-900 group",
                    userId === user.id
                      ? "border-blue-600 bg-blue-600/10 shadow-sm shadow-blue-900/20"
                      : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {user.avatar}
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    userId === user.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                  )}>
                    {user.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium leading-none text-zinc-300">
              Shared Passphrase
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                disabled={isUnlocking}
                required
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-600 h-12 pl-10 pr-10 rounded-xl transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-12 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:shadow-none" 
            type="submit" 
            disabled={isUnlocking || !passphrase.trim()}
          >
            {isUnlocking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock Chat"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
