import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { JobViewerClient } from './JobViewerClient'

export const dynamic = 'force-dynamic'

export default async function JobPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const job     = await prisma.job.findUnique({ where: { id: params.id } })
  if (!job) notFound()

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-[#6B8FAF] hover:text-[#E2EEF8] text-sm transition-colors">
              &larr; Dashboard
            </a>
            <span className="text-[#344B63]">/</span>
            <span className="text-[#6B8FAF] text-sm font-mono">{params.id}</span>
          </div>
          <div className="text-[#6B8FAF] text-sm">{job.inputName}</div>
        </div>

        <JobViewerClient
          jobId={params.id}
          initialJob={{
            status: job.status as 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'EXPIRED',
            stage: job.stage,
            inputName: job.inputName,
            pagesCount: job.pagesCount,
            creditsUsed: job.creditsUsed,
            drawingType: job.drawingType ?? undefined,
            errorMsg: job.errorMsg ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
