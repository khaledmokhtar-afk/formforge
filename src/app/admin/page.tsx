import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [totalJobs, completeJobs, failedJobs, totalUsers, recentJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: 'COMPLETE' } }),
    prisma.job.count({ where: { status: 'FAILED'   } }),
    prisma.user.count(),
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take:    20,
      include: { user: { select: { email: true } } },
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-[#E2EEF8]">Admin Panel</h1>
        <a href="/dashboard" className="text-[#6B8FAF] hover:text-[#00C8E8] text-sm transition-colors">
          &larr; Dashboard
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Jobs',  value: totalJobs },
          { label: 'Complete',    value: completeJobs },
          { label: 'Failed',      value: failedJobs },
          { label: 'Total Users', value: totalUsers },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
            <p className="text-[#6B8FAF] text-sm">{stat.label}</p>
            <p className="font-display text-3xl font-bold text-[#00C8E8] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent jobs table */}
      <div className="card p-6">
        <p className="section-label">Recent jobs</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6B8FAF] text-left border-b border-[rgba(0,200,232,0.1)]">
                <th className="pb-3 pr-4 font-medium">Job ID</th>
                <th className="pb-3 pr-4 font-medium">File</th>
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Time</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,200,232,0.05)]">
              {recentJobs.map(job => (
                <tr key={job.id} className="hover:bg-[rgba(16,30,53,0.5)]">
                  <td className="py-3 pr-4 font-mono text-[#344B63] text-xs">
                    <a href={`/dashboard/jobs/${job.id}`} className="hover:text-[#00C8E8] transition-colors">
                      {job.id.slice(0, 16)}&hellip;
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-[#E2EEF8] truncate max-w-[160px]">{job.inputName}</td>
                  <td className="py-3 pr-4 text-[#6B8FAF]">{job.user?.email ?? 'anonymous'}</td>
                  <td className="py-3 pr-4">
                    <span className={`status-badge-${job.status.toLowerCase()}`}>{job.status.toLowerCase()}</span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-[#344B63] text-xs">
                    {job.processingMs ? `${(job.processingMs / 1000).toFixed(1)}s` : '—'}
                  </td>
                  <td className="py-3 font-mono text-[#344B63] text-xs">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
