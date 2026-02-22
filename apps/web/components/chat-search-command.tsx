'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ship/ui'
import type { ChatSession } from '@/lib/api'

interface ChatSearchCommandProps {
  open: boolean
  onClose: () => void
  sessions: ChatSession[]
  currentSessionId?: string
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  const days = Math.floor(seconds / 86400)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function ChatSearchCommand({ open, onClose, sessions, currentSessionId }: ChatSearchCommandProps) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const active = sessions.filter((s) => !s.archivedAt)
  const archived = sessions.filter((s) => !!s.archivedAt)

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-background rounded-xl border border-border/50 shadow-2xl overflow-hidden">
        <Command loop>
          <CommandInput placeholder="Search chats..." autoFocus />
          <CommandList>
            <CommandEmpty>No chats found.</CommandEmpty>

            {active.length > 0 && (
              <CommandGroup heading="Chats">
                {active
                  .sort((a, b) => b.lastActivity - a.lastActivity)
                  .map((session) => {
                    const title = session.repoName
                    const sub = `${session.repoOwner}/${session.repoName}`
                    return (
                      <CommandItem
                        key={session.id}
                        value={`${title} ${sub}`}
                        onSelect={() => {
                          router.push(`/session/${session.id}`)
                          onClose()
                        }}
                        className={currentSessionId === session.id ? 'bg-accent' : ''}
                      >
                        <ChatIcon className="size-4 shrink-0 text-muted-foreground/50" />
                        <div className="flex-1 min-w-0">
                          <span className="truncate">{title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground/40 shrink-0">
                          {formatRelativeTime(session.lastActivity)}
                        </span>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            )}

            {archived.length > 0 && (
              <CommandGroup heading="Archived">
                {archived
                  .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0))
                  .map((session) => (
                    <CommandItem
                      key={session.id}
                      value={`${session.repoName} ${session.repoOwner}/${session.repoName}`}
                      onSelect={() => {
                        router.push(`/session/${session.id}`)
                        onClose()
                      }}
                      className="opacity-50"
                    >
                      <ChatIcon className="size-4 shrink-0 text-muted-foreground/40" />
                      <span className="flex-1 truncate">{session.repoOwner}/{session.repoName}</span>
                      <span className="text-xs text-muted-foreground/30 shrink-0">
                        {formatRelativeTime(session.archivedAt ?? session.lastActivity)}
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </div>,
    document.body,
  )
}
