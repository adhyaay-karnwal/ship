'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@ship/ui'
import { cn } from '@ship/ui/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { useComposer } from './composer-context'
import { useMemo } from 'react'

const COMMON_BRANCHES = ['main', 'master']

export function BranchSelector() {
  const { selectedRepo, selectedBranch, onBranchSelect, activeSessionId } = useComposer()

  const branches = useMemo(() => {
    const defaultBranch = selectedRepo?.defaultBranch
    const list = [...COMMON_BRANCHES]
    if (defaultBranch && !list.includes(defaultBranch)) {
      list.unshift(defaultBranch)
    }
    return list
  }, [selectedRepo?.defaultBranch])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              'h-auto gap-1 px-1.5 py-0.5 text-[11px] max-w-[120px] sm:max-w-[140px] truncate',
              activeSessionId
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
            )}
          >
            <span className="truncate">{selectedBranch}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 shrink-0 opacity-60"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuRadioGroup value={selectedBranch} onValueChange={onBranchSelect}>
          {branches.map((branch) => (
            <DropdownMenuRadioItem key={branch} value={branch}>
              {branch}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
