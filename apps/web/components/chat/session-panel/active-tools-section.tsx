'use client'

export function ActiveToolsSection({ tools }: { tools: Array<{ toolCallId: string; toolName: string; title?: string }> }) {
  if (tools.length === 0) return null

  return (
    <>
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Running</div>
        <div className="space-y-1.5">
          {tools.map((tool) => (
            <div key={tool.toolCallId} className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[11px] text-foreground/80 font-medium">{tool.toolName}</span>
              {tool.title && <span className="text-[10px] text-muted-foreground/50 truncate">{tool.title}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-4 border-t border-border/20" />
    </>
  )
}
