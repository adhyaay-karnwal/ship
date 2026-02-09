'use client'

import * as React from 'react'
import { cn } from '../utils'

interface SubagentToolProps {
  toolCallId: string
  agentType: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  duration?: number
  childTools?: { name: string; status: string }[]
  onNavigate: (toolCallId: string) => void
  className?: string
}

function AgentIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70"
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
  )
}

function StatusIndicator({ status }: { status: SubagentToolProps['status'] }) {
  if (status === 'in_progress') {
    return (
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
    )
  }
  if (status === 'completed') {
    return <span className="flex h-2 w-2 shrink-0 rounded-full bg-green-500" />
  }
  if (status === 'failed') {
    return <span className="flex h-2 w-2 shrink-0 rounded-full bg-red-500" />
  }
  return null
}

function formatAgentType(raw: string): string {
  if (!raw) return 'Agent'
  return raw
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function SubagentTool({
  toolCallId,
  agentType,
  description,
  status,
  duration,
  childTools,
  onNavigate,
  className,
}: SubagentToolProps) {
  const durationLabel = duration !== undefined
    ? (duration >= 60000 ? `${Math.floor(duration / 60000)}m ${((duration % 60000) / 1000).toFixed(0)}s` : duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`)
    : null

  const formattedType = formatAgentType(agentType)

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-lg border border-border/30 bg-muted/40 overflow-hidden hover:bg-muted/60 transition-colors text-left',
        className,
      )}
      onClick={() => onNavigate(toolCallId)}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2 min-h-[36px]">
        <AgentIcon />
        <span className="text-sm font-medium text-foreground/90 shrink-0">{formattedType}</span>
        <span className="text-xs text-muted-foreground/50 truncate font-mono">{description}</span>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {durationLabel && (
            <span className="text-xs text-muted-foreground/60">{durationLabel}</span>
          )}
          <StatusIndicator status={status} />
          <svg
            className="w-4 h-4 text-muted-foreground/40"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {/* Optional child tools summary */}
      {childTools && childTools.length > 0 && (
        <div className="border-t border-border/20 px-3.5 py-2 flex flex-wrap gap-2">
          {childTools.map((tool, i) => (
            <span
              key={i}
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-mono',
                tool.status === 'completed'
                  ? 'bg-green-500/10 text-green-600'
                  : tool.status === 'error' || tool.status === 'failed'
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-muted text-muted-foreground/60',
              )}
            >
              {tool.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
