"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendImage: (file: File, mode: "view-once" | "persistent") => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatInput({
  onSend,
  onSendImage,
  disabled,
  onTyping,
}: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const [mode, setMode] = React.useState<"view-once" | "persistent">(
    "view-once",
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-2 sm:p-4 w-full mt-auto relative z-10">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs text-zinc-400">Image mode</div>
        <div className="inline-flex rounded-md border border-zinc-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("view-once")}
            className={`px-2 py-1 text-xs ${mode === "view-once" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400"}`}
          >
            View Once
          </button>
          <button
            type="button"
            onClick={() => setMode("persistent")}
            className={`px-2 py-1 text-xs ${mode === "persistent" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400"}`}
          >
            Keep Image
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              onSendImage(selected, mode);
              event.target.value = "";
            }
          }}
          disabled={disabled}
        />
        <Button
          type="button"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-500 h-10 w-10 sm:h-11 sm:w-11 shrink-0"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="sr-only">Upload image</span>
        </Button>
        <Input
          type="text"
          placeholder="Message..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (onTyping) onTyping(e.target.value.length > 0);
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
  );
}
