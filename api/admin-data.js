const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvCommand(...args) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const contactsRaw = await kvCommand('LRANGE', 'contacts', '0', '-1');
  const volunteersRaw = await kvCommand('LRANGE', 'volunteers', '0', '-1');

  const contacts = (contactsRaw.result || []).map(item => JSON.parse(item));
  const volunteers = (volunteersRaw.result || []).map(item => JSON.parse(item));

  res.json({ contacts, volunteers });
};
