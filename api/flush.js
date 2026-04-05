export default async function handler(req, res) {
  const restUrl = process.env.KV_REST_API_URL;
  const restToken = process.env.KV_REST_API_TOKEN;
  
  if (!restUrl || !restToken) {
    return res.status(500).json({ error: 'Not configured' });
  }

  try {
    const response = await fetch(`${restUrl}/flushall`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const data = await response.json();
    return res.status(200).json({ ok: true, result: data });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
