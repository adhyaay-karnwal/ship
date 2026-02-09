'use client'

import { useState, useMemo } from 'react'
import { cn } from '@ship/ui/utils'
import type { UIMessage, ToolInvocation } from '@/lib/ai-elements-adapter'
import type { Todo } from './types'
import { MiniToolRow } from './mini-tool-row'

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

export function TaskItem({ todo, messages }: { todo: Todo; messages: UIMessage[] }) {
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

      {expanded && (
        <div className="ml-5 mr-1 mt-1 mb-2 pl-2 border-l border-border/30 space-y-2">
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
