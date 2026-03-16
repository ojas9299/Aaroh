"use client"

import { useEffect, useRef, useState } from "react"

export type PresenceStatus = "online" | "away" | "offline" | "reconnecting"

const HEARTBEAT_INTERVAL_MS = 20_000   // ping every 20s
const POLL_INTERVAL_MS      = 15_000   // fetch other user status every 15s
const ONLINE_THRESHOLD_MS   = 30_000   // < 30s  → Online
const AWAY_THRESHOLD_MS     = 120_000  // < 2min → Away

function getStatus(lastSeen: number | null): PresenceStatus {
  if (lastSeen === null) return "offline"
  const age = Date.now() - lastSeen
  if (age < ONLINE_THRESHOLD_MS) return "online"
  if (age < AWAY_THRESHOLD_MS)   return "away"
  return "offline"
}

interface UsePresenceOptions {
  userId: string       // "meow" | "quack"
  enabled: boolean     // only run when chat is unlocked
}

interface PresenceResult {
  myStatus: PresenceStatus
  otherStatus: PresenceStatus
  error: boolean
}

export function usePresence({ userId, enabled }: UsePresenceOptions): PresenceResult {
  const userKey  = userId
  const otherKey = userId === "meow" ? "quack" : "meow"

  const [myStatus,    setMyStatus]    = useState<PresenceStatus>("offline")
  const [otherStatus, setOtherStatus] = useState<PresenceStatus>("offline")
  const [error,       setError]       = useState(false)

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const isHiddenRef  = useRef(false)

  // ─── Heartbeat (POST own presence) ─────────────────────────────────────────
  const sendHeartbeat = async () => {
    if (isHiddenRef.current) return      // tab hidden → skip
    try {
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userKey }),
      })
      if (!res.ok) throw new Error()
      setMyStatus("online")
      setError(false)
    } catch {
      setMyStatus("reconnecting")
      setError(true)
    }
  }

  // ─── Poll other user's status ───────────────────────────────────────────────
  const fetchPresence = async () => {
    try {
      const res = await fetch("/api/presence")
      if (!res.ok) throw new Error()
      const data: Record<string, number> = await res.json()
      setOtherStatus(getStatus(data[otherKey] ?? null))
      setError(false)
    } catch {
      setError(true)
    }
  }

  // ─── Page visibility API ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return

    const onVisibilityChange = () => {
      isHiddenRef.current = document.visibilityState === "hidden"
      if (!isHiddenRef.current) {
        // Came back → immediately send heartbeat
        sendHeartbeat()
      } else {
        setMyStatus("away")
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId])

  // ─── Start/stop intervals ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setMyStatus("offline")
      setOtherStatus("offline")
      return
    }

    // Fire immediately
    sendHeartbeat()
    fetchPresence()

    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
    pollRef.current      = setInterval(fetchPresence,  POLL_INTERVAL_MS)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (pollRef.current)      clearInterval(pollRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId])

  return { myStatus, otherStatus, error }
}
