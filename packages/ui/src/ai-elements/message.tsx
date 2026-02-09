import * as React from 'react'
import { cn } from '../utils'

interface MessageProps {
  role: 'user' | 'assistant' | 'system'
  children: React.ReactNode
  avatar?: React.ReactNode
  className?: string
}

export function Message({ role, children, className }: MessageProps) {
  if (role === 'system') {
    return (
      <div className={cn('py-3', className)}>
        {children}
      </div>
    )
  }

  if (role === 'user') {
    return (
      <div className={cn('flex justify-end py-3', className)}>
        <div className="inline-block rounded-2xl bg-secondary text-secondary-foreground px-5 py-3 max-w-[80%]">
          <div className="text-[15px]">{children}</div>
        </div>
      </div>
    )
  }

  // Assistant — flush left, no wrapper padding
  return (
    <div className={cn('py-4 space-y-3', className)}>
      {children}
    </div>
  )
}
