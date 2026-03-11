"use client"

import { useEffect, useRef } from "react"

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>("default")

  useEffect(() => {
    // Check initial permission
    if ("Notification" in window) {
      permissionRef.current = Notification.permission
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification")
      return false
    }

    if (Notification.permission === "granted") {
      permissionRef.current = "granted"
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      permissionRef.current = permission
      return permission === "granted"
    }

    return false
  }

  const notify = (title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) return

    if (Notification.permission === "granted") {
      // Only notify if document is hidden to avoid spam while actively chatting
      if (document.hidden) {
        new Notification(title, {
          icon: "/favicon.ico", // Fallback icon
          badge: "/favicon.ico",
          ...options
        })
      }
    }
  }

  return { requestPermission, notify }
}
