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
  )
}
