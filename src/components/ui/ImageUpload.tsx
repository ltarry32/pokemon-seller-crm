'use client'

// =============================================================
// IMAGE UPLOAD COMPONENT
// Handles card image selection, preview, and Supabase Storage
// upload. Upload fires immediately on file selection so the
// form submit only needs to store the returned URL string.
// =============================================================

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon, Loader2, X, RefreshCw } from 'lucide-react'
import { uploadCardImage, deleteCardImage } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  /** Existing image URL (from DB). Shown as initial preview. */
  currentUrl?: string | null
  /**
   * Called whenever the URL changes:
   * - string  → new image was uploaded
   * - null    → image was removed
   */
  onUrlChange: (url: string | null) => void
  className?: string
}

export function ImageUpload({ currentUrl, onUrlChange, className }: ImageUploadProps) {
  // Track the URL we're showing in the preview.
  // Starts as the existing DB value; updates after upload.
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [dragging,   setDragging]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync whenever the parent changes currentUrl — covers both:
  //   • picker selection (replacing an existing image)
  //   • initial prefill from the DB on the edit page
  // React bails out automatically if the value is the same as what's
  // already in state, so this never causes an extra paint.
  useEffect(() => {
    setPreviewUrl(currentUrl ?? null)
  }, [currentUrl])

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)

    const result = await uploadCardImage(file)
    setUploading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    // If we're replacing a previously-uploaded image (not the
    // original DB value), clean it up from storage.
    if (previewUrl && previewUrl !== currentUrl) {
      deleteCardImage(previewUrl) // fire-and-forget; non-critical
    }

    setPreviewUrl(result.url)
    onUrlChange(result.url)
  }

  const handleRemove = () => {
    // If the preview is a freshly-uploaded image (not yet persisted
    // to the DB via form submit), remove it from storage now.
    if (previewUrl && previewUrl !== currentUrl) {
      deleteCardImage(previewUrl)
    }
    setPreviewUrl(null)
    onUrlChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {previewUrl ? (
        /* ── Preview state ── */
        <div className="relative group">
          <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
            <Image
              src={previewUrl}
              alt="Card image preview"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Replace button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Replace image"
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Replace
          </button>
        </div>
      ) : (
        /* ── Drop-zone state ── */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload card image"
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200',
            uploading
              ? 'pointer-events-none opacity-60 border-zinc-700'
              : dragging
                ? 'border-brand-500 bg-brand-500/5 cursor-copy'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30 cursor-pointer',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
              <p className="text-xs text-zinc-500">Uploading…</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-zinc-600" />
              <p className="text-xs text-zinc-500">Click or drag to add card image</p>
              <p className="text-[10px] text-zinc-700">JPG · PNG · WEBP · Max 5 MB</p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="text-red-500">⚠</span> {error}
        </p>
      )}
    </div>
  )
}
