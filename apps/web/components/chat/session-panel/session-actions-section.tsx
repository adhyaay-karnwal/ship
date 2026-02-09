'use client'

import { cn } from '@ship/ui/utils'
import type { TokenInfo } from './types'

interface SessionActionsSectionProps {
  tokens?: TokenInfo
  sessionCreatedAt?: number
}

export function SessionActionsSection({ tokens, sessionCreatedAt }: SessionActionsSectionProps) {
  const totalTokens = tokens ? tokens.input + tokens.output + tokens.reasoning : 0
  const contextLimit = tokens?.contextLimit || 200000
  const usagePercent = tokens ? (totalTokens / contextLimit) * 100 : 0

  // Only show if there's relevant info
  if (usagePercent < 50 && !sessionCreatedAt) return null

  return (
    <>
      <div className="mx-4 border-t border-border/20" />
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Session Health</div>
        <div className="space-y-1.5">
          {usagePercent >= 50 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 60 ? 'bg-yellow-500' : 'bg-green-500',
                  )}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <span className={cn(
                'text-[9px] font-medium shrink-0',
                usagePercent >= 80 ? 'text-red-500' : usagePercent >= 60 ? 'text-yellow-500' : 'text-muted-foreground/50',
              )}>
                {usagePercent.toFixed(0)}%
              </span>
            </div>
          )}
          {usagePercent >= 80 && (
            <p className="text-[9px] text-red-500/70">
              Context is {usagePercent >= 95 ? 'nearly full' : 'getting full'}. Consider compacting the session.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
