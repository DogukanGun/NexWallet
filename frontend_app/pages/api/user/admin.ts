import { NextApiRequest, NextApiResponse } from 'next';

export type AdminPayload = {
    user_id: string;
    iat: number;
    exp: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { wallet_address, signature } = req.body;

        if (!wallet_address || !signature) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        try {
            const response = await fetch(`${process.env.BACKEND_API_URL}/auth/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wallet_address, signature }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error calling backend:', error);
            return res.status(500).json({ error: 'Failed to authenticate admin' });
        }
    } else if (req.method === 'GET') {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const response = await fetch(`${process.env.BACKEND_API_URL}/auth/admin`, {
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
            return res.status(500).json({ error: 'Failed to verify admin' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

export default handler;