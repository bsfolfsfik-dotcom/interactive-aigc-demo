import { db } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const configs = await db.getUserConfigs(userId);

    res.status(200).json({ data: configs });

  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function handlePost(req, res) {
  try {
    const { userId, name, config, tags = [] } = req.body;

    if (!userId || !name || !config) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const savedConfig = await db.saveConfig(userId, name, config, tags);

    res.status(201).json({ data: savedConfig });

  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
