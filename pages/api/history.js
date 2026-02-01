import { db } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const history = await db.getUserGenerations(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      data: history,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: history.length
      }
    });

  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
