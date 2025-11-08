"use client"

import { useState } from 'react'
import { MessageSquare, Code, Eye, Columns } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoEditor, FileContent } from './monaco-editor'
import { BrowserPreview } from './browser-preview'
import { FileTreeView, FileNode, buildFileTree } from './file-tree-view'
import { cn } from '@/lib/utils'

export type WorkspaceViewMode = 'chat' | 'code' | 'preview' | 'split'

interface WorkspaceViewProps {
  files: { path: string; content: string }[]
  previewUrl?: string
  previewHtml?: string
  onFileChange?: (path: string, content: string) => void
  className?: string
  chatComponent?: React.ReactNode
}

export function WorkspaceView({
  files,
  previewUrl,
  previewHtml,
  onFileChange,
  className,
  chatComponent
}: WorkspaceViewProps) {
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('chat')
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(
    files[0]?.path
  )

  const fileTree = buildFileTree(files)
  const selectedFile = files.find(f => f.path === selectedFilePath)

  const handleFileSelect = (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFilePath(node.path)
      // Auto-switch to code view when file is selected
      if (viewMode === 'chat') {
        setViewMode('code')
      }
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (selectedFilePath && value !== undefined) {
      onFileChange?.(selectedFilePath, value)
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as WorkspaceViewMode)}>
          <TabsList>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="split" className="gap-2">
              <Columns className="h-4 w-4" />
              <span className="hidden sm:inline">Split</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedFile && viewMode !== 'chat' && (
          <div className="text-xs text-muted-foreground">
            {selectedFile.path}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree (shown when not in chat mode) */}
        {viewMode !== 'chat' && files.length > 0 && (
          <div className="w-64 border-r border-border bg-card">
            <FileTreeView
              files={fileTree}
              selectedPath={selectedFilePath}
              onFileSelect={handleFileSelect}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'chat' && (
            <div className="h-full">
              {chatComponent}
            </div>
          )}

          {viewMode === 'code' && (
            <div className="h-full">
              {selectedFile ? (
                <MonacoEditor
                  file={selectedFile}
                  onChange={handleEditorChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20">
                  <div className="text-center p-4">
                    <Code className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Select a file to edit
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="h-full">
              <BrowserPreview url={previewUrl} html={previewHtml} />
            </div>
          )}

          {viewMode === 'split' && (
            <div className="h-full flex">
              <div className="flex-1 border-r border-border">
                {selectedFile ? (
                  <MonacoEditor
                    file={selectedFile}
                    onChange={handleEditorChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Select a file to edit
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <BrowserPreview url={previewUrl} html={previewHtml} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
