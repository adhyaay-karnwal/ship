'use client'

import { useState, useMemo } from 'react'
import { cn } from '@ship/ui/utils'
import type { UIMessage, ToolInvocation } from '@/lib/ai-elements-adapter'
import type { SessionPanelProps, Todo } from './types'
import { StatRow, formatTokenCount, formatCost, formatDate, formatRelative } from './helpers'
import { ContextBreakdownBar } from './context-breakdown'
import { RawMessagesSection } from './raw-messages-section'

// ---- Helpers for inline task detail ----

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function findRelatedTools(todo: Todo, messages: UIMessage[]): ToolInvocation[] {
  const todoLower = todo.content.toLowerCase()
  const related: ToolInvocation[] = []
  for (const msg of messages) {
    if (!msg.toolInvocations) continue
    for (const tool of msg.toolInvocations) {
      const name = tool.toolName.toLowerCase()
      if (name.includes('task') || name.includes('agent')) {
        const argsStr = JSON.stringify(tool.args || {}).toLowerCase()
        if (argsStr.includes(todoLower.slice(0, 30)) || todoLower.includes(name)) {
          related.push(tool)
          continue
        }
        related.push(tool)
      }
    }
  }
  return related
}

// ---- Inline tool row ----

function ToolStatusDot({ state }: { state: string }) {
  return (
    <span
      className={cn(
        'w-1.5 h-1.5 rounded-full shrink-0',
        state === 'result' && 'bg-green-500',
        state === 'error' && 'bg-red-500',
        state === 'call' && 'bg-primary animate-pulse',
        state === 'partial-call' && 'bg-muted-foreground/40',
      )}
    />
  )
}

function MiniToolRow({ tool }: { tool: ToolInvocation }) {
  const summary = useMemo(() => {
    const a = tool.args
    if (a?.file_path || a?.path || a?.filePath) {
      const p = String(a.file_path || a.path || a.filePath || '')
      const segs = p.split('/')
      return segs.length > 2 ? '.../' + segs.slice(-2).join('/') : p
    }
    if (a?.command) return String(a.command).slice(0, 40)
    if (a?.pattern || a?.query) return String(a.pattern || a.query).slice(0, 40)
    if (a?.description) return String(a.description).slice(0, 40)
    return null
  }, [tool.args])

  return (
    <div className="flex items-center gap-1.5 py-0.5 text-[10px]">
      <ToolStatusDot state={tool.state} />
      <span className="font-medium text-foreground/70">{tool.toolName}</span>
      {summary && <span className="text-muted-foreground/50 truncate font-mono">{summary}</span>}
      {tool.duration !== undefined && (
        <span className="text-muted-foreground/30 ml-auto shrink-0">{formatDuration(tool.duration)}</span>
      )}
    </div>
  )
}

// ---- Inline expandable task item ----

