import { cn } from "@/lib/utils"

interface UserAvatarProps {
  avatar: string
  className?: string
}

export function UserAvatar({ avatar, className }: UserAvatarProps) {
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm ring-1 ring-zinc-700 select-none", className)}>
      {avatar}
    </div>
  )
}
