'use client'

import { Button, cn } from '@ship/ui'
import type { AgentModeId } from '@/lib/api/types'
import { useComposer } from './composer-context'

export function ModeToggle() {
  const { mode, onModeChange, availableModes } = useComposer()

  return (
    <div className="flex items-center gap-1">
      {availableModes.map((m) => (
        <Button
          key={m.id}
          variant="ghost"
          onClick={() => onModeChange(m.id as AgentModeId)}
          className={cn(
            'h-auto text-[10px] px-1.5 py-0.5 rounded-md transition-all',
            mode === m.id
              ? 'text-foreground font-medium'
              : 'text-muted-foreground/50 hover:text-muted-foreground',
          )}
        >
          {m.label}
        </Button>
      ))}
    </div>
  )
}
