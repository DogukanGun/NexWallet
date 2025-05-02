import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const accessToken = req.headers.authorization?.split(' ')[1];
    
    if (!accessToken) {
        return res.status(400).json({ error: 'Missing authorization token' });
    }

    try {
        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/wallet`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error creating wallet:', error);
        return res.status(500).json({ error: 'Failed to create wallet' });
    }
}