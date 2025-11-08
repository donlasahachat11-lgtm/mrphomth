"use client"

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BrowserPreviewProps {
  url?: string
  html?: string
  className?: string
}

export function BrowserPreview({ url, html, className }: BrowserPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
  }, [url, html, key])

  const handleLoad = () => {
    setLoading(false)
    setError(null)
  }

  const handleError = () => {
    setLoading(false)
    setError('Failed to load preview')
  }

  const handleRefresh = () => {
    setKey(prev => prev + 1)
  }

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  // Generate preview from HTML
  const previewSrc = html
    ? `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    : url

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Browser Controls */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          
          <div className="flex-1 min-w-0 px-3 py-1.5 bg-background border border-border rounded text-xs text-muted-foreground truncate">
            {url || 'Preview'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-7 w-7"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          
          {url && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenExternal}
              className="h-7 w-7"
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <span className="text-sm font-medium">Failed to load preview</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {previewSrc && (
          <iframe
            key={key}
            ref={iframeRef}
            src={previewSrc}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            onLoad={handleLoad}
            onError={handleError}
            title="Preview"
          />
        )}

        {!previewSrc && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">No preview available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start building to see live preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
