'use client'

export function OpenCodeLink({ url }: { url: string }) {
  if (!url) return null

  return (
    <>
      <div className="mx-4 border-t border-border/20" />
      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">OpenCode</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 hover:text-primary hover:underline truncate text-[11px] font-mono block"
          title={url}
        >
          {(() => {
            try {
              const parsed = new URL(url)
              const path = parsed.pathname.length > 20 ? parsed.pathname.slice(0, 17) + '...' : parsed.pathname
              return parsed.host + path
            } catch {
              return url.replace(/^https?:\/\//, '').slice(0, 30)
            }
          })()}
        </a>
      </div>
    </>
  )
}
