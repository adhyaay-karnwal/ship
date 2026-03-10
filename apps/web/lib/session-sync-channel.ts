/**
 * BroadcastChannel for syncing session list across browser tabs.
 * When one tab creates/deletes a session, other tabs revalidate.
 */

const CHANNEL_NAME = 'ship-sessions-sync'

export type SessionSyncMessage =
  | { type: 'session-created' }
  | { type: 'session-deleted' }
  | { type: 'sessions-invalidate' }

export function getSessionSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  try {
    return new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

export function postSessionSync(message: SessionSyncMessage): void {
  const channel = getSessionSyncChannel()
  channel?.postMessage(message)
}

export function subscribeSessionSync(callback: (message: SessionSyncMessage) => void): () => void {
  const channel = getSessionSyncChannel()
  if (!channel) return () => {}

  const handler = (e: MessageEvent<SessionSyncMessage>) => {
    if (e.data?.type) callback(e.data)
  }
  channel.addEventListener('message', handler)
  return () => channel.removeEventListener('message', handler)
}
