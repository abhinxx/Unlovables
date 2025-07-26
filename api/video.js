// Vercel serverless function to proxy ByteDance video generation API
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST for video generation
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { apiKey, model, content } = req.body;

        if (!apiKey) {
            res.status(400).json({ error: 'API key required' });
            return;
        }

        // Forward request to ByteDance API
        const response = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'seedance-1-0-lite-i2v-250428',
                content: content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('ByteDance API error:', data);
            res.status(response.status).json(data);
            return;
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 