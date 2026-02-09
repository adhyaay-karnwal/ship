'use client'

import { useMemo } from 'react'
import type { DiffSummary } from './types'

export function ChangesSection({ diffs }: { diffs: DiffSummary[] }) {
  const totalChanges = useMemo(() => {
    if (!diffs || diffs.length === 0) return null
    return diffs.reduce(
      (acc, d) => ({ add: acc.add + d.additions, del: acc.del + d.deletions }),
      { add: 0, del: 0 },
    )
  }, [diffs])

  if (!diffs || diffs.length === 0 || !totalChanges) return null

  return (
    <div className="px-3 py-2 border-t border-border/10">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground/50">Changes</span>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-green-500">+{totalChanges.add}</span>
          <span className="text-red-500">-{totalChanges.del}</span>
          <span className="text-muted-foreground/40">{diffs.length}f</span>
        </div>
      </div>
      <div className="space-y-0.5">
        {diffs.slice(0, 6).map((d, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/60 gap-2">
            <span className="truncate flex-1">{(d.filename || '').split('/').pop() || 'unknown'}</span>
            <div className="flex items-center gap-1 shrink-0 text-[8px]">
              <span className="text-green-500/70">+{d.additions}</span>
              <span className="text-red-500/70">-{d.deletions}</span>
            </div>
          </div>
        ))}
        {diffs.length > 6 && <div className="text-[9px] text-muted-foreground/30 mt-0.5">+{diffs.length - 6} more</div>}
      </div>
    </div>
  )
}
