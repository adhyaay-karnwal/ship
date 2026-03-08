import type { UIMessage } from '@/lib/ai-elements-adapter'

export function formatAgentType(raw: string): string {
  if (!raw) return 'Agent'
  return raw
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getPhaseLabel(
  message: UIMessage,
  hasReasoning: boolean,
  hasSteps: boolean
): string {
  if (hasSteps && message.toolInvocations?.length) {
    const first = message.toolInvocations[0]
    const name = (first?.toolName ?? '').toLowerCase()
    if (/grep|search|glob|read_file|read/.test(name)) return 'Exploring'
    return 'Working'
  }
  if (hasReasoning) return 'Thinking'
  return 'Working'
}
