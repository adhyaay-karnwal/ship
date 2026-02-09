'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createReconnectingWebSocket } from '@/lib/websocket'
import { API_URL } from '@/lib/config'
import {
  type UIMessage,
  createAssistantPlaceholder,
  processPartUpdated,
  type ToolInvocation,
} from '@/lib/ai-elements-adapter'
import { parseSSEEvent } from '@/lib/sse-parser'
import type { MessagePartUpdatedEvent } from '@/lib/sse-types'

interface UseSubagentStreamParams {
  sessionId: string | null
}

interface UseSubagentStreamResult {
  messages: UIMessage[]
  isStreaming: boolean
  status: string
}

export function useSubagentStream({ sessionId }: UseSubagentStreamParams): UseSubagentStreamResult {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [status, setStatus] = useState('Connecting...')
  const wsRef = useRef<ReturnType<typeof createReconnectingWebSocket> | null>(null)
  const messageIdRef = useRef<string | null>(null)
  const textRef = useRef('')
  const reasoningRef = useRef('')

  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      setIsStreaming(false)
      setStatus('')
      return
    }

    // Create a placeholder assistant message for streaming into
    const placeholder = createAssistantPlaceholder()
    messageIdRef.current = placeholder.id
    setMessages([placeholder])
    setIsStreaming(true)
    setStatus('Connecting...')
    textRef.current = ''
    reasoningRef.current = ''

    const wsUrl = `${API_URL.replace('http', 'ws')}/sessions/${sessionId}/websocket`

    wsRef.current = createReconnectingWebSocket({
      url: wsUrl,
      onMessage: (data: unknown) => {
        const event = data as Record<string, unknown>
        const parsed = parseSSEEvent(event)
        if (!parsed) return

        if (parsed.type === 'message.part.updated') {
          const mpu = parsed as MessagePartUpdatedEvent
          const msgId = messageIdRef.current
          if (!msgId) return

          setMessages((prev) =>
            processPartUpdated(
              mpu.properties.part,
              mpu.properties.delta,
              msgId,
              prev,
              textRef,
              reasoningRef,
            ),
          )
          setStatus('Working...')
        }

        if (parsed.type === 'done' || parsed.type === 'session.idle') {
          setIsStreaming(false)
          setStatus('Complete')
        }

        if (parsed.type === 'session.error' || parsed.type === 'error') {
          setIsStreaming(false)
          setStatus('Error')
        }
      },
      onStatusChange: (wsStatus) => {
        if (wsStatus === 'connected') {
          setStatus('Connected')
        }
      },
    })

    return () => {
      wsRef.current?.disconnect()
      wsRef.current = null
    }
  }, [sessionId])

  return { messages, isStreaming, status }
}
