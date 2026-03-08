'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  cn,
} from '@ship/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import type { AgentModeId } from '@/lib/api/types'
import { useComposer } from './composer-context'

export function ModeToggle() {
  const { mode, onModeChange, availableModes, isStreaming, activeSessionId } = useComposer()

  const currentMode = availableModes.find((m) => m.id === mode)

  if (availableModes.length <= 1) {
    return (
      <span
        className={cn(
          'text-[11px] px-1.5 py-0.5',
          activeSessionId ? 'text-muted-foreground' : 'text-zinc-500',
        )}
      >
        {currentMode?.label ?? mode}
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            disabled={isStreaming}
            className={cn(
              'h-auto gap-1 px-1.5 py-0.5 text-[11px] disabled:opacity-60 disabled:pointer-events-none',
              activeSessionId
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
            )}
          >
            {currentMode?.label ?? mode}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 shrink-0 opacity-60"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[140px]">
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => onModeChange(value as AgentModeId)}
        >
          {availableModes.map((m) => (
            <DropdownMenuRadioItem key={m.id} value={m.id}>
              {m.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
