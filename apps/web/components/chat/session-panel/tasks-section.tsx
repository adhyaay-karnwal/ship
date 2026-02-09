'use client'

import type { UIMessage } from '@/lib/ai-elements-adapter'
import type { Todo } from './types'
import { TaskItem } from './task-item'

export function TasksSection({ todos, messages }: { todos: Todo[]; messages: UIMessage[] }) {
  const activeTodos = todos.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const completedTodos = todos.filter((t) => t.status === 'completed' || t.status === 'cancelled')
  const allTodos = [...activeTodos, ...completedTodos]

  if (allTodos.length === 0) return null

  return (
    <>
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">
          Tasks ({activeTodos.length}/{allTodos.length})
        </div>
        <div className="space-y-0.5">
          {allTodos.map((todo) => (
            <TaskItem key={todo.id} todo={todo} messages={messages} />
          ))}
        </div>
      </div>
      <div className="mx-4 border-t border-border/20" />
    </>
  )
}
