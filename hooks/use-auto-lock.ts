"use client"

import { useEffect, useRef } from "react"

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
] as const

interface UseAutoLockOptions {
  /** Whether the chat is currently unlocked */
  enabled: boolean
  /** Called when the auto-lock triggers; should clear keys + messages */
  onLock: () => void
}

/**
 * Automatically locks the chat when:
 * 1. The browser tab becomes hidden (visibilitychange)
 * 2. No user activity for 5 minutes (inactivity timeout)
 */
export function useAutoLock({ enabled, onLock }: UseAutoLockOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onLockRef = useRef(onLock)

  // Keep onLock ref up to date without needing it as a dependency
  useEffect(() => {
    onLockRef.current = onLock
  }, [onLock])

  useEffect(() => {
    if (!enabled) {
      // Clear any running timer when disabled (e.g. locked)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // ── Inactivity timer ─────────────────────────────────────────────────────
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onLockRef.current()
      }, INACTIVITY_TIMEOUT_MS)
    }

    // Start the timer immediately on unlock
    resetTimer()

    // Reset on any activity
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    // ── Tab visibility ────────────────────────────────────────────────────────
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onLockRef.current()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [enabled])
}
