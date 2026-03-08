'use client'

import * as React from 'react'
import { cn } from '../utils'
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

interface SessionSetupProps {
  steps: string[]
  isStreaming?: boolean
  defaultOpen?: boolean
  className?: string
}

function SessionSetupIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function SessionSetup({
  steps,
  isStreaming = false,
  defaultOpen = false,
  className,
}: SessionSetupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen || isStreaming)

  React.useEffect(() => {
    if (isStreaming) setIsOpen(true)
  }, [isStreaming])

  if (!steps.length) return null

  const label = 'Session setup'

  return (
    <CollapsiblePrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'rounded-lg border border-border/30 bg-muted/40 overflow-hidden',
          className,
        )}
      >
        <CollapsiblePrimitive.Trigger
          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-muted/60 transition-colors min-h-[36px] text-left"
        >
          <SessionSetupIcon />
          <span className="text-sm font-medium text-foreground/90 shrink-0">{label}</span>
          <span className="text-xs text-muted-foreground/60">{steps.length} steps</span>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <svg
              className={cn('w-3.5 h-3.5 text-muted-foreground/40 transition-transform', isOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Panel>
          <div className="border-t border-border/30 px-4 py-3">
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {steps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </CollapsiblePrimitive.Panel>
      </div>
    </CollapsiblePrimitive.Root>
  )
}
