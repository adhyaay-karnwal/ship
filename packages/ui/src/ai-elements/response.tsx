'use client'

import * as React from 'react'
import { cn } from '../utils'

interface ResponseProps {
  children: React.ReactNode
  className?: string
}

export function Response({ children, className }: ResponseProps) {
  return (
    <div className={cn('prose-sm text-[14.5px] leading-relaxed break-words max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}>
      {children}
    </div>
  )
}
