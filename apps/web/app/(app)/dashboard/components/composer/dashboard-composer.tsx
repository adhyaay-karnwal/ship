'use client'

import { cn } from '@ship/ui'
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ship/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { AttachmentIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import type { GitHubRepo, ModelInfo } from '@/lib/api/types'
import { DashboardStats } from '@/components/dashboard-stats'
import { ComposerProvider, type ComposerContextValue } from './composer-context'
import { ComposerTextarea } from './composer-textarea'
import { ComposerFooter } from './composer-footer'
import { RepoSelector } from './repo-selector'
import { SubmitButton } from './submit-button'

interface DashboardComposerProps {
  activeSessionId: string | null
  prompt: string
  onPromptChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  selectedRepo: GitHubRepo | null
  onRepoSelect: (repo: GitHubRepo) => void
  repos: GitHubRepo[]
  reposLoading: boolean
  selectedModel: ModelInfo | null
  onModelSelect: (model: ModelInfo) => void
  modelsLoading: boolean
  groupedByProvider: Record<string, ModelInfo[]>
  mode: 'build' | 'plan'
  onModeChange: (mode: 'build' | 'plan') => void
  onSubmit: () => void
  onStop: () => void
  isCreating: boolean
  isStreaming: boolean
  messageQueueLength: number
  stats: {
    sessionsPastWeek: number
    messagesPastWeek: number
    activeRepos: number
  }
  canSubmit: boolean
}

export function DashboardComposer(props: DashboardComposerProps) {
  const { activeSessionId, stats } = props

  const contextValue: ComposerContextValue = {
    activeSessionId: props.activeSessionId,
    prompt: props.prompt,
    onPromptChange: props.onPromptChange,
    onKeyDown: props.onKeyDown,
    selectedRepo: props.selectedRepo,
    onRepoSelect: props.onRepoSelect,
    repos: props.repos,
    reposLoading: props.reposLoading,
    selectedModel: props.selectedModel,
    onModelSelect: props.onModelSelect,
    modelsLoading: props.modelsLoading,
    groupedByProvider: props.groupedByProvider,
    mode: props.mode,
    onModeChange: props.onModeChange,
    onSubmit: props.onSubmit,
    onStop: props.onStop,
    isCreating: props.isCreating,
    isStreaming: props.isStreaming,
    messageQueueLength: props.messageQueueLength,
    canSubmit: props.canSubmit,
  }

  return (
    <ComposerProvider value={contextValue}>
      <div
        className={cn(
          'w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          activeSessionId
            ? 'mt-auto pb-3 px-3 sm:pb-4 sm:px-6'
            : 'absolute inset-0 flex items-center justify-center px-3 sm:px-6',
        )}
      >
        <div
          className={cn(
            'w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
            activeSessionId ? 'max-w-3xl mx-auto' : 'max-w-[540px]',
          )}
        >
          <div
            className={cn(
              'rounded-2xl border bg-card/95 backdrop-blur-sm overflow-hidden transition-all',
              activeSessionId
                ? 'border-border/40 shadow-md focus-within:border-border/60 focus-within:shadow-lg'
                : 'rounded-3xl border-border/60 shadow-lg focus-within:shadow-xl focus-within:ring-2 focus-within:ring-foreground/10',
            )}
          >
            {/* Textarea area */}
            <div className={cn('p-4', activeSessionId ? 'pb-2' : 'pb-3')}>
              <ComposerTextarea />

              {/* Non-active session: action buttons inline with textarea */}
              {!activeSessionId && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="rounded-full">
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="start" className="w-[220px]">
                        <DropdownMenuItem>
                          <HugeiconsIcon icon={AttachmentIcon} strokeWidth={2} />
                          Add files
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <RepoSelector />
                  </div>
                  <SubmitButton />
                </div>
              )}
            </div>

            <ComposerFooter />
          </div>

          {!activeSessionId && (
            <div className="mt-6 space-y-6">
              <DashboardStats stats={stats} />
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1 human prompting</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ComposerProvider>
  )
}
