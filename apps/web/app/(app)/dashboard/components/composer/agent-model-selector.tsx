'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@ship/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { useComposer } from './composer-context'

export function AgentModelSelector() {
  const {
    selectedAgent,
    selectedModel,
    onAgentSelect,
    onModelSelect,
    agents,
    agentsLoading,
    modelsLoading,
    isStreaming,
    activeSessionId,
  } = useComposer()

  const loading = agentsLoading || modelsLoading

  // Build trigger label: "AgentName ModelName" or just "AgentName" if single model
  let triggerLabel = 'Select agent'
  if (loading) {
    triggerLabel = 'Loading...'
  } else if (selectedAgent) {
    const agentModels = selectedAgent.models ?? []
    if (agentModels.length <= 1 || !selectedModel) {
      triggerLabel = selectedAgent.name
    } else {
      triggerLabel = `${selectedAgent.name} ${selectedModel.name}`
    }
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
            {triggerLabel}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 shrink-0 opacity-60"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-[260px]">
        {agents.map((agent, agentIdx) => {
          const agentModels = agent.models ?? []

          return (
            <DropdownMenuGroup key={agent.id}>
              {agentIdx > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs font-medium">
                {agent.name}
              </DropdownMenuLabel>
              {agentModels.length > 0 ? (
                <DropdownMenuRadioGroup
                  value={selectedAgent?.id === agent.id ? selectedModel?.id || '' : ''}
                  onValueChange={(modelId) => {
                    const model = agentModels.find((m) => m.id === modelId)
                    if (model) {
                      if (selectedAgent?.id !== agent.id) {
                        onAgentSelect(agent)
                      }
                      onModelSelect(model)
                    }
                  }}
                >
                  {agentModels.map((model) => (
                    <DropdownMenuRadioItem key={model.id} value={model.id}>
                      {model.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              ) : (
                <DropdownMenuRadioGroup
                  value={selectedAgent?.id || ''}
                  onValueChange={() => onAgentSelect(agent)}
                >
                  <DropdownMenuRadioItem value={agent.id}>
                    {agent.name}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              )}
            </DropdownMenuGroup>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
