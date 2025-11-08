"use client"

import { useState } from 'react'
import { MessageSquare, Code, Eye, Columns, Sparkles } from 'lucide-react'
import { MonacoEditor } from './monaco-editor'
import { BrowserPreview } from './browser-preview'
import { FileTreeView, FileNode, buildFileTree } from './file-tree-view'
import { cn } from '@/lib/utils'

export type WorkspaceViewMode = 'chat' | 'code' | 'preview' | 'split'

interface WorkspaceViewV2Props {
  files: { path: string; content: string }[]
  previewUrl?: string
  previewHtml?: string
  onFileChange?: (path: string, content: string) => void
  className?: string
  chatComponent?: React.ReactNode
}

export function WorkspaceViewV2({
  files,
  previewUrl,
  previewHtml,
  onFileChange,
  className,
  chatComponent
}: WorkspaceViewV2Props) {
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

  const viewModes = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat', color: 'from-sky-500 to-blue-600' },
    { id: 'code' as const, icon: Code, label: 'Code', color: 'from-purple-500 to-pink-600' },
    { id: 'preview' as const, icon: Eye, label: 'Preview', color: 'from-green-500 to-emerald-600' },
    { id: 'split' as const, icon: Columns, label: 'Split', color: 'from-orange-500 to-red-600' },
  ]

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50 to-white", className)}>
      {/* Modern View Mode Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-semibold text-gray-700">Workspace</span>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            const isActive = viewMode === mode.id
            
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  "text-sm font-medium",
                  isActive
                    ? "bg-white shadow-md text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-lg opacity-10 bg-gradient-to-r",
                    mode.color
                  )} />
                )}
                <Icon className={cn(
                  "h-4 w-4 relative z-10",
                  isActive && `bg-gradient-to-r ${mode.color} bg-clip-text text-transparent`
                )} />
                <span className="hidden sm:inline relative z-10">{mode.label}</span>
              </button>
            )
          })}
        </div>

        {selectedFile && viewMode !== 'chat' && (
          <div className="text-xs text-gray-500 font-mono max-w-xs truncate">
            {selectedFile.path}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree (shown when not in chat mode) */}
        {viewMode !== 'chat' && files.length > 0 && (
          <div className="w-64 border-r border-gray-200 bg-white">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Files
              </h3>
            </div>
            <FileTreeView
              files={fileTree}
              selectedPath={selectedFilePath}
              onFileSelect={handleFileSelect}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'chat' && (
            <div className="h-full animate-in fade-in duration-300">
              {chatComponent}
            </div>
          )}

          {viewMode === 'code' && (
            <div className="h-full animate-in fade-in duration-300">
              {selectedFile ? (
                <MonacoEditor
                  file={selectedFile}
                  onChange={handleEditorChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center p-8">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse" />
                      <Code className="relative h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      No file selected
                    </p>
                    <p className="text-xs text-gray-500">
                      Select a file from the tree to start editing
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="h-full animate-in fade-in duration-300">
              <BrowserPreview url={previewUrl} html={previewHtml} />
            </div>
          )}

          {viewMode === 'split' && (
            <div className="h-full flex animate-in fade-in duration-300">
              <div className="flex-1 border-r border-gray-200">
                {selectedFile ? (
                  <MonacoEditor
                    file={selectedFile}
                    onChange={handleEditorChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                    <p className="text-sm text-gray-500">
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
