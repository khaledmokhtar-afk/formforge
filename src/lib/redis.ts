import Redis from 'ioredis'

const getRedisUrl = () => {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL is not defined')
  return url
}

export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})
