import { Worker } from 'bullmq'
import { processJob } from './job-processor'

console.log('FormForge worker starting...')

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')

const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379'),
  password: redisUrl.password || undefined,
  username: redisUrl.username || undefined,
  tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  maxRetriesPerRequest: null as null,
}

const worker = new Worker(
  'pdf-processing',
  async (job) => {
    console.log(`[Worker] Job ${job.data.jobId} picked up — attempt ${job.attemptsMade + 1}`)
    await processJob(job.data.jobId, job.data.inputKey, job.data.pagesCount)
  },
  {
    connection,
    concurrency: 2,
  }
)

worker.on('completed', (job) => {
  if (job) console.log(`[Worker] Job ${job.data.jobId} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.data.jobId} failed:`, err.message)
})

process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down gracefully...')
  await worker.close()
  process.exit(0)
})
