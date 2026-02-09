'use client'

import type { SessionInfo as SSESessionInfo } from '@/lib/sse-types'

export function VCSSection({ sessionInfo }: { sessionInfo?: SSESessionInfo }) {
  if (!sessionInfo) return null

  // Extract VCS info from session info if available
  const vcs = (sessionInfo as any).vcs as
    | { branch?: string; dirty?: boolean; ahead?: number; behind?: number; prUrl?: string }
    | undefined

  if (!vcs?.branch) return null

  return (
    <>
      <div className="mx-4 border-t border-border/20" />
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Version Control</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px]">
            <svg className="w-3 h-3 text-muted-foreground/50 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12M6 21a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM6 15a9 9 0 009-9" />
            </svg>
            <span className="text-foreground/70 font-mono truncate">{vcs.branch}</span>
            {vcs.dirty && (
              <span className="text-[9px] text-yellow-500 font-medium">modified</span>
            )}
          </div>
          {(vcs.ahead !== undefined && vcs.ahead > 0 || vcs.behind !== undefined && vcs.behind! > 0) && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
              {vcs.ahead !== undefined && vcs.ahead > 0 && <span>&uarr;{vcs.ahead}</span>}
              {vcs.behind !== undefined && vcs.behind > 0 && <span>&darr;{vcs.behind}</span>}
            </div>
          )}
          {vcs.prUrl && (
            <a
              href={vcs.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary/70 hover:text-primary hover:underline truncate block"
            >
              View PR
            </a>
          )}
        </div>
      </div>
    </>
  )
}
