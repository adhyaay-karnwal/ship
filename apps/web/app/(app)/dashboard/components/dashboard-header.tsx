'use client'

import { useSidebar, cn } from '@ship/ui'
import type { WebSocketStatus } from '@/lib/websocket'

interface DashboardHeaderProps {
  activeSessionId: string | null
  sessionTitle?: string
  wsStatus: WebSocketStatus
  sandboxStatus?: string
  rightSidebarOpen?: boolean
  onToggleRightSidebar?: () => void
}

const sandboxStatusConfig: Record<string, { label: string; color: string; pulse?: boolean }> = {
  active: { label: 'Active', color: 'text-green-600 dark:text-green-400' },
  provisioning: { label: 'Provisioning...', color: 'text-amber-600 dark:text-amber-400', pulse: true },
  resuming: { label: 'Resuming...', color: 'text-amber-600 dark:text-amber-400', pulse: true },
  paused: { label: 'Paused', color: 'text-muted-foreground/60' },
  error: { label: 'Error', color: 'text-red-600 dark:text-red-400' },
}

export function DashboardHeader({
  activeSessionId,
  sessionTitle,
  wsStatus,
  sandboxStatus,
  rightSidebarOpen,
  onToggleRightSidebar,
}: DashboardHeaderProps) {
  const { toggleSidebar } = useSidebar()

  const sbConfig = sandboxStatus ? sandboxStatusConfig[sandboxStatus] : null

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 relative z-10">
      {/* Left sidebar trigger */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
        title="Toggle sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </button>

      {/* Session title */}
      {activeSessionId && (
        <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0 flex-1">
          <span className="font-medium truncate">
            {sessionTitle || 'Untitled session'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {/* Sandbox status pill */}
        {activeSessionId && sbConfig && sandboxStatus !== 'unknown' && (
          <div className={cn('text-[10px] flex items-center gap-1.5 mr-2', sbConfig.color)}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              sandboxStatus === 'active' && 'bg-green-500',
              sandboxStatus === 'paused' && 'bg-muted-foreground/40',
              sandboxStatus === 'error' && 'bg-red-500',
              (sandboxStatus === 'provisioning' || sandboxStatus === 'resuming') && 'bg-amber-500 animate-pulse',
            )} />
            {sbConfig.label}
          </div>
        )}

        {/* WS status indicator */}
        {activeSessionId && wsStatus !== 'connected' && (
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {wsStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
          </div>
        )}

        {/* Right sidebar toggle */}
        {activeSessionId && onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className="p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
            title={rightSidebarOpen ? 'Hide context panel' : 'Show context panel'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M15 3v18" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
