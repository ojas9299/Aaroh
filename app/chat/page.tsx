"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { ChatContainer } from "@/components/chat-container"
import { Card, CardContent, CardDescription, CardHeader as ShadcnCardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { deriveKey, encryptMessage, decryptMessage } from "@/lib/crypto"
import { UnlockScreen } from "@/components/unlock-screen"
import { usePresence } from "@/hooks/use-presence"
import { useAutoLock } from "@/hooks/use-auto-lock"
import { useNotifications } from "@/hooks/use-notifications"

type Message = {
  id: string
  sender: string
  ciphertext: string
  timestamp: number
  plaintext?: string
}

const USERS: Record<string, { name: string; avatar: string }> = {
  meow: { name: "Meow", avatar: "🐱" },
  quack: { name: "Quack", avatar: "🦆" }
}

export default function ChatPage() {
  const router = useRouter()
  
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)
  const [passphrase, setPassphrase] = useState("")
  const [userId, setUserId] = useState<"meow" | "quack">("meow")
  const [isUnlocking, setIsUnlocking] = useState(false)

  const { myStatus, otherStatus } = usePresence({ userId, enabled: !!cryptoKey })

  const [messages, setMessages] = useState<Message[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const { requestPermission, notify } = useNotifications()

  const bottomRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Smooth auto scroll to bottom
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (!cryptoKey) return
    let intervalId: NodeJS.Timeout
    let lastMessageId = ""

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages')
        if (!res.ok) throw new Error('Failed to fetch messages')
        const data: Message[] = await res.json()

        // Skip decrypt + setState if nothing has changed
        const latestId = data.length > 0
          ? String(data[data.length - 1].timestamp)
          : ""
        if (latestId === lastMessageId) return

        if (lastMessageId !== "") {
          const newIncoming = data.filter(m => String(m.timestamp) > lastMessageId && m.sender !== userId)
          if (newIncoming.length > 0) {
            const senderName = userId === "meow" ? USERS.quack.name : USERS.meow.name;
            notify(`New message from ${senderName}`, { body: "You have securely received a new message." })
          }
        }

        lastMessageId = latestId

        const decryptedMessages = await Promise.all(
          data.map(async (msg) => {
            try {
              const text = await decryptMessage(cryptoKey, msg.ciphertext)
              return { ...msg, plaintext: text }
            } catch (err) {
              return { ...msg, plaintext: "🔒 [Decryption Failed]" }
            }
          })
        )
        setMessages(decryptedMessages)
      } catch (error) {
        console.error("Polling error:", error)
      }
    }

    fetchMessages()
    intervalId = setInterval(fetchMessages, 3000)

    return () => clearInterval(intervalId)
  }, [cryptoKey])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passphrase) return
    
    setIsUnlocking(true)
    try {
      const key = await deriveKey(passphrase)
      setCryptoKey(key)
      await requestPermission()
    } catch (error) {
      console.error("Failed to derive key", error)
      alert("Failed to initialize security context.")
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleLogout = () => {
    setCryptoKey(null)
    setPassphrase("")
    setMessages([])
  }

  useAutoLock({ enabled: !!cryptoKey, onLock: handleLogout })


  const handleSendMessage = async (text: string) => {
    if (!cryptoKey) return

    try {
      const tempId = `temp-${Date.now()}`
      const optimisticMsg: Message = {
        id: tempId,
        sender: userId,
        ciphertext: "", 
        timestamp: Date.now(),
        plaintext: text
      }
      setMessages(prev => [...prev, optimisticMsg])
      setIsTyping(false)

      const ciphertext = await encryptMessage(cryptoKey, text)
      
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: userId,
          ciphertext
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Send error:", error)
      alert("Failed to send message securely.")
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
    }
  }

  if (!cryptoKey) {
    return (
      <UnlockScreen
        userId={userId}
        setUserId={setUserId}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        isUnlocking={isUnlocking}
        onUnlock={handleUnlock}
      />
    )
  }

  const currentUser = USERS[userId]

  return (
    <ChatContainer>
      <ChatHeader
        onLogout={handleLogout}
        myStatus={myStatus}
        otherStatus={otherStatus}
        myName={currentUser.name}
        otherName={userId === "meow" ? USERS.quack.name : USERS.meow.name}
      />
      
      <main className="flex-1 overflow-hidden relative flex flex-col w-full bg-zinc-950">
        <ScrollArea className="flex-1 p-4">
          <div className="pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 pt-32 space-y-4">
                <div className="p-4 bg-zinc-900 rounded-full shadow-inner">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-sm font-medium">No messages yet.<br/>Start a secure conversation.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const previousMsg = index > 0 ? messages[index - 1] : null
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null

                // Group messages if they are from the same sender and within 2 minutes of each other
                const isConsecutivePrevious = previousMsg && previousMsg.sender === msg.sender && (msg.timestamp - previousMsg.timestamp < 120000)
                const isConsecutiveNext = nextMsg && nextMsg.sender === msg.sender && (nextMsg.timestamp - msg.timestamp < 120000)

                return (
                  <ChatMessage 
                    key={msg.id}
                    message={msg.plaintext || "🔒 Error"} 
                    timestamp={msg.timestamp}
                    isOwnMessage={msg.sender === userId}
                    senderId={msg.sender}
                    compact={!!isConsecutiveNext}
                    showAvatar={!isConsecutivePrevious}
                  />
                )
              })
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-zinc-400 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-4 ml-12">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </div>
                <span className="italic">{currentUser.name} is typing...</span>
              </div>
            )}
            
            <div ref={bottomRef} className="h-1 w-full" />
          </div>
        </ScrollArea>
      </main>

      <ChatInput onSend={handleSendMessage} disabled={!cryptoKey} onTyping={setIsTyping} />
    </ChatContainer>
  )
}
