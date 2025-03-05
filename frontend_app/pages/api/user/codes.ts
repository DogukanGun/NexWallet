import { NextApiRequest, NextApiResponse } from 'next';
import { withAdmin } from '@/middleware/withAdmin';

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Add cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/codes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error calling backend:', error);
        return res.status(500).json({ error: 'Failed to fetch codes' });
    }
}

export default withAdmin(handler);