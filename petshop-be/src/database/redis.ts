import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})

redisClient.on('error', (error) => console.error('Redis Client Error', error))

redisClient
  .connect()
  .then(() => console.log('Redis connected successfully!'))
  .catch((err) => console.error('Error connecting to Redis:', err))

export default redisClient
