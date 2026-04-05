import { createClient } from '@upstash/redis'

const redis = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Get userId from Authorization header
  const uid = req.headers['authorization']?.replace('Bearer ', '')
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const { action, key } = req.method === 'GET'
    ? req.query
    : (typeof req.body === 'string' ? JSON.parse(req.body) : req.body)

  const redisKey = `user:${uid}:${key}`

  try {
    if (req.method === 'GET' && action === 'get') {
      const value = await redis.get(redisKey)
      return res.status(200).json({ value })
    }

    if (req.method === 'POST' && action === 'set') {
      const { value } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      await redis.set(redisKey, value)
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
