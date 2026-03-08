'use client'

import * as React from 'react'
import { Conversation, ConversationScrollButton } from '@ship/ui'
import type { UIMessage, ToolInvocation } from '@/lib/ai-elements-adapter'
import { getStreamingStatus } from '@/lib/ai-elements-adapter'
import {
  extractSubagentSessionId,
  getSubagentType,
  getSubagentDescription,
  getSubagentFullPrompt,
  getSubagentResultText,
  extractChildToolsFromResult,
} from '@/lib/subagent/utils'
import { mapToolState } from '@/lib/ai-elements-adapter'
import { SubagentView, type SubagentViewState } from './subagent-view'
import type { TodoItem } from '../types'
import { formatAgentType } from './messages/helpers'
import { MessageItem, MessagesEmptyState } from './messages'

interface DashboardMessagesProps {
  activeSessionId: string | null
  messages: UIMessage[]
  isStreaming: boolean
  streamingMessageId: string | null
  streamStartTime: number | null
  streamingStatus?: string
  streamingStatusSteps?: string[]
  sessionTodos?: TodoItem[]
  onPermissionReply?: (permissionId: string, approved: boolean) => Promise<void>
}

export function DashboardMessages({
  activeSessionId,
  messages,
  isStreaming,
  streamingMessageId,
  streamStartTime,
  streamingStatus = '',
  streamingStatusSteps = [],
  sessionTodos = [],
  onPermissionReply,
}: DashboardMessagesProps) {
  const [subagentStack, setSubagentStack] = React.useState<SubagentViewState[]>([])
  const todoRenderedRef = React.useRef(false)

  if (!activeSessionId) return null

  todoRenderedRef.current = false
  const statusLabel = isStreaming
    ? getStreamingStatus(messages, streamingMessageId) || streamingStatus
    : ''
  const hasContent = messages.some((m) => m.content || m.toolInvocations?.length)

  const handleSubagentNavigate = (tool: ToolInvocation) => {
    const agentType = getSubagentType(tool) || String(tool.args?.subagent_type || 'Agent')
    const description = getSubagentDescription(tool) || String(tool.args?.description || '')
    const prompt = getSubagentFullPrompt(tool)
    const sessionId = extractSubagentSessionId(tool) || undefined
    const resultText = getSubagentResultText(tool) || undefined
    const childTools = extractChildToolsFromResult(tool)
    const toolStatus = mapToolState(tool.state)

    setSubagentStack((prev) => [
      ...prev,
      {
        toolCallId: tool.toolCallId,
        agentType: formatAgentType(agentType),
        description,
        prompt: prompt || undefined,
        resultText,
        sessionId,
        childTools: childTools.length > 0 ? childTools : undefined,
        toolStatus,
        duration: tool.duration,
      },
    ])
  }

  const handleSubagentBack = () => {
    setSubagentStack((prev) => prev.slice(0, -1))
  }

  if (subagentStack.length > 0) {
    const currentSubagent = subagentStack[subagentStack.length - 1]
    return (
      <SubagentView
        subagent={currentSubagent}
        onBack={handleSubagentBack}
        parentSessionId={activeSessionId}
      />
    )
  }

  return (
    <Conversation className="h-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
        {!hasContent && !isStreaming && <MessagesEmptyState />}

        <div className="space-y-6">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentlyStreaming={message.id === streamingMessageId}
              streamStartTime={streamStartTime}
              streamingStatusSteps={streamingStatusSteps}
              statusLabel={statusLabel}
              sessionTodos={sessionTodos}
              todoRenderedRef={todoRenderedRef}
              activeSessionId={activeSessionId}
              onPermissionReply={onPermissionReply}
              onSubagentNavigate={handleSubagentNavigate}
            />
          ))}
        </div>
      </div>

      <ConversationScrollButton />
    </Conversation>
  )
}
