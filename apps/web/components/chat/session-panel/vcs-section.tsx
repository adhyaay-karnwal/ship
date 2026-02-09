'use client'

import type { SessionInfo as SSESessionInfo } from '@/lib/sse-types'

export function VCSSection({ sessionInfo }: { sessionInfo?: SSESessionInfo }) {
  if (!sessionInfo) return null

  const vcs = (sessionInfo as any).vcs as
    | { branch?: string; dirty?: boolean; ahead?: number; behind?: number; prUrl?: string }
    | undefined

  if (!vcs?.branch) return null

  return (
    <div className="px-3 py-2 border-t border-border/10">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground/50">Branch</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-foreground/70 font-mono truncate max-w-[120px]">{vcs.branch}</span>
          {vcs.dirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70 shrink-0" title="Modified" />
          )}
        </div>
      </div>
      {(vcs.ahead !== undefined && vcs.ahead > 0 || vcs.behind !== undefined && vcs.behind! > 0) && (
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/40 font-mono">
          {vcs.ahead !== undefined && vcs.ahead > 0 && <span>&uarr;{vcs.ahead}</span>}
          {vcs.behind !== undefined && vcs.behind > 0 && <span>&darr;{vcs.behind}</span>}
        </div>
      )}
      {vcs.prUrl && (
        <a
          href={vcs.prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-primary/60 hover:text-primary hover:underline truncate block mt-0.5"
        >
          View PR
        </a>
      )}
    </div>
  )
}
