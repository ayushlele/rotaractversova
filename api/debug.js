module.exports = async function handler(req, res) {
  const envVars = Object.keys(process.env).filter(k => 
    k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS')
  );
  res.json({ envVars });
};
