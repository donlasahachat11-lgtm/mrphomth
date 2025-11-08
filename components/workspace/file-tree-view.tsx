"use client"

import { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  FileCode,
  FileJson,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
  size?: number
  modified?: Date
}

interface FileTreeViewProps {
  files: FileNode[]
  selectedPath?: string
  onFileSelect?: (node: FileNode) => void
  className?: string
}

interface FileTreeNodeProps {
  node: FileNode
  level: number
  selectedPath?: string
  onSelect?: (node: FileNode) => void
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="h-4 w-4 text-blue-500" />
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-500" />
    case 'md':
    case 'txt':
      return <FileText className="h-4 w-4 text-gray-500" />
    case 'css':
    case 'scss':
      return <FileCode className="h-4 w-4 text-purple-500" />
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-500" />
    default:
      return <File className="h-4 w-4 text-muted-foreground" />
  }
}

function FileTreeNode({ node, level, selectedPath, onSelect }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const isSelected = selectedPath === node.path
  const hasChildren = node.children && node.children.length > 0

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded)
    } else {
      onSelect?.(node)
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-sm transition-colors",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/15"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Icon */}
        {node.type === 'folder' && (
          <div className="flex-shrink-0 w-4 h-4">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        {node.type === 'file' && <div className="w-4" />}

        {/* File/Folder Icon */}
        <div className="flex-shrink-0">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </div>

        {/* Name */}
        <span className="text-sm truncate flex-1">{node.name}</span>
      </div>

      {/* Children */}
      {node.type === 'folder' && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTreeView({
  files,
  selectedPath,
  onFileSelect,
  className
}: FileTreeViewProps) {
  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-2">
        <div className="mb-2 px-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase">
            Files
          </h3>
        </div>
        
        {files.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No files yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                level={0}
                selectedPath={selectedPath}
                onSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// Helper function to build file tree from flat file list
export function buildFileTree(files: { path: string; content: string }[]): FileNode[] {
  const root: FileNode[] = []
  const nodeMap = new Map<string, FileNode>()

  // Sort files by path
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

  for (const file of sortedFiles) {
    const parts = file.path.split('/').filter(Boolean)
    let currentPath = ''
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFile = i === parts.length - 1

      if (!nodeMap.has(currentPath)) {
        const node: FileNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : []
        }

        nodeMap.set(currentPath, node)
        currentLevel.push(node)
      }

      if (!isFile) {
        const folderNode = nodeMap.get(currentPath)!
        currentLevel = folderNode.children!
      }
    }
  }

  return root
}
