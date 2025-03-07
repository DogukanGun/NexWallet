import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        try {
            const response = await fetch(`${process.env.BACKEND_API_URL}/auth/token`, {
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
            console.error('Error calling backend:', error);
            return res.status(500).json({ error: 'Failed to generate token' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}