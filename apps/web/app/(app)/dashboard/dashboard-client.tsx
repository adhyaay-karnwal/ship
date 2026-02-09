'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SidebarProvider, SidebarInset, cn } from '@ship/ui'
import { AppSidebar } from '@/components/app-sidebar'
import { useGitHubRepos } from '@/lib/api/hooks/use-repos'
import { useModels, useDefaultModel } from '@/lib/api/hooks/use-models'
import { useDefaultRepo } from '@/lib/api/hooks/use-default-repo'
import { useCreateSession } from '@/lib/api/hooks/use-sessions'
import type { ChatSession } from '@/lib/api/server'
import type { GitHubRepo, ModelInfo, User } from '@/lib/api/types'
import { useDashboardChat } from './hooks/use-dashboard-chat'
import { useDashboardSSE } from './hooks/use-dashboard-sse'
import { useRightSidebar } from './hooks/use-right-sidebar'
import { useSessionSync } from './hooks/use-session-sync'
import { DashboardHeader } from './components/dashboard-header'
import { DashboardMessages } from './components/dashboard-messages'
import { DashboardComposer } from './components/composer'
import { RightSidebar } from './components/right-sidebar'

interface DashboardClientProps {
  sessions: ChatSession[]
  userId: string
  user: User
}

export function DashboardClient({ sessions: initialSessions, userId, user }: DashboardClientProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null)
  const [mode, setMode] = useState<'build' | 'plan'>('build')
  const [prompt, setPrompt] = useState('')

  // ---- Core chat state ----
  const chat = useDashboardChat(initialSessions)

  // ---- SSE streaming ----
  const { handleSend } = useDashboardSSE({
    activeSessionId: chat.activeSessionId,
    isStreaming: chat.isStreaming,
    mode,
    setIsStreaming: chat.setIsStreaming,
    setMessages: chat.setMessages,
    setTotalCost: chat.setTotalCost,
    setLastStepCost: chat.setLastStepCost,
    setSessionTodos: chat.setSessionTodos,
    setFileDiffs: chat.setFileDiffs,
    setMessageQueue: chat.setMessageQueue,
    setOpenCodeUrl: chat.setOpenCodeUrl,
    setSessionTitle: chat.setSessionTitle,
    setSessionInfo: chat.setSessionInfo,
    streamingMessageRef: chat.streamingMessageRef,
    assistantTextRef: chat.assistantTextRef,
    reasoningRef: chat.reasoningRef,
    setStreamStartTime: chat.setStreamStartTime,
  })

  // ---- Data fetching ----
  const { repos, isLoading: reposLoading } = useGitHubRepos(userId)
  const { models, groupedByProvider, isLoading: modelsLoading } = useModels()
  const { defaultModelId } = useDefaultModel(userId)
  const { defaultRepoFullName } = useDefaultRepo(userId)
  const { createSession, isCreating } = useCreateSession()

  // ---- Sync effects (URL param, default model, repo, message queue) ----
  useSessionSync({
    sessionParam: searchParams.get('session'),
    activeSessionId: chat.activeSessionId,
    setActiveSessionId: chat.setActiveSessionId,
    connectWebSocket: chat.connectWebSocket,
    models,
    selectedModel,
    setSelectedModel,
    defaultModelId,
    repos,
    localSessions: chat.localSessions,
    setSelectedRepo,
    isStreaming: chat.isStreaming,
    messageQueue: chat.messageQueue,
    setMessageQueue: chat.setMessageQueue,
    handleSend,
  })

  // ---- Default repo selection ----
  useEffect(() => {
    if (!selectedRepo && defaultRepoFullName && repos.length > 0) {
      const match = repos.find((r) => r.fullName === defaultRepoFullName)
      if (match) setSelectedRepo(match)
    }
  }, [defaultRepoFullName, repos, selectedRepo])

  // ---- Right sidebar ----
  const rightSidebar = useRightSidebar()

  // ---- Session creation ----
  const handleCreate = useCallback(
    async (data: { repoOwner: string; repoName: string; model?: string }) => {
      try {
        const newSession = await createSession({
          userId,
          repoOwner: data.repoOwner,
          repoName: data.repoName,
          model: data.model || selectedModel?.id || 'opencode/kimi-k2.5-free',
        })

        if (newSession) {
          const newSessionData: ChatSession = {
            id: newSession.id,
            userId,
            repoOwner: data.repoOwner,
            repoName: data.repoName,
            status: 'active',
            lastActivity: Math.floor(Date.now() / 1000),
            createdAt: Math.floor(Date.now() / 1000),
            archivedAt: null,
            messageCount: 0,
          }
          chat.setLocalSessions((prev) => [newSessionData, ...prev])
          chat.setActiveSessionId(newSession.id)
          window.history.replaceState({}, '', `/session/${newSession.id}`)
          chat.connectWebSocket(newSession.id)

          const trimmedPrompt = prompt.trim()
          if (trimmedPrompt) {
            setPrompt('')
            handleSend(trimmedPrompt, mode, newSession.id)
          }
        }
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    },
    [createSession, userId, selectedModel, prompt, mode, chat, handleSend],
  )

  // ---- Submit / keyboard ----
  const handleSubmit = useCallback(() => {
    if (chat.activeSessionId) {
      if (!prompt.trim() || chat.isStreaming) return
      const content = prompt.trim()
      setPrompt('')
      handleSend(content, mode)
    } else {
      if (!selectedRepo || !prompt.trim() || isCreating) return
      handleCreate({
        repoOwner: selectedRepo.owner,
        repoName: selectedRepo.name,
        model: selectedModel?.id,
      })
    }
  }, [chat.activeSessionId, chat.isStreaming, prompt, selectedRepo, isCreating, selectedModel, handleSend, handleCreate, mode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  // ---- Derived values ----
  const displayTitle = useMemo(
    () => chat.sessionInfo?.title || chat.sessionTitle || undefined,
    [chat.sessionInfo?.title, chat.sessionTitle],
  )

  const stats = useMemo(() => {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60
    const recent = chat.localSessions.filter((s) => s.lastActivity > oneWeekAgo)
    return {
      sessionsPastWeek: recent.length,
      messagesPastWeek: recent.reduce((acc, s) => acc + (s.messageCount || 0), 0),
      activeRepos: new Set(chat.localSessions.map((s) => `${s.repoOwner}/${s.repoName}`)).size,
    }
  }, [chat.localSessions])

  const canSubmit = Boolean(
    chat.activeSessionId ? prompt.trim() && !chat.isStreaming : selectedRepo && prompt.trim() && !isCreating,
  )

  // ---- Render ----
  return (
    <SidebarProvider defaultOpen={!!chat.activeSessionId}>
      <AppSidebar
        sessions={chat.localSessions}
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentSessionId={chat.activeSessionId || undefined}
        currentSessionTitle={displayTitle}
        onSessionDeleted={(id) => chat.setLocalSessions((prev) => prev.filter((s) => s.id !== id))}
        isStreaming={chat.isStreaming}
      />

      <SidebarInset>
        <div className="flex h-screen h-[100dvh] relative overflow-hidden">
          {/* Main column */}
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader
              activeSessionId={chat.activeSessionId}
              sessionTitle={displayTitle}
              wsStatus={chat.wsStatus}
              sandboxStatus={chat.sandboxStatus}
              rightSidebarOpen={rightSidebar.desktopOpen}
              onToggleRightSidebar={rightSidebar.toggle}
            />

            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
              <div className={cn('flex-1 overflow-hidden', chat.activeSessionId ? 'opacity-100' : 'opacity-0 h-0')}>
                <DashboardMessages
                  activeSessionId={chat.activeSessionId}
                  messages={chat.messages}
                  isStreaming={chat.isStreaming}
                  streamingMessageId={chat.streamingMessageRef.current}
                  streamStartTime={chat.streamStartTime}
                  sessionTodos={chat.sessionTodos}
                />
              </div>

              <DashboardComposer
                activeSessionId={chat.activeSessionId}
                prompt={prompt}
                onPromptChange={setPrompt}
                onKeyDown={handleKeyDown}
                selectedRepo={selectedRepo}
                onRepoSelect={setSelectedRepo}
                repos={repos}
                reposLoading={reposLoading}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                modelsLoading={modelsLoading}
                groupedByProvider={groupedByProvider}
                mode={mode}
                onModeChange={setMode}
                onSubmit={handleSubmit}
                onStop={chat.handleStop}
                isCreating={isCreating}
                isStreaming={chat.isStreaming}
                messageQueueLength={chat.messageQueue.length}
                stats={stats}
                canSubmit={canSubmit}
              />
            </div>
          </div>

          {/* Right sidebar (desktop + mobile) */}
          {chat.activeSessionId && (
            <RightSidebar
              data={{
                sessionId: chat.activeSessionId,
                selectedRepo,
                selectedModel,
                mode,
                lastStepCost: chat.lastStepCost,
                totalCost: chat.totalCost,
                sessionTodos: chat.sessionTodos,
                fileDiffs: chat.fileDiffs,
                openCodeUrl: chat.openCodeUrl,
                sessionInfo: chat.sessionInfo,
                messages: chat.messages,
              }}
              desktopOpen={rightSidebar.desktopOpen}
              mobileOpen={rightSidebar.mobileOpen}
              isMobile={rightSidebar.isMobile}
              onMobileOpenChange={rightSidebar.setMobileOpen}
            />
          )}
        </div>
      </SidebarInset>

    </SidebarProvider>
  )
}
