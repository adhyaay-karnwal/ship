'use client'

import { useComposer } from './composer-context'
import { RepoSelector as SharedRepoSelector } from '@/components/repo-selector'

/** Repo selector wired to ComposerContext - used in dashboard composer */
export function ComposerRepoSelector() {
  const {
    activeSessionId,
    selectedRepo,
    onRepoSelect,
    repos,
    reposLoading,
    reposLoadMore,
    reposHasMore,
    reposLoadingMore,
  } = useComposer()

  return (
    <SharedRepoSelector
      repos={repos}
      selectedRepo={selectedRepo}
      onRepoSelect={onRepoSelect}
      isLoading={reposLoading}
      loadMore={reposLoadMore}
      hasMore={reposHasMore}
      isLoadingMore={reposLoadingMore}
      placeholder="Select repo"
      triggerClassName={
        activeSessionId
          ? 'h-auto gap-1 px-1.5 py-0.5 text-[11px] rounded-md text-muted-foreground hover:text-foreground [&_span]:text-[11px] [&_svg]:size-3 [&_svg]:opacity-60'
          : 'h-auto gap-1 px-1.5 py-0.5 text-[11px] rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 [&_span]:text-[11px] [&_svg]:size-3 [&_svg]:opacity-60'
      }
    />
  )
}
