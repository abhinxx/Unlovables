// Vercel serverless function to check ByteDance video generation task status
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET for status checking
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { taskId, apiKey } = req.query;

        if (!apiKey || !taskId) {
            res.status(400).json({ error: 'API key and task ID required' });
            return;
        }

        // Forward request to ByteDance API
        const response = await fetch(`https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('ByteDance API error:', data);
            res.status(response.status).json(data);
            return;
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Status proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 