function TaskItem({ todo, messages }: { todo: Todo; messages: UIMessage[] }) {
  const [expanded, setExpanded] = useState(false)
  const isInProgress = todo.status === 'in_progress'
  const isCompleted = todo.status === 'completed'
  const isCancelled = todo.status === 'cancelled'

  const relatedTools = useMemo(
    () => (expanded ? findRelatedTools(todo, messages) : []),
    [expanded, todo, messages],
  )

  return (
    <div className="rounded-md transition-colors">
      {/* Clickable row */}
      <div
        className={cn(
          'flex items-start gap-2 py-1 px-1.5 rounded-md cursor-pointer transition-colors hover:bg-muted/30',
          expanded && 'bg-muted/20',
        )}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        {/* Status indicator */}
        {isInProgress ? (
          <span className="relative flex h-3 w-3 shrink-0 mt-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/30 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 border-[1.5px] border-primary/30 border-t-primary animate-spin" />
          </span>
        ) : isCompleted ? (
          <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40 shrink-0 mt-0.5 flex items-center justify-center">
            <svg className="w-2 h-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : isCancelled ? (
          <span className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/30 shrink-0 mt-0.5" />
        ) : (
          <span className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0 mt-0.5" />
        )}

        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-[11px] leading-tight',
            isInProgress ? 'text-foreground/90 font-medium' : isCompleted ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground/70',
          )}>
            {todo.content}
          </p>
          {todo.priority === 'high' && !isCompleted && (
            <span className="text-[9px] text-orange-500/70">high priority</span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={cn(
            'w-3 h-3 text-muted-foreground/30 shrink-0 mt-0.5 transition-transform',
            expanded && 'rotate-90',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Expanded detail (inline collapsible) */}
      {expanded && (
        <div className="ml-5 mr-1 mt-1 mb-2 pl-2 border-l border-border/30 space-y-2">
          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
              todo.status === 'pending' && 'text-muted-foreground bg-muted/50',
              todo.status === 'in_progress' && 'text-primary bg-primary/10',
              todo.status === 'completed' && 'text-green-600 bg-green-500/10',
              todo.status === 'cancelled' && 'text-red-600 bg-red-500/10',
            )}>
              {todo.status === 'in_progress' ? 'In Progress' : todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
            </span>
            {todo.priority !== 'medium' && (
              <span className="text-[9px] text-muted-foreground/50 px-1.5 py-0.5 rounded-full bg-muted/30">
                {todo.priority}
              </span>
            )}
          </div>

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-medium mb-1">
                Tools ({relatedTools.length})
              </p>
              <div className="space-y-0.5">
                {relatedTools.slice(0, 6).map((tool) => (
                  <MiniToolRow key={tool.toolCallId} tool={tool} />
                ))}
                {relatedTools.length > 6 && (
                  <p className="text-[9px] text-muted-foreground/30">+{relatedTools.length - 6} more</p>
                )}
              </div>
            </div>
          )}

          {relatedTools.length === 0 && (
            <p className="text-[9px] text-muted-foreground/30">No related tool activity yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Main component ----

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
  const totalTokens = tokens ? tokens.input + tokens.output + tokens.reasoning : 0
  const contextLimit = tokens?.contextLimit || 200000
  const usagePercent = tokens ? Math.min((totalTokens / contextLimit) * 100, 100) : 0

  const messageCounts = useMemo(() => {
    const user = messages.filter((m) => m.role === 'user').length
    const assistant = messages.filter((m) => m.role === 'assistant').length
    return { total: messages.length, user, assistant }
  }, [messages])

  const totalChanges = useMemo(() => {
    if (!diffs || diffs.length === 0) return null
    return diffs.reduce(
      (acc, d) => ({ add: acc.add + d.additions, del: acc.del + d.deletions }),
      { add: 0, del: 0 },
    )
  }, [diffs])

  const activeTodos = useMemo(
    () => (todos || []).filter((t) => t.status === 'pending' || t.status === 'in_progress'),
    [todos],
  )
  const completedTodos = useMemo(
    () => (todos || []).filter((t) => t.status === 'completed' || t.status === 'cancelled'),
    [todos],
  )
  const allTodos = useMemo(() => [...activeTodos, ...completedTodos], [activeTodos, completedTodos])

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

      {/* Active Tools */}
      {activeTools.length > 0 && (
        <>
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Running</div>
            <div className="space-y-1.5">
              {activeTools.map((tool) => (
                <div key={tool.toolCallId} className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                  </span>
                  <span className="text-[11px] text-foreground/80 font-medium">{tool.toolName}</span>
                  {tool.title && <span className="text-[10px] text-muted-foreground/50 truncate">{tool.title}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="mx-4 border-t border-border/20" />
        </>
      )}

      {/* Tasks (all — active first, then completed) */}
      {allTodos.length > 0 && (
        <>
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">
              Tasks ({activeTodos.length}/{allTodos.length})
            </div>
            <div className="space-y-0.5">
              {allTodos.map((todo) => (
                <TaskItem key={todo.id} todo={todo} messages={messages} />
              ))}
            </div>
          </div>
          <div className="mx-4 border-t border-border/20" />
        </>
      )}

      {/* Stats Grid */}
      <div className="px-4 py-3 space-y-0.5">
        <StatRow label="Session" value={sessionInfo?.id?.slice(0, 8) || sessionId.slice(0, 8)} mono />
        <StatRow label="Messages" value={messageCounts.total} />

        {model && (
          <>
            {model.provider && <StatRow label="Provider" value={model.provider} />}
            <StatRow label="Model" value={model.name || model.id} />
            {model.mode && (
              <div className="flex items-baseline justify-between py-0.5">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">Mode</span>
                <span className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  model.mode === 'build' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500',
                )}>
                  {model.mode}
                </span>
              </div>
            )}
          </>
        )}

        {repo && <StatRow label="Repo" value={`${repo.owner}/${repo.name}`} mono />}

        {tokens && (
          <>
            <div className="pt-1.5 mt-1.5 border-t border-border/10" />
            <StatRow label="Context Limit" value={formatTokenCount(contextLimit)} mono />
            <StatRow label="Total Tokens" value={formatTokenCount(totalTokens)} mono />
            <StatRow label="Usage" value={`${usagePercent.toFixed(0)}%`} />
            <StatRow label="Input" value={formatTokenCount(tokens.input)} mono />
            <StatRow label="Output" value={formatTokenCount(tokens.output)} mono />
            {tokens.reasoning > 0 && <StatRow label="Reasoning" value={formatTokenCount(tokens.reasoning)} mono />}
            {(tokens.cache.read > 0 || tokens.cache.write > 0) && (
              <StatRow label="Cache" value={formatTokenCount(tokens.cache.read + tokens.cache.write)} mono />
            )}
            <StatRow label="User Msgs" value={messageCounts.user} />
            <StatRow label="Asst Msgs" value={messageCounts.assistant} />
          </>
        )}

        {cost !== undefined && cost > 0 && <StatRow label="Total Cost" value={formatCost(cost)} mono />}

        {sessionInfo?.time && (
          <>
            <div className="pt-1.5 mt-1.5 border-t border-border/10" />
            <StatRow label="Created" value={formatDate(sessionInfo.time.created)} />
            <StatRow label="Last Activity" value={formatRelative(sessionInfo.time.updated)} />
          </>
        )}
      </div>

      {/* Context Breakdown */}
      {tokens && totalTokens > 0 && (
        <>
          <div className="mx-4 border-t border-border/20" />
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Context Breakdown</div>
            <ContextBreakdownBar tokens={tokens} />
          </div>
        </>
      )}

      {/* Changes */}
      {diffs && diffs.length > 0 && totalChanges && (
        <>
          <div className="mx-4 border-t border-border/20" />
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Changes</div>
            <div className="flex items-center gap-3 text-[11px] mb-2">
              <span className="text-green-500 font-medium">+{totalChanges.add}</span>
              <span className="text-red-500 font-medium">-{totalChanges.del}</span>
              <span className="text-muted-foreground/50">{diffs.length} file{diffs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-1">
              {diffs.slice(0, 8).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] text-muted-foreground font-mono gap-2">
                  <span className="truncate flex-1">{(d.filename || '').split('/').pop() || 'unknown'}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-green-500">+{d.additions}</span>
                    <span className="text-red-500">-{d.deletions}</span>
                  </div>
                </div>
              ))}
              {diffs.length > 8 && <div className="text-[10px] text-muted-foreground/50 mt-1">...{diffs.length - 8} more</div>}
            </div>
          </div>
        </>
      )}

      {/* OpenCode URL */}
      {openCodeUrl && (
        <>
          <div className="mx-4 border-t border-border/20" />
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">OpenCode</div>
            <a
              href={openCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary hover:underline truncate text-[11px] font-mono block"
              title={openCodeUrl}
            >
              {(() => {
                try {
                  const url = new URL(openCodeUrl)
                  const path = url.pathname.length > 20 ? url.pathname.slice(0, 17) + '...' : url.pathname
                  return url.host + path
                } catch {
                  return openCodeUrl.replace(/^https?:\/\//, '').slice(0, 30)
                }
              })()}
            </a>
          </div>
        </>
      )}

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
