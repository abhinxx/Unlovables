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

    // For Vercel Serverless Functions, pass the entire `req` object.
    // The Vercel Blob SDK will correctly handle the stream.
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// To handle file uploads, we need to disable the default bodyParser.
export const config = {
  api: {
    bodyParser: false,
  },
}; 