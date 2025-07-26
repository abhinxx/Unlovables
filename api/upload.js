import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const blob = await put(filename, req.body, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 