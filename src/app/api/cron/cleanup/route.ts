import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { deleteFromS3 } from '@/lib/s3'

// Vercel cron: runs daily at 2am
// Configured in vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 2 * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Find expired complete/failed jobs
  const oldJobs = await prisma.job.findMany({
    where: {
      createdAt: { lt: sevenDaysAgo },
      status:    { in: ['COMPLETE', 'FAILED'] },
    },
    select: { id: true, inputKey: true, outputKeys: true },
  })

  let deletedFiles = 0
  let deletedJobs  = 0

  for (const job of oldJobs) {
    // Delete R2 files
    const keysToDelete = [
      job.inputKey,
      `intermediate/${job.id}/parsed.json`,
      `intermediate/${job.id}/geometry.json`,
    ]

    if (job.outputKeys) {
      const out = job.outputKeys as Record<string, string>
      keysToDelete.push(...Object.values(out).filter(Boolean))
    }

    for (const key of keysToDelete) {
      try {
        await deleteFromS3(key)
        deletedFiles++
      } catch {
        // Ignore missing files
      }
    }

    // Mark as expired
    await prisma.job.update({
      where: { id: job.id },
      data:  { status: 'EXPIRED', outputKeys: Prisma.JsonNull },
    })
    deletedJobs++
  }

  return NextResponse.json({
    cleaned: deletedJobs,
    filesDeleted: deletedFiles,
    timestamp: new Date().toISOString(),
  })
}
