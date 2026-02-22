'use client'

import * as React from 'react'
import { cn } from '../utils'
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

const AUTO_CLOSE_DELAY = 1000

interface ReasoningProps {
  children: React.ReactNode
  isStreaming?: boolean
  className?: string
}

export function Reasoning({ children, isStreaming = false, className }: ReasoningProps) {
  const [isOpen, setIsOpen] = React.useState(isStreaming)
  const hasEverStreamedRef = React.useRef(isStreaming)
  const [hasAutoClosed, setHasAutoClosed] = React.useState(false)

  // Track if streaming has ever started
  React.useEffect(() => {
    if (isStreaming) {
      hasEverStreamedRef.current = true
    }
  }, [isStreaming])

  // Auto-open when streaming starts
  React.useEffect(() => {
    if (isStreaming && !isOpen) {
      setIsOpen(true)
    }
  }, [isStreaming, isOpen])

  // Auto-close 1s after streaming ends (only once)
  React.useEffect(() => {
    if (hasEverStreamedRef.current && !isStreaming && isOpen && !hasAutoClosed) {
      const timer = setTimeout(() => {
        setIsOpen(false)
        setHasAutoClosed(true)
      }, AUTO_CLOSE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [isStreaming, isOpen, hasAutoClosed])

  if (!children) return null

  return (
    <CollapsiblePrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn('rounded-lg border border-border/30 bg-muted/40 overflow-hidden', className)}>
        <CollapsiblePrimitive.Trigger
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/60 transition-colors"
        >
          {/* Brain icon */}
          <svg
            className="w-4 h-4 shrink-0 text-muted-foreground/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
          </svg>
          <span className="text-sm font-medium text-foreground/90 shrink-0">
            Reasoning
          </span>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {isStreaming ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-muted-foreground/30" />
            )}
            <svg
              className={cn('w-3.5 h-3.5 text-muted-foreground/40 transition-transform', isOpen && 'rotate-180')}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Panel>
          <div className="border-t border-border/30 px-4 py-3">
            <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
          </div>
        </CollapsiblePrimitive.Panel>
      </div>
    </CollapsiblePrimitive.Root>
  )
}
