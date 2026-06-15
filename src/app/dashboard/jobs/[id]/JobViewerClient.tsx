'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PipelineStatus } from '@/components/pipeline/PipelineStatus'
import { DownloadPanel } from '@/components/downloads/DownloadPanel'

type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'EXPIRED'

// Lazy-load Three.js viewer (client only, no SSR)
const ThreeViewer = dynamic(
  () => import('@/components/viewer/ThreeViewer').then(m => ({ default: m.ThreeViewer })),
  { ssr: false, loading: () => <ViewerSkeleton /> }
)

interface JobData {
  status: JobStatus
  stage: string
  inputName: string
  pagesCount: number
  creditsUsed: number
  drawingType?: string
  errorMsg?: string
}

interface FullJob extends JobData {
  id: string
  processingMs?: number
  outputUrls?: Record<string, string>
}

interface Props {
  jobId: string
  initialJob: JobData
}

export function JobViewerClient({ jobId, initialJob }: Props) {
  const [job, setJob]         = useState(initialJob)
  const [fullJob, setFullJob] = useState<FullJob | null>(null)
  const [gltfUrl, setGltfUrl] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  // SSE subscription for real-time updates
  useEffect(() => {
    if (job.status === 'COMPLETE' || job.status === 'FAILED') {
      // Already done — fetch full job data
      fetch(`/api/jobs/${jobId}`)
        .then(r => r.json())
        .then(data => {
          setFullJob(data)
          if (data.outputUrls?.gltf) setGltfUrl(data.outputUrls.gltf)
        })
      return
    }

    const es = new EventSource(`/api/jobs/${jobId}/stream`)
    esRef.current = es

    es.onmessage = (e) => {
      const update = JSON.parse(e.data)
      setJob(prev => ({ ...prev, ...update }))

      if (update.status === 'COMPLETE' || update.status === 'FAILED') {
        es.close()
        // Fetch full job with signed URLs
        fetch(`/api/jobs/${jobId}`)
          .then(r => r.json())
          .then(data => {
            setFullJob(data)
            if (data.outputUrls?.gltf) setGltfUrl(data.outputUrls.gltf)
          })
      }
    }

    return () => es.close()
  }, [jobId, job.status])

  const isProcessing = job.status === 'QUEUED' || job.status === 'PROCESSING'
  const isComplete   = job.status === 'COMPLETE'
  const isFailed     = job.status === 'FAILED'

  return (
    <div className="space-y-6">
      {/* Status row */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-[#E2EEF8] truncate max-w-lg">
          {job.inputName}
        </h1>
        <StatusBadge status={job.status} />
        {job.drawingType && (
          <span className="text-xs font-mono text-[#6B8FAF] bg-[#101E35] px-2 py-1 rounded-md border border-[rgba(0,200,232,0.1)]">
            {job.drawingType}
          </span>
        )}
      </div>

      {/* Main content: 3D viewer + pipeline status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3D Viewer or placeholder */}
        <div className="card p-0 overflow-hidden aspect-square lg:aspect-auto lg:h-[520px]">
          {isComplete && gltfUrl ? (
            <ThreeViewer gltfUrl={gltfUrl} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
              {isProcessing && (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center">
                    <span className="text-[#8B5CF6] text-2xl animate-spin">&#10227;</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[#E2EEF8] font-medium">Generating 3D model</p>
                    <p className="text-[#6B8FAF] text-sm mt-1">Your viewer will appear here when ready</p>
                  </div>
                </>
              )}
              {isFailed && (
                <div className="text-center">
                  <p className="text-[#EF4444] font-medium">Processing failed</p>
                  <p className="text-[#6B8FAF] text-sm mt-1">{job.errorMsg ?? 'An error occurred'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Pipeline status + info */}
        <div className="space-y-4">
          {/* Pipeline progress */}
          <div className="card p-6">
            <p className="section-label">Processing pipeline</p>
            <PipelineStatus stage={job.stage} status={job.status} />
          </div>

          {/* Job metadata */}
          {(fullJob || isComplete) && (
            <div className="card p-6 space-y-3">
              <p className="section-label">Details</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#6B8FAF]">Processing time</p>
                  <p className="text-[#E2EEF8] font-mono">
                    {fullJob?.processingMs ? `${(fullJob.processingMs / 1000).toFixed(1)}s` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[#6B8FAF]">Pages</p>
                  <p className="text-[#E2EEF8] font-mono">{job.pagesCount}</p>
                </div>
                <div>
                  <p className="text-[#6B8FAF]">Credits used</p>
                  <p className="text-[#E2EEF8] font-mono">{job.creditsUsed}</p>
                </div>
                <div>
                  <p className="text-[#6B8FAF]">Drawing type</p>
                  <p className="text-[#E2EEF8] font-mono capitalize">
                    {job.drawingType ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Downloads */}
      {isComplete && fullJob?.outputUrls && (
        <DownloadPanel outputUrls={fullJob.outputUrls} inputName={job.inputName} />
      )}
    </div>
  )
}

function ViewerSkeleton() {
  return (
    <div className="w-full h-full bg-[#101E35] animate-pulse rounded-xl" />
  )
}
