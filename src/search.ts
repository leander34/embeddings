import { redis, redisVectorStore } from './redis-store'
async function search() {
   await redis.connect()

   const response = await redisVectorStore.similaritySearchWithScore('Que é tokenização?', 1)

   console.log(response)

   await redis.disconnect()
}

search()