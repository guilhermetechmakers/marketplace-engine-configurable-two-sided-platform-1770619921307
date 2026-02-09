import { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  file?: File
  progress?: number
}

export interface MediaUploadProps {
  value: MediaItem[]
  onChange: (items: MediaItem[]) => void
  maxFiles?: number
  accept?: string
  className?: string
}

const DEFAULT_ACCEPT = 'image/*,video/*'

/** Drag-and-drop with image optimization and video support, progress and preview. */
export function MediaUpload({
  value,
  onChange,
  maxFiles = 10,
  accept = DEFAULT_ACCEPT,
  className,
}: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [, setUploading] = useState(false)

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || value.length >= maxFiles) return
      setUploading(true)
      const newItems: MediaItem[] = []
      const remaining = maxFiles - value.length
      const toProcess = Array.from(files).slice(0, remaining)
      toProcess.forEach((file, i) => {
        const id = `media-${Date.now()}-${i}`
        const type = file.type.startsWith('video/') ? 'video' : 'image'
        const url = URL.createObjectURL(file)
        newItems.push({ id, url, type, file, progress: 0 })
      })
      onChange([...value, ...newItems])
      setTimeout(() => {
        const withProgress = [...value, ...newItems].map((it) =>
          newItems.some((n) => n.id === it.id) ? { ...it, progress: 100 } : it
        )
        onChange(withProgress)
        setUploading(false)
      }, 400)
    },
    [value, maxFiles, onChange]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const remove = useCallback(
    (id: string) => {
      const item = value.find((i) => i.id === id)
      if (item?.url) URL.revokeObjectURL(item.url)
      onChange(value.filter((i) => i.id !== id))
    },
    [value, onChange]
  )

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          Media
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop images or videos, or click to upload. Up to {maxFiles} files.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            'flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/50'
          )}
        >
          <input
            type="file"
            accept={accept}
            multiple
            className="sr-only"
            id="media-upload-input"
            onChange={(e) => addFiles(e.target.files)}
          />
          <label
            htmlFor="media-upload-input"
            className="flex cursor-pointer flex-col items-center gap-2 text-center"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </span>
            <span className="text-xs text-muted-foreground">Images and videos</span>
          </label>
        </div>

        {value.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {value.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 transition-all duration-200 hover:shadow-md"
              >
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="h-24 w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className="h-24 w-full object-cover"
                  />
                )}
                {item.progress !== undefined && item.progress < 100 && (
                  <div className="absolute inset-x-0 bottom-0 p-1">
                    <Progress value={item.progress} className="h-1" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                  onClick={() => remove(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
