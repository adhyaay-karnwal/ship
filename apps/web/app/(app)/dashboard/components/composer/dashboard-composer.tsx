'use client'

import { cn } from '@ship/ui'
import { ClientOnly } from '@/components/client-only'
import { ComposerProvider, type ComposerContextValue } from './composer-context'
import { ComposerTextarea } from './composer-textarea'
import { ComposerRepoSelector } from './repo-selector'
import { BranchSelector } from './branch-selector'
import { SubmitButton } from './submit-button'
import { AgentModelSelector } from './agent-model-selector'
import { ModeToggle } from './mode-toggle'

interface DashboardComposerProps {
  /** All shared state consumed by composer sub-components via context */
  context: ComposerContextValue
  /** When true, use normal flow instead of absolute centering (for mobile with session list below). Default false. */
  compactLayout?: boolean
}

export function DashboardComposer({ context, compactLayout = false }: DashboardComposerProps) {
  const { activeSessionId } = context

  return (
    <ComposerProvider value={context}>
      <div
        className={cn(
          'w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          activeSessionId
            ? 'mt-auto pb-3 px-3 sm:pb-4 sm:px-6'
            : compactLayout
              ? 'flex flex-col px-3 pt-4 pb-2'
              : 'absolute inset-0 flex items-start justify-center px-3 sm:px-6 pt-[6vh] sm:pt-[8vh]',
        )}
      >
        <div
          className={cn(
            'w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
            activeSessionId ? 'max-w-3xl mx-auto' : compactLayout ? 'w-full' : 'max-w-[540px]',
          )}
        >
          {/* Repo + branch outside the card, on top (Cursor-style) */}
          {!activeSessionId && (
            <div className="flex items-center gap-1 pb-2 flex-wrap">
              <ClientOnly>
                <ComposerRepoSelector />
              </ClientOnly>
              <ClientOnly>
                <BranchSelector />
              </ClientOnly>
            </div>
          )}
          <div
            className={cn(
              'rounded-2xl border overflow-hidden transition-all',
              activeSessionId
                ? 'bg-card/95 backdrop-blur-sm border-border/40 shadow-md focus-within:border-border/60 focus-within:shadow-lg'
                : 'rounded-3xl bg-zinc-900 border-zinc-700/50 shadow-lg focus-within:shadow-xl focus-within:ring-2 focus-within:ring-white/10',
            )}
          >
            {/* Textarea area */}
            <div className={cn('px-3', activeSessionId ? 'pt-4 pb-2' : 'pt-2 pb-2')}>
              <ComposerTextarea />

              {/* Bottom row inside the card: selectors on left, submit on right */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-0.5 min-w-0">
                  {activeSessionId && (
                    <ClientOnly>
                      <ComposerRepoSelector />
                    </ClientOnly>
                  )}
                  <ClientOnly>
                    <AgentModelSelector />
                  </ClientOnly>
                  <ClientOnly>
                    <ModeToggle />
                  </ClientOnly>
                </div>
                <SubmitButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComposerProvider>
  )
}
