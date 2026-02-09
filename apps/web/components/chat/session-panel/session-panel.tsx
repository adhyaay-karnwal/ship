'use client'

import { useMemo } from 'react'
import { cn } from '@ship/ui/utils'
import type { SessionPanelProps } from './types'
import { ActiveToolsSection } from './active-tools-section'
import { TasksSection } from './tasks-section'
import { StatsSection } from './stats-section'
import { ChangesSection } from './changes-section'
import { OpenCodeLink } from './opencode-link'
import { SessionActionsSection } from './session-actions-section'
import { VCSSection } from './vcs-section'
import { RawMessagesSection } from './raw-messages-section'

export function SessionPanel({
  sessionId,
  repo,
  model,
  tokens,
  cost,
  todos,
  diffs,
  sessionInfo,
  openCodeUrl,
  messages = [],
  className,
}: SessionPanelProps) {
  const activeTools = useMemo(() => {
    const tools: Array<{ toolCallId: string; toolName: string; title?: string }> = []
    for (let i = messages.length - 1; i >= 0 && tools.length < 5; i--) {
      const msg = messages[i]
      if (!msg.toolInvocations) continue
      for (const tool of msg.toolInvocations) {
        if (tool.state === 'call' || tool.state === 'partial-call') {
          tools.push({ toolCallId: tool.toolCallId, toolName: tool.toolName, title: tool.title })
        }
      }
    }
    return tools
  }, [messages])

  return (
    <div className={cn('flex flex-col text-xs overflow-y-auto', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/20">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">Context</div>
        {sessionInfo?.title && (
          <div className="text-foreground font-medium text-[12px] leading-snug" title={sessionInfo.title}>
            {sessionInfo.title}
          </div>
        )}
      </div>

      <ActiveToolsSection tools={activeTools} />
      <TasksSection todos={todos || []} messages={messages} />
      <StatsSection
        sessionId={sessionId}
        model={model}
        repo={repo}
        tokens={tokens}
        cost={cost}
        messages={messages}
        sessionInfo={sessionInfo}
      />
      <ChangesSection diffs={diffs || []} />
      <VCSSection sessionInfo={sessionInfo} />
      <SessionActionsSection tokens={tokens} sessionCreatedAt={sessionInfo?.time?.created} />
      {openCodeUrl && <OpenCodeLink url={openCodeUrl} />}

      {/* Raw Messages */}
      {messages.length > 0 && (
        <>
          <div className="mx-4 border-t border-border/20" />
          <RawMessagesSection messages={messages} />
        </>
      )}

      {/* Empty state */}
      {!repo && !model && !tokens && !sessionInfo && !openCodeUrl && messages.length === 0 && (
        <div className="px-4 py-8 text-muted-foreground/50 text-center text-[11px]">
          Waiting for session data...
        </div>
      )}
    </div>
  )
}
