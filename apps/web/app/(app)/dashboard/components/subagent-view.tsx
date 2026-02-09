'use client'

import * as React from 'react'
import { Message, Tool, Response, Loader, Steps, Conversation, ConversationScrollButton } from '@ship/ui'
import { Markdown } from '@/components/chat/markdown'
import { mapToolState } from '@/lib/ai-elements-adapter'
import { useSubagentStream } from '../hooks/use-subagent-stream'

interface SubagentViewState {
  toolCallId: string
  agentType: string
  description: string
  sessionId?: string
}

interface SubagentViewProps {
  subagent: SubagentViewState
  onBack: () => void
}

export function SubagentView({ subagent, onBack }: SubagentViewProps) {
  const { messages, isStreaming, status } = useSubagentStream({
    sessionId: subagent.sessionId || null,
  })

  const hasStreamData = subagent.sessionId && messages.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="h-4 w-px bg-border/50" />
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-4 h-4 shrink-0 text-muted-foreground/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-sm font-medium text-foreground truncate">{subagent.agentType}</span>
          {isStreaming && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Conversation className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
          {/* Agent input / prompt */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-2 font-medium">Prompt</div>
            <div className="text-sm text-foreground/80 bg-muted/30 rounded-lg px-4 py-3 border border-border/20">
              {subagent.description}
            </div>
          </div>

          {/* Status */}
          {status && (
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground/60">
              {isStreaming && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/60" />
                </span>
              )}
              {status}
            </div>
          )}

          {/* Streaming content from child session */}
          {hasStreamData ? (
            messages.map((message) => {
              if (!message.content && !message.toolInvocations?.length && !message.reasoning?.length) {
                return isStreaming ? (
                  <Message key={message.id} role="assistant">
                    <Loader message={status || 'Working...'} />
                  </Message>
                ) : null
              }

              const hasSteps =
                message.role === 'assistant' &&
                ((message.reasoning && message.reasoning.length > 0) ||
                  (message.toolInvocations && message.toolInvocations.length > 0))

              return (
                <Message key={message.id} role={message.role}>
                  {hasSteps && (
                    <Steps isStreaming={isStreaming} toolCount={message.toolInvocations?.length}>
                      {message.reasoning && message.reasoning.length > 0 && (
                        <div className="text-sm text-muted-foreground/80 border-l-2 border-border/40 pl-3 py-1 my-1">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {message.reasoning.join('\n\n')}
                          </div>
                        </div>
                      )}
                      {message.toolInvocations && message.toolInvocations.length > 0 && (
                        <div className="space-y-2 my-1">
                          {message.toolInvocations.map((tool) => (
                            <Tool
                              key={tool.toolCallId}
                              name={tool.toolName}
                              status={mapToolState(tool.state)}
                              input={tool.args}
                              output={tool.result}
                              duration={tool.duration}
                            />
                          ))}
                        </div>
                      )}
                    </Steps>
                  )}
                  {message.role === 'assistant' && message.content && (
                    <div className={hasSteps ? 'mt-4' : undefined}>
                      <Response>
                        <Markdown content={message.content} />
                      </Response>
                    </div>
                  )}
                </Message>
              )
            })
          ) : !subagent.sessionId ? (
            // No child session — show fallback
            <div className="text-sm text-muted-foreground/60 text-center py-12">
              No streaming data available for this sub-agent.
            </div>
          ) : (
            <Message role="assistant">
              <Loader message="Connecting to sub-agent session..." />
            </Message>
          )}
        </div>
        <ConversationScrollButton />
      </Conversation>
    </div>
  )
}

export type { SubagentViewState }
