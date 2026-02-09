'use client'

import { useState } from 'react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@ship/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, GithubIcon } from '@hugeicons/core-free-icons'
import { useComposer } from './composer-context'


export function RepoSelector() {
  const { selectedRepo, onRepoSelect, repos, reposLoading } = useComposer()
  const [repoSearch, setRepoSearch] = useState('')
  const filteredRepos = repoSearch
    ? repos.filter((r) => r.fullName.toLowerCase().includes(repoSearch.toLowerCase()))
    : repos

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 px-2 sm:px-3 rounded-full gap-1.5">
            <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
            <span className="max-w-[100px] sm:max-w-[150px] truncate text-sm">
              {selectedRepo ? selectedRepo.fullName : 'Select repo'}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="text-muted-foreground size-3.5"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[280px]">
        <div className="p-2 pb-1">
          <Input
            placeholder="Search repos..."
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
        <div className="max-h-[250px] overflow-y-auto">
          {reposLoading ? (
            <div className="p-3 text-center text-sm text-muted-foreground">Loading repos...</div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">No repos found</div>
          ) : (
            <DropdownMenuGroup>
              {filteredRepos.slice(0, 100).map((repo) => (
                <DropdownMenuItem key={repo.id} onClick={() => onRepoSelect(repo)}>
                  <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
                  <span className="truncate flex-1">{repo.fullName}</span>
                  {repo.private && <span className="text-[10px] text-muted-foreground">private</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
