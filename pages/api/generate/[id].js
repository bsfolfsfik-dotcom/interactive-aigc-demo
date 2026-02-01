import { db } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get generation
    const generation = await db.getGeneration(id);

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Get history steps
    const history = await db.getGenerationHistory(id);

    res.status(200).json({
      ...generation,
      history
    });

  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
