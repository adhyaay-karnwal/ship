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

  function notify() {
    for (const l of listeners) l()
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return events
    },
    addEvent(sessionId: string, event: RawEvent) {
      const existing = events.get(sessionId) ?? []
      // Cap at 500 events per session to avoid memory issues
      const updated = [...existing, event].slice(-500)
      events.set(sessionId, updated)
      notify()
    },
    getEvents(sessionId: string): RawEvent[] {
      return events.get(sessionId) ?? []
    },
    clearEvents(sessionId: string) {
      events.delete(sessionId)
      notify()
    },
  }
}

// Singleton
const store = createEventsStore()

export function useEventsStore(sessionId: string): RawEvent[] {
  const map = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
  return map.get(sessionId) ?? []
}

export { store as eventsStore }
