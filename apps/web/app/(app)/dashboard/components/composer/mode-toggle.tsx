'use client'

import { Button, cn } from '@ship/ui'
import { useComposer } from './composer-context'

export function ModeToggle() {
  const { mode, onModeChange } = useComposer()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        onClick={() => onModeChange('build')}
        className={cn(
          'h-auto text-[10px] px-1.5 py-0.5 rounded-md transition-all',
          mode === 'build'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground/50 hover:text-muted-foreground',
        )}
      >
        build
      </Button>
      <Button
        variant="ghost"
        onClick={() => onModeChange('plan')}
        className={cn(
          'h-auto text-[10px] px-1.5 py-0.5 rounded-md transition-all',
          mode === 'plan'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground/50 hover:text-muted-foreground',
        )}
      >
        plan
      </Button>
    </div>
  )
}
