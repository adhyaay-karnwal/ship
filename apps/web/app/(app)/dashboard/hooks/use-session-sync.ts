'use client'

import { useEffect } from 'react'
import type { ChatSession } from '@/lib/api/server'
import type { GitHubRepo, ModelInfo } from '@/lib/api/types'

interface UseSessionSyncParams {
  /** URL search params (from useSearchParams) */
  sessionParam: string | null
  /** Current active session ID */
  activeSessionId: string | null
  setActiveSessionId: (id: string) => void
  connectWebSocket: (id: string) => void
  /** Model data */
  models: ModelInfo[]
  selectedModel: ModelInfo | null
  setSelectedModel: (model: ModelInfo) => void
  /** User's saved default model ID from settings */
  defaultModelId: string | null
  /** Repo data */
  repos: GitHubRepo[]
  localSessions: ChatSession[]
  setSelectedRepo: (repo: GitHubRepo) => void
  /** Message queue */
  isStreaming: boolean
  messageQueue: string[]
  setMessageQueue: React.Dispatch<React.SetStateAction<string[]>>
  handleSend: (content: string) => void
}

/**
 * Handles side-effects that sync external state into the dashboard:
 * - Activating a session from the URL param (?session=xxx)
 * - Setting the default model when models load (uses saved default from settings)
 * - Syncing selectedRepo when active session changes
 * - Processing queued messages when streaming completes
 */
export function useSessionSync({
  sessionParam,
  activeSessionId,
  setActiveSessionId,
  connectWebSocket,
  models,
  selectedModel,
  setSelectedModel,
  defaultModelId,
  repos,
  localSessions,
  setSelectedRepo,
  isStreaming,
  messageQueue,
  setMessageQueue,
  handleSend,
}: UseSessionSyncParams) {
  // Activate session from URL param (e.g., /?session=abc123 from /session/[id] redirect)
  useEffect(() => {
    if (sessionParam && !activeSessionId) {
      setActiveSessionId(sessionParam)
      connectWebSocket(sessionParam)
      window.history.replaceState({}, '', `/session/${sessionParam}`)
    }
  }, [sessionParam, activeSessionId, setActiveSessionId, connectWebSocket])

  // Set default model once loaded — prefer user's saved default from settings
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      // Priority: 1) user's saved default from settings, 2) API-marked default, 3) first model
      const savedDefault = defaultModelId ? models.find((m) => m.id === defaultModelId) : null
      const markedDefault = models.find((m) => m.isDefault)
      setSelectedModel(savedDefault || markedDefault || models[0])
    }
  }, [models, selectedModel, setSelectedModel, defaultModelId])

  // Update selectedRepo when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      const session = localSessions.find((s) => s.id === activeSessionId)
      if (session) {
        const repo = repos.find(
          (r) => r.owner === session.repoOwner && r.name === session.repoName,
        )
        if (repo) setSelectedRepo(repo)
      }
    }
  }, [activeSessionId, localSessions, repos, setSelectedRepo])

  // Process queued messages when streaming completes
  useEffect(() => {
    if (!isStreaming && messageQueue.length > 0 && activeSessionId) {
      const [next, ...rest] = messageQueue
      setMessageQueue(rest)
      handleSend(next)
    }
  }, [isStreaming, messageQueue, activeSessionId, handleSend, setMessageQueue])
}
