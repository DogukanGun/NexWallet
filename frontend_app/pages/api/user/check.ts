import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        const { userId } = req.body;

        // Check if both userWallet and did are null
        if (!userId) {
            return res.status(400).json({ error: 'userId cannot be null' });
        }

        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in user check:', error);
        return res.status(500).json({ 
            error: 'User check failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}