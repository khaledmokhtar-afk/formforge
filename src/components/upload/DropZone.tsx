'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function DropZone({ userCredits = 0 }: { userCredits?: number }) {
  const router = useRouter()
  const [file, setFile]           = useState<File | null>(null)
  const [pages, setPages]         = useState(1)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setError(null)
    // Approximate page count from file size (1MB ~ 5 pages rough estimate)
    setPages(Math.max(1, Math.ceil(f.size / (200 * 1024))))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (e) => setError(e[0]?.errors[0]?.message ?? 'File rejected'),
  })

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('pagesCount', pages.toString())
      const res  = await fetch('/api/jobs/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      router.push(`/dashboard/jobs/${data.jobId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const hasEnoughCredits = userCredits >= pages

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-[#00C8E8] bg-[rgba(0,200,232,0.05)] shadow-[0_0_24px_rgba(0,200,232,0.15)]'
            : file
            ? 'border-[rgba(16,217,140,0.5)] bg-[rgba(16,217,140,0.05)]'
            : 'border-[rgba(0,200,232,0.2)] hover:border-[rgba(0,200,232,0.4)] hover:bg-[rgba(0,200,232,0.05)]'
          }
        `}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-xl bg-[rgba(16,217,140,0.1)] border border-[rgba(16,217,140,0.3)] flex items-center justify-center mx-auto">
              <span className="text-[#10D98C] text-2xl">&#10003;</span>
            </div>
            <p className="font-medium text-[#E2EEF8]">{file.name}</p>
            <p className="text-[#6B8FAF] text-sm">
              {(file.size / 1024 / 1024).toFixed(2)} MB &middot; approx. {pages} page{pages !== 1 ? 's' : ''}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="text-[#344B63] hover:text-[#EF4444] text-sm mt-2 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-xl bg-[rgba(0,200,232,0.1)] border border-[rgba(0,200,232,0.2)] flex items-center justify-center mx-auto">
              <span className="text-[#00C8E8] text-2xl">&uarr;</span>
            </div>
            <div>
              <p className="text-[#E2EEF8] font-medium">
                {isDragActive ? 'Drop it here' : 'Drop your PDF here'}
              </p>
              <p className="text-[#6B8FAF] text-sm mt-1">or click to browse &mdash; max 50MB</p>
            </div>
            <p className="text-[#344B63] text-xs">
              Supports architectural, mechanical, civil, and structural drawings
            </p>
          </div>
        )}
      </div>

      {/* Credit info */}
      {file && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-[#6B8FAF] text-sm">Credits needed</p>
            <p className="text-[#E2EEF8] font-display font-semibold text-xl mt-0.5">
              {pages} credit{pages !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#6B8FAF] text-sm">Your balance</p>
            <p className={`font-display font-semibold text-xl mt-0.5 ${hasEnoughCredits ? 'text-[#10D98C]' : 'text-[#EF4444]'}`}>
              {userCredits} credits
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl p-4 text-[#EF4444] text-sm">
          {error}
        </div>
      )}

      {/* Action */}
      {file && (
        <div className="flex gap-3">
          {hasEnoughCredits ? (
            <Button onClick={handleSubmit} loading={uploading} className="flex-1">
              Convert drawing &rarr;
            </Button>
          ) : (
            <a href="/dashboard/credits" className="btn-primary flex-1 text-center">
              Buy credits to continue
            </a>
          )}
        </div>
      )}
    </div>
  )
}
