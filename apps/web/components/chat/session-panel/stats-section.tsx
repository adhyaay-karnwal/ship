'use client'

import { useMemo } from 'react'
import { cn } from '@ship/ui/utils'
import type { UIMessage } from '@/lib/ai-elements-adapter'
import type { SessionPanelProps, TokenInfo } from './types'
import { StatRow, formatTokenCount, formatCost, formatDate, formatRelative } from './helpers'
import { ContextBreakdownBar } from './context-breakdown'

export function StatsSection({
  sessionId,
  model,
  repo,
  tokens,
  cost,
  messages,
  sessionInfo,
}: Pick<SessionPanelProps, 'sessionId' | 'model' | 'repo' | 'tokens' | 'cost' | 'sessionInfo'> & { messages: UIMessage[] }) {
  const messageCounts = useMemo(() => {
    const user = messages.filter((m) => m.role === 'user').length
    const assistant = messages.filter((m) => m.role === 'assistant').length
    return { total: messages.length, user, assistant }
  }, [messages])

  const totalTokens = tokens ? tokens.input + tokens.output + tokens.reasoning : 0
  const contextLimit = tokens?.contextLimit || 200000
  const usagePercent = tokens ? Math.min((totalTokens / contextLimit) * 100, 100) : 0

  return (
    <>
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

      {tokens && totalTokens > 0 && (
        <>
          <div className="mx-4 border-t border-border/20" />
          <div className="px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Context Breakdown</div>
            <ContextBreakdownBar tokens={tokens} />
          </div>
        </>
      )}
    </>
  )
}
