import { Queue } from 'bullmq'

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')

export const jobQueue = new Queue('pdf-processing', {
  connection: {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port || '6379'),
    password: redisUrl.password || undefined,
    username: redisUrl.username || undefined,
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  },
})
