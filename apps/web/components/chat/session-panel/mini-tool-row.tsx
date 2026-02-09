'use client'

import { useMemo } from 'react'
import { cn } from '@ship/ui/utils'
import type { ToolInvocation } from '@/lib/ai-elements-adapter'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function ToolStatusDot({ state }: { state: string }) {
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

export function MiniToolRow({ tool }: { tool: ToolInvocation }) {
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
