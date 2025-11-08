'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Image, FileText, Code, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content: string | ArrayBuffer | null
  preview?: string
}

interface FileUploadV2Props {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: string[]
  className?: string
}

export function FileUploadV2({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = ['image/*', 'text/*', 'application/pdf', '.txt', '.md', '.json', '.csv'],
  className
}: FileUploadV2Props) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    
    // Check file count
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`สามารถอัพโหลดได้สูงสุด ${maxFiles} ไฟล์`)
      return
    }
    
    // Process files
    const newFiles: UploadedFile[] = []
    
    for (const file of acceptedFiles) {
      // Check file size
      if (file.size > maxSize) {
        setError(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด ${formatFileSize(maxSize)})`)
        continue
      }
      
      // Read file content
      const content = await readFileContent(file)
      
      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }
      
      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        preview
      })
    }
    
    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [uploadedFiles, maxFiles, maxSize, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
  })

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== id)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
    setError(null)
  }

  const getFileIcon = (type: string) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />
    if (type.startsWith('text/')) return <FileText className="h-5 w-5" />
    if (type.includes('json') || type.includes('javascript')) return <Code className="h-5 w-5" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'group relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
          'hover:border-sky-400 hover:bg-sky-50/50',
          isDragActive 
            ? 'border-sky-500 bg-sky-100/50 scale-[1.02]' 
            : 'border-gray-300 bg-gray-50/50',
          'p-8'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Icon */}
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
            isDragActive
              ? 'bg-gradient-to-br from-sky-500 to-purple-600 shadow-lg shadow-sky-300/50 scale-110'
              : 'bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-sky-400 group-hover:to-purple-500 group-hover:shadow-lg group-hover:shadow-sky-200/50'
          )}>
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              isDragActive ? 'text-white' : 'text-gray-600 group-hover:text-white'
            )} />
          </div>
          
          {/* Text */}
          <div className="space-y-2">
            <p className={cn(
              'text-base font-semibold transition-colors',
              isDragActive ? 'text-sky-700' : 'text-gray-700'
            )}>
              {isDragActive ? 'วางไฟล์ที่นี่...' : 'ลากไฟล์มาวางที่นี่'}
            </p>
            <p className="text-sm text-gray-500">
              หรือคลิกเพื่อเลือกไฟล์
            </p>
            <p className="text-xs text-gray-400">
              รองรับ: รูปภาพ, เอกสาร, โค้ด (สูงสุด {formatFileSize(maxSize)})
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            ไฟล์ที่อัพโหลด ({uploadedFiles.length}/{maxFiles})
          </p>
          
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-sky-300 hover:shadow-md"
              >
                {/* Preview or Icon */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={`Preview of ${file.name}`}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function readFileContent(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    
    if (file.type.startsWith('text/') || file.type.includes('json')) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
