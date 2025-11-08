"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Paperclip, X, FileText, Image as ImageIcon, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content: string | ArrayBuffer | null
  preview?: string
}

interface FileUploadButtonProps {
  onFilesSelected: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
}

export function FileUploadButton({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'text/*': ['.txt', '.md', '.json'],
    'application/json': ['.json'],
    'text/plain': ['.txt', '.md'],
    'text/markdown': ['.md'],
    'application/javascript': ['.js', '.jsx'],
    'text/typescript': ['.ts', '.tsx'],
    'text/css': ['.css'],
    'text/html': ['.html']
  }
}: FileUploadButtonProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = []

    for (const file of acceptedFiles) {
      const reader = new FileReader()
      
      const fileData = await new Promise<UploadedFile>((resolve) => {
        reader.onload = () => {
          const uploadedFile: UploadedFile = {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result,
            preview: file.type.startsWith('image/') ? reader.result as string : undefined
          }
          resolve(uploadedFile)
        }

        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file)
        } else {
          reader.readAsText(file)
        }
      })

      newFiles.push(fileData)
    }

    const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles)
    setUploadedFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }, [uploadedFiles, maxFiles, onFilesSelected])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    noClick: true,
    noKeyboard: true
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.includes('javascript') || type.includes('typescript')) return <Code className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="relative">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={open}
          className={cn(
            "h-10 w-10",
            isDragActive && "bg-primary/10"
          )}
          title="แนบไฟล์"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg p-2 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                  {getFileIcon(file.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
