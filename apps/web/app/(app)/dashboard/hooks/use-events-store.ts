'use client'

import { useSyncExternalStore } from 'react'

export interface RawEvent {
  id: string
  type: string
  timestamp: number
  payload: unknown
}

type Listener = () => void

function createEventsStore() {
  const events = new Map<string, RawEvent[]>()
  const listeners = new Set<Listener>()
  let version = 0

  function notify() {
    for (const l of listeners) l()
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return version
    },
    addEvent(sessionId: string, event: RawEvent) {
      const existing = events.get(sessionId) ?? []
      // Cap at 500 events per session to avoid memory issues
      const updated = [...existing, event].slice(-500)
      events.set(sessionId, updated)
      version++
      notify()
    },
    replaceEvents(sessionId: string, newEvents: RawEvent[]) {
      events.set(sessionId, newEvents.slice(-500))
      version++
      notify()
    },
    getEvents(sessionId: string): RawEvent[] {
      return events.get(sessionId) ?? []
    },
    clearEvents(sessionId: string) {
      events.delete(sessionId)
      version++
      notify()
    },
  }
}

// Singleton
const store = createEventsStore()

export function useEventsStore(sessionId: string): RawEvent[] {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  // Re-render triggered by version change, then read current data
  return store.getEvents(sessionId)
}

/**
 * Hydrate events store from persisted message parts (for session reload).
 * Only adds events when store is empty for this session to avoid duplicates.
 */
export function hydrateEventsFromMessages(
  sessionId: string,
  apiMessages: Array<{ parts?: string }>,
): void {
  if (store.getEvents(sessionId).length > 0) return
  for (const msg of apiMessages) {
    if (!msg.parts) continue
    try {
      const parts = JSON.parse(msg.parts) as Array<{ type?: string; [k: string]: unknown }>
      for (const part of parts) {
        const eventType = part?.type ?? 'message.part.updated'
        store.addEvent(sessionId, {
          id: crypto.randomUUID(),
          type: eventType,
          timestamp: Date.now(),
          payload: part,
        })
      }
    } catch {
      // Ignore parse errors
    }
  }
}

export { store as eventsStore }
