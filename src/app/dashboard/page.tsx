'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Link from 'next/link'

interface Job {
  id: string
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'EXPIRED'
  stage: string
  inputName: string
  pagesCount: number
  drawingType: string | null
  createdAt: string
  completedAt: string | null
  processingMs: number | null
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false))
  }, [])

  const name = session?.user?.name?.split(' ')[0]
  const credits = session?.user?.credits ?? 0

  const completedThisWeek = jobs.filter(j => {
    if (j.status !== 'COMPLETE' || !j.completedAt) return false
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(j.completedAt) > weekAgo
  }).length

  const totalPages = jobs.reduce((sum, j) => sum + j.pagesCount, 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#E2EEF8]">
            {name ? `Good morning, ${name}` : 'Welcome back'}
          </h1>
          <p className="text-[#6B8FAF] mt-1">Here&apos;s what&apos;s happening with your drawings.</p>
        </div>
        <div className="bg-[#101E35] border border-[rgba(0,200,232,0.2)] rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-[#00C8E8]">&#9889;</span>
          <span className="text-[#E2EEF8] font-medium text-sm">{credits} credits</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-[#00C8E8] font-display font-bold text-3xl">{jobs.length}</p>
          <p className="text-[#6B8FAF] text-sm mt-1">Total Jobs</p>
        </div>
        <div className="card p-6">
          <p className="text-[#00C8E8] font-display font-bold text-3xl">{completedThisWeek}</p>
          <p className="text-[#6B8FAF] text-sm mt-1">Completed this week</p>
        </div>
        <div className="card p-6">
          <p className="text-[#00C8E8] font-display font-bold text-3xl">{totalPages}</p>
          <p className="text-[#6B8FAF] text-sm mt-1">Pages processed</p>
        </div>
      </div>

      {/* Quick upload CTA */}
      <div className="border-2 border-dashed border-[rgba(0,200,232,0.2)] rounded-2xl p-8 text-center mb-8">
        <p className="text-[#E2EEF8] font-medium text-lg mb-3">Ready to convert your next drawing?</p>
        <Link
          href="/dashboard/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          Upload a PDF &rarr;
        </Link>
      </div>

      {/* Recent jobs table */}
      <div>
        <h2 className="font-display text-xl font-semibold text-[#E2EEF8] mb-4">Recent jobs</h2>
        {loading ? (
          <div className="card p-8 text-center text-[#6B8FAF]">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-[rgba(0,200,232,0.1)] border border-[rgba(0,200,232,0.2)] flex items-center justify-center mx-auto mb-4">
              <span className="text-[#00C8E8] text-2xl">&#128196;</span>
            </div>
            <p className="text-[#E2EEF8] font-medium">No conversions yet</p>
            <p className="text-[#6B8FAF] text-sm mt-1">Upload your first PDF to get started.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,200,232,0.1)]">
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">File name</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Type</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Status</th>
                  <th className="text-left text-[#6B8FAF] font-medium px-4 py-3">Created</th>
                  <th className="text-right text-[#6B8FAF] font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b border-[rgba(0,200,232,0.06)] hover:bg-[rgba(0,200,232,0.03)]">
                    <td className="px-4 py-3 text-[#E2EEF8] font-mono text-xs truncate max-w-[200px]">{job.inputName}</td>
                    <td className="px-4 py-3 text-[#6B8FAF]">{job.drawingType ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 text-[#6B8FAF]">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/jobs/${job.id}`} className="text-[#00C8E8] hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
