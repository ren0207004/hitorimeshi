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
    let action, key, value;

    if (req.method === 'GET') {
      action = req.query.action;
      key = req.query.key;
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      action = body.action;
      key = body.key;
      value = body.value;
    }

    const redisKey = `user:${uid}:${key}`;

    if (action === 'get') {
      const response = await fetch(`${restUrl}/get/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${restToken}` }
      });
      const data = await response.json();
      return res.status(200).json({ value: data.result });
    }

    if (action === 'set') {
      const response = await fetch(`${restUrl}/set/${encodeURIComponent(redisKey)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${restToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([value])
      });
      const data = await response.json();
      return res.status(200).json({ ok: true, result: data.result });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
