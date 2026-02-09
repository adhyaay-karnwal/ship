'use client'

import { cn } from '@ship/ui/utils'

interface MCPServer {
  name: string
  connected: boolean
  enabled: boolean
}

export function MCPStatusSection({ connectors }: { connectors: MCPServer[] }) {
  if (connectors.length === 0) return null

  return (
    <>
      <div className="mx-4 border-t border-border/20" />
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Connectors</div>
        <div className="space-y-1.5">
          {connectors.map((server) => (
            <div key={server.name} className="flex items-center gap-2">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  server.connected && server.enabled
                    ? 'bg-green-500'
                    : server.connected
                      ? 'bg-yellow-500'
                      : 'bg-muted-foreground/30',
                )}
              />
              <span className="text-[11px] text-foreground/70 capitalize">{server.name}</span>
              <span className="text-[9px] text-muted-foreground/40 ml-auto">
                {server.connected && server.enabled
                  ? 'active'
                  : server.connected
                    ? 'disabled'
                    : 'disconnected'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
