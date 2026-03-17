'use client'

import { useState, useCallback } from 'react'
import { cn } from '@ship/ui/utils'
import { useEventsStore, eventsStore, type RawEvent } from '@/app/(app)/dashboard/hooks/use-events-store'

function getEventColor(type: string): string {
  if (type === 'done' || type === 'session.idle') return 'bg-green-500'
  if (type.startsWith('message.')) return 'bg-blue-500'
  if (type === 'error' || type === 'session.error') return 'bg-red-500'
  if (type.startsWith('permission.') || type.startsWith('question.')) return 'bg-purple-500'
  if (type === 'status' || type === 'session.status' || type === 'heartbeat' || type === 'server.heartbeat') return 'bg-yellow-500'
  return 'bg-muted-foreground/50'
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
}

function EventRow({ event }: { event: RawEvent }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-border/5 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted/30 transition-colors text-left"
      >
        <span className={cn('size-1.5 rounded-full shrink-0', getEventColor(event.type))} />
        <span className="font-mono text-[10px] text-foreground/80 truncate flex-1">{event.type}</span>
        <span className="text-[9px] text-muted-foreground/50 shrink-0 tabular-nums">{formatTime(event.timestamp)}</span>
        <svg
          className={cn('size-3 text-muted-foreground/40 shrink-0 transition-transform', expanded && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {expanded && (
        <pre className="px-3 py-2 text-[9px] font-mono text-muted-foreground/70 bg-muted/20 overflow-x-auto max-h-48 overflow-y-auto">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      )}
    </div>
  )
}

export function EventsSection({ sessionId }: { sessionId: string }) {
  const events = useEventsStore(sessionId)
  const [collapsed, setCollapsed] = useState(true)

  const handleCopyAll = useCallback(() => {
    const text = JSON.stringify(events.map(e => ({ type: e.type, timestamp: e.timestamp, payload: e.payload })), null, 2)
    navigator.clipboard.writeText(text)
  }, [events])

  const handleClear = useCallback(() => {
    eventsStore.clearEvents(sessionId)
  }, [sessionId])

  return (
    <div className="px-3 py-2 border-t border-border/10">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-1"
      >
        <span className="text-[10px] text-muted-foreground/50">
          Events{events.length > 0 ? ` (${events.length})` : ''}
        </span>
        <svg
          className={cn('size-3 text-muted-foreground/40 transition-transform', !collapsed && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {!collapsed && (
        <>
          {events.length > 0 && (
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={handleCopyAll}
                className="text-[9px] text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                Copy All
              </button>
              <button
                onClick={handleClear}
                className="text-[9px] text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto rounded border border-border/10 bg-background/50">
            {events.length === 0 ? (
              <div className="px-2 py-3 text-[9px] text-muted-foreground/30 text-center">
                No events yet
              </div>
            ) : (
              events.map((event) => <EventRow key={event.id} event={event} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}
