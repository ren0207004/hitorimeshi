export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const uid = req.headers['authorization']?.replace('Bearer ', '');
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const restUrl = process.env.KV_REST_API_URL;
  const restToken = process.env.KV_REST_API_TOKEN;

  if (!restUrl || !restToken) {
    return res.status(500).json({ error: 'Storage not configured' });
  }

  try {
    const body = req.method === 'GET' ? req.query : (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    const { action, key, value } = body;
    const redisKey = `user:${uid}:${key}`;

    if (action === 'get') {
      const response = await fetch(`${restUrl}/get/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${restToken}` }
      });
      const data = await response.json();
      return res.status(200).json({ value: data.result });
    }

    if (action === 'set') {
      await fetch(`${restUrl}/set/${encodeURIComponent(redisKey)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${restToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([value])
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